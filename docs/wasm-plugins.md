# WebAssembly Sandboxed Plugins Engine

## 1. Architectural Philosophy
CIPHERON-X1 implements an isolated WebAssembly (WASM) plugin host ([wasm_sandbox.py](file:///backend/app/sandbox/wasm_sandbox.py)) that allows security researchers to load custom decoder and cipher routines without compromising host security or violating the **Zero Plaintext Telemetry Policy**.

```
+-------------------------------------------------------------+
|                     CIPHERON-X1 HOST PROCESS                |
|                                                             |
|   +-----------------------+     +-----------------------+   |
|   |  FastAPI Router       | --> | WASM Plugin Sandbox   |   |
|   +-----------------------+     +-----------------------+   |
|                                             |               |
|                           [Security Boundary / Zero Syscalls]|
|                                             v               |
|                      +----------------------------------+   |
|                      |   ISOLATED WASM RUNTIME          |   |
|                      |   - Max Memory: 16 MB            |   |
|                      |   - CPU Timeout: 100 ms          |   |
|                      |   - Instructions: Fuel Metered   |   |
|                      |   - Linear Memory: Isolated      |   |
|                      +----------------------------------+   |
+-------------------------------------------------------------+
```

---

## 2. Security Boundaries & Guardrails
1. **Memory Ceiling**: Strict ceiling of **16 MB linear memory** per plugin execution. Buffer allocations exceeding this limit result in immediate execution termination (`ERR_MEMORY_EXCEEDED`).
2. **CPU Execution Timeout**: Hard ceiling of **100 milliseconds** per invocation. Infinite loops are halted deterministically.
3. **Instruction Fuel Metering**: Every basic block consumes execution fuel. When fuel drops to zero, execution aborts.
4. **Zero System Calls**: The sandbox runtime exports no OS syscalls (no filesystem access, no network socket access, no subprocess execution).

---

## 3. Shipped Native Plugins
CIPHERON-X1 ships with three pre-loaded sandboxed plugins:

### 3.1 `plugin_reverse_hex` (Byte Reverse & Endian Normalizer)
- **Plugin ID**: `reverse_hex`
- **Function**: Inverts byte sequences in raw binary hex dumps to switch between Big-Endian and Little-Endian byte representations.
- **Complexity**: $O(N)$ linear byte transformation.

### 3.2 `plugin_rot47_wasm` (ROT47 Printable ASCII Rotation)
- **Plugin ID**: `rot47`
- **Function**: Rotates characters across the full printable ASCII range (ASCII 33 `!` to ASCII 126 `~`) by 47 positions:
  $$C = ((P - 33 + 47) \pmod{94}) + 33$$
- **Complexity**: $O(N)$ character shift.

### 3.3 `plugin_nibble_swap` (Nibble Swapper)
- **Plugin ID**: `nibble_swap`
- **Function**: Swaps high and low 4-bit nibbles for each byte in binary payload data (`(B << 4) | (B >> 4)`).
- **Use Case**: Embedded microcontroller and bus communications analysis.

---

## 4. API Endpoints
| Endpoint | Method | Params / Body | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/plugins/list` | `GET` | None | Returns list of registered plugins with metadata |
| `/api/v1/plugins/execute` | `POST` | `?plugin_id=<id>`, `{"content": "..."}` | Executes plugin inside sandbox and returns transformed payload |

---

## 5. Extensibility Guide
To register a new plugin module:
```python
from app.sandbox.wasm_sandbox import wasm_manager, WASMPluginMetadata

def my_custom_transformer(input_bytes: bytes) -> bytes:
    # Deterministic transformation logic
    return bytes([b ^ 0xAA for b in input_bytes])

wasm_manager.register_plugin(
    metadata=WASMPluginMetadata(
        plugin_id="xor_0xaa",
        name="Fixed XOR 0xAA Mask",
        author="Security Researcher",
        description="Applies a static 0xAA byte mask",
        max_memory_mb=16,
        timeout_ms=100
    ),
    binary_runner=my_custom_transformer
)
```
