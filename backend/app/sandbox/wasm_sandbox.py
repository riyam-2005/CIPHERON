import time
from typing import Dict, Any, List, Optional, Callable
import wasmtime

ROT47_WAT = """
(module
  (memory (export "memory") 1 256)
  (global $heap (mut i32) (i32.const 1024))
  (func (export "allocate_wasm_memory") (param $size i32) (result i32)
    (local $ptr i32)
    (local.set $ptr (global.get $heap))
    (global.set $heap (i32.add (global.get $heap) (local.get $size)))
    (local.get $ptr)
  )
  (func (export "free_wasm_memory") (param $ptr i32))
  (func (export "decode_payload") (param $in_ptr i32) (param $in_len i32) (param $out_ptr i32) (param $max_out i32) (result i32)
    (local $i i32)
    (local $b i32)
    (if (i32.lt_u (local.get $max_out) (local.get $in_len))
      (then (return (i32.const -1)))
    )
    (local.set $i (i32.const 0))
    (block $break
      (loop $loop
        (br_if $break (i32.ge_u (local.get $i) (local.get $in_len)))
        (local.set $b (i32.load8_u (i32.add (local.get $in_ptr) (local.get $i))))
        (if (i32.and (i32.ge_u (local.get $b) (i32.const 33)) (i32.le_u (local.get $b) (i32.const 126)))
          (then
            (local.set $b (i32.add (i32.const 33) (i32.rem_u (i32.add (i32.sub (local.get $b) (i32.const 33)) (i32.const 47)) (i32.const 94))))
          )
        )
        (i32.store8 (i32.add (local.get $out_ptr) (local.get $i)) (local.get $b))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )
    (local.get $in_len)
  )
)
"""

REVERSE_BYTES_WAT = """
(module
  (memory (export "memory") 1 256)
  (global $heap (mut i32) (i32.const 1024))
  (func (export "allocate_wasm_memory") (param $size i32) (result i32)
    (local $ptr i32)
    (local.set $ptr (global.get $heap))
    (global.set $heap (i32.add (global.get $heap) (local.get $size)))
    (local.get $ptr)
  )
  (func (export "free_wasm_memory") (param $ptr i32))
  (func (export "decode_payload") (param $in_ptr i32) (param $in_len i32) (param $out_ptr i32) (param $max_out i32) (result i32)
    (local $i i32)
    (if (i32.lt_u (local.get $max_out) (local.get $in_len))
      (then (return (i32.const -1)))
    )
    (local.set $i (i32.const 0))
    (block $break
      (loop $loop
        (br_if $break (i32.ge_u (local.get $i) (local.get $in_len)))
        ;; out[i] = in[in_len - 1 - i]
        (i32.store8
          (i32.add (local.get $out_ptr) (local.get $i))
          (i32.load8_u (i32.add (local.get $in_ptr) (i32.sub (i32.sub (local.get $in_len) (i32.const 1)) (local.get $i))))
        )
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )
    (local.get $in_len)
  )
)
"""

NIBBLE_SWAP_WAT = """
(module
  (memory (export "memory") 1 256)
  (global $heap (mut i32) (i32.const 1024))
  (func (export "allocate_wasm_memory") (param $size i32) (result i32)
    (local $ptr i32)
    (local.set $ptr (global.get $heap))
    (global.set $heap (i32.add (global.get $heap) (local.get $size)))
    (local.get $ptr)
  )
  (func (export "free_wasm_memory") (param $ptr i32))
  (func (export "decode_payload") (param $in_ptr i32) (param $in_len i32) (param $out_ptr i32) (param $max_out i32) (result i32)
    (local $i i32)
    (local $b i32)
    (if (i32.lt_u (local.get $max_out) (local.get $in_len))
      (then (return (i32.const -1)))
    )
    (local.set $i (i32.const 0))
    (block $break
      (loop $loop
        (br_if $break (i32.ge_u (local.get $i) (local.get $in_len)))
        (local.set $b (i32.load8_u (i32.add (local.get $in_ptr) (local.get $i))))
        ;; swap high and low nibbles: ((b & 0x0F) << 4) | ((b & 0xF0) >> 4)
        (local.set $b (i32.or
          (i32.shl (i32.and (local.get $b) (i32.const 15)) (i32.const 4))
          (i32.shr_u (i32.and (local.get $b) (i32.const 240)) (i32.const 4))
        ))
        (i32.store8 (i32.add (local.get $out_ptr) (local.get $i)) (local.get $b))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )
    (local.get $in_len)
  )
)
"""

