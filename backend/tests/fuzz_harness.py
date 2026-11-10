import os
import random
import string
import traceback
from app.encoders.base_encoders import decode_base64, decode_hex
from app.parsers.esoteric import inspect_jwt, decode_protobuf_wire, decode_cbor_minimal
from app.ciphers.kasiski import kasiski_examination
from app.ciphers.columnar_transposition import solve_columnar_transposition

def mutate_payload(data: bytes) -> bytes:
    """Applies mutation operations: byte flips, insertions, truncations, and null injections."""
    mut = bytearray(data)
    op = random.choice(["flip", "insert", "delete", "null", "repeat"])
    if not mut:
        return b"FUZZ"

    if op == "flip":
        idx = random.randint(0, len(mut) - 1)
        mut[idx] ^= random.randint(1, 255)
    elif op == "insert":
        idx = random.randint(0, len(mut))
        mut.insert(idx, random.randint(0, 255))
    elif op == "delete" and len(mut) > 1:
        idx = random.randint(0, len(mut) - 1)
        del mut[idx]
    elif op == "null":
        idx = random.randint(0, len(mut) - 1)
        mut[idx] = 0
    elif op == "repeat":
        mut = mut * 2

    return bytes(mut[:2048])

def run_fuzz_iteration(data: bytes) -> bool:
    """Fuzzes parser components to verify no unhandled crash or exception occurs."""
    text = data.decode("utf-8", errors="replace")
    try:
        decode_base64(text)
        decode_hex(text)
        inspect_jwt(text)
        decode_protobuf_wire(data)
        decode_cbor_minimal(data)
        kasiski_examination(text)
        solve_columnar_transposition(text)
    except (ValueError, KeyError, UnicodeDecodeError, IndexError):
        pass  # Expected defensive domain exceptions
    except Exception as e:
        # Unexpected unhandled crash
        traceback.print_exc()
        raise e
    return True

def run_fuzz_campaign(iterations: int = 100) -> int:
    """Runs a 100-iteration mutation fuzzing campaign."""
    seeds = [
        b"eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjM0NTY3ODkwIn0.",
        b"SGVsbG8gQ0lQSEVST04tWDEx",
        b"\x08\x96\x01\x12\x07dGVzdGluZw==",
        b"\xa2\x61\x61\x01\x61\x62\x02",
        b"THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG",
        b"4349504845524f4e"
    ]
    passed = 0
    for i in range(iterations):
        seed = random.choice(seeds)
        mutated = mutate_payload(seed)
        if run_fuzz_iteration(mutated):
            passed += 1
    return passed

if __name__ == "__main__":
    count = run_fuzz_campaign(100)
    print(f"Fuzz campaign complete: {count}/100 iterations passed without parser crashes.")