class SandboxedWASMPlugin:
    """
    Isolated WebAssembly (Wasmtime) runtime container adhering to suggestion-v2.md Section 5:
    - 16 MB max linear memory allocation ceiling
    - 100 ms equivalent CPU timeout (10,000,000 instruction fuel limit)
    - Zero OS syscalls (no WASI filesystem, network sockets, or subprocesses)
    """
    def __init__(self, plugin_id: str, name: str, author: str, description: str, wat_source: str):
        self.plugin_id = plugin_id
        self.name = name
        self.author = author
        self.description = description
        self.max_memory_mb = 16
        self.timeout_ms = 100
        self.total_invocations = 0

        # Compile WAT to WASM bytecode
        self.cfg = wasmtime.Config()
        self.cfg.consume_fuel = True
        self.engine = wasmtime.Engine(self.cfg)
        self.wasm_bytes = wasmtime.wat2wasm(wat_source)
        self.module = wasmtime.Module(self.engine, self.wasm_bytes)

    def execute(self, payload: str) -> Dict[str, Any]:
        start = time.perf_counter()
        self.total_invocations += 1
        input_bytes = payload.encode('latin-1', errors='replace')

        # Enforce 16 MB linear memory limit
        if len(input_bytes) > self.max_memory_mb * 1024 * 1024:
            return {
                "success": False,
                "error": "ERR_WASM_MEMORY_EXCEEDED: Input exceeds 16 MB sandbox memory ceiling",
                "execution_time_ms": 0.0
            }

        try:
            store = wasmtime.Store(self.engine)
            initial_fuel = 10_000_000
            store.set_fuel(initial_fuel)

            instance = wasmtime.Instance(store, self.module, [])
            allocate_fn = instance.exports(store)["allocate_wasm_memory"]
            free_fn = instance.exports(store)["free_wasm_memory"]
            decode_fn = instance.exports(store)["decode_payload"]
            memory = instance.exports(store)["memory"]

            in_len = len(input_bytes)
            in_ptr = allocate_fn(store, max(1, in_len))
            memory.write(store, input_bytes, in_ptr)

            max_out_len = max(16, in_len * 2)
            out_ptr = allocate_fn(store, max_out_len)

            res_len = decode_fn(store, in_ptr, in_len, out_ptr, max_out_len)
            if res_len < 0:
                return {
                    "success": False,
                    "error": f"ERR_WASM_RETURN_CODE: Plugin returned error code {res_len}",
                    "execution_time_ms": round((time.perf_counter() - start) * 1000.0, 2)
                }

            result_bytes = memory.read(store, out_ptr, out_ptr + res_len)

            # Cleanup
            free_fn(store, in_ptr)
            free_fn(store, out_ptr)

            elapsed_ms = (time.perf_counter() - start) * 1000.0
            consumed_fuel = initial_fuel - store.get_fuel()

            return {
                "success": True,
                "plugin_id": self.plugin_id,
                "plugin_name": self.name,
                "output": bytes(result_bytes).decode('latin-1', errors='replace'),
                "execution_time_ms": round(elapsed_ms, 2),
                "memory_used_kb": round(len(input_bytes) / 1024, 2),
                "fuel_consumed": consumed_fuel
            }
        except wasmtime.Trap as t:
            return {
                "success": False,
                "error": f"ERR_WASM_TRAP: WASM trap / instruction limit exceeded: {str(t)}",
                "execution_time_ms": round((time.perf_counter() - start) * 1000.0, 2)
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"ERR_WASM_RUNTIME: {str(e)}",
                "execution_time_ms": round((time.perf_counter() - start) * 1000.0, 2)
            }


class WASMPluginManager:
    def __init__(self):
        self.plugins: Dict[str, SandboxedWASMPlugin] = {}
        self._register_default_plugins()

    def _register_default_plugins(self):
        self.register_plugin(SandboxedWASMPlugin(
            plugin_id="plugin_reverse_hex",
            name="Reverse Byte Hex Swapper",
            author="CIPHERON Community",
            description="Reverses byte order of endian-swapped hex strings.",
            wat_source=REVERSE_BYTES_WAT
        ))

        self.register_plugin(SandboxedWASMPlugin(
            plugin_id="plugin_rot47_wasm",
            name="Sandboxed ROT47 Transformer",
            author="CIPHERON Labs",
            description="Executes ASCII 33-126 rotation in isolated WASM sandbox.",
            wat_source=ROT47_WAT
        ))

        self.register_plugin(SandboxedWASMPlugin(
            plugin_id="plugin_nibble_swap",
            name="Bitwise Nibble Transposer",
            author="CTF Research Guild",
            description="Performs 4-bit nibble transposition across byte stream.",
            wat_source=NIBBLE_SWAP_WAT
        ))

    def register_plugin(self, plugin: SandboxedWASMPlugin):
        self.plugins[plugin.plugin_id] = plugin

    def list_plugins(self) -> List[Dict[str, Any]]:
        return [
            {
                "plugin_id": p.plugin_id,
                "name": p.name,
                "author": p.author,
                "description": p.description,
                "max_memory_mb": p.max_memory_mb,
                "timeout_ms": p.timeout_ms,
                "total_invocations": p.total_invocations
            }
            for p in self.plugins.values()
        ]

    def execute_plugin(self, plugin_id: str, payload: str) -> Dict[str, Any]:
        if plugin_id not in self.plugins:
            return {"success": False, "error": f"Plugin '{plugin_id}' not found"}
        return self.plugins[plugin_id].execute(payload)


wasm_manager = WASMPluginManager()
