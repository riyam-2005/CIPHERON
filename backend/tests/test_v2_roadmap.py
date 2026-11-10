import pytest
import base64
import json
from app.parsers.esoteric import (
    inspect_jwt, decode_protobuf_wire, decode_cbor_minimal,
    decode_ascii85, encode_ascii85, decode_z85, decode_braille
)
from app.ciphers.kasiski import (
    kasiski_examination, solve_vigenere_by_frequency_alignment
)
from app.ciphers.classical import vigenere_decrypt
from app.sandbox.wasm_sandbox import wasm_manager
from app.telemetry.provenance_ledger import CryptographicProvenanceLedger

def test_jwt_inspector_valid_and_vulnerable():
    # Construct a JWT with 'none' alg
    hdr = base64.urlsafe_b64encode(json.dumps({"alg": "none", "typ": "JWT"}).encode()).decode().rstrip('=')
    payload = base64.urlsafe_b64encode(json.dumps({"sub": "admin", "role": "superuser", "exp": 1999999999}).encode()).decode().rstrip('=')
    token = f"{hdr}.{payload}."
    
    res = inspect_jwt(token)
    assert res["is_valid_jwt"] is True
    assert res["header"]["alg"] == "none"
    assert res["payload"]["sub"] == "admin"
    assert any("none" in v.lower() for v in res["vulnerabilities"])

def test_protobuf_wire_format():
    # Field 1 (Varint = 150): tag = (1 << 3) | 0 = 0x08, val 150 = 0x96, 0x01
    # Field 2 (Length-delimited = "hello"): tag = (2 << 3) | 2 = 0x12, len = 5, "hello"
    wire_bytes = bytes([0x08, 0x96, 0x01, 0x12, 0x05]) + b"hello"
    parsed = decode_protobuf_wire(wire_bytes)
    assert parsed["fields_parsed"] == 2
    f1 = parsed["fields"][0]
    f2 = parsed["fields"][1]
    assert f1["field"] == 1
    assert f1["value"] == 150
    assert f2["field"] == 2
    assert f2["value"] == "hello"

def test_cbor_decoder():
    # CBOR encoding of map {"a": 1}: 0xA1, 0x61, 0x61 ('a'), 0x01
    cbor_bytes = bytes([0xA1, 0x61, 0x61, 0x01])
    res = decode_cbor_minimal(cbor_bytes)
    assert res["success"] is True
    assert res["parsed_cbor"] == {"a": 1}

def test_base85_and_z85():
    plain = "Hello CIPHERON"
    enc_a85 = encode_ascii85(plain)
    dec_a85 = decode_ascii85(enc_a85)
    assert dec_a85 == plain

def test_braille_decoder():
    # "⠓⠑⠇⠇⠕" -> "HELLO"
    braille_str = "⠓⠑⠇⠇⠕"
    decoded = decode_braille(braille_str)
    assert decoded == "HELLO"

def test_kasiski_and_vigenere_solver():
    text = "CIPHERON IS A UNIVERSAL HARDWARE ASSISTED CLASSICAL CIPHER AND ENCODING RESEARCH SYSTEM DESIGNED FOR CYBERSECURITY RESEARCHERS AND AUDITORS"
    plaintext = ''.join(c.upper() for c in text if c.isalpha())
    key = "KEY"
    k_shifts = [ord(c) - ord('A') for c in key]
    ciphertext = ''.join(chr((ord(c) - ord('A') + k_shifts[i % 3]) % 26 + ord('A')) for i, c in enumerate(plaintext))
    
    k_res = kasiski_examination(ciphertext)
    assert k_res["success"] is True
    
    # Solve coset frequency alignment
    solve_res = solve_vigenere_by_frequency_alignment(ciphertext, key_length=3)
    assert solve_res["success"] is True
    assert solve_res["recovered_key"] == "KEY"
    assert solve_res["decrypted_plaintext"] == plaintext


def test_wasm_sandboxing():
    # Test plugin execution
    res = wasm_manager.execute_plugin("plugin_rot47_wasm", "Hello World")
    assert res["success"] is True
    assert res["memory_used_kb"] < 16 * 1024
    assert res["execution_time_ms"] < 100.0

def test_provenance_ledger_tamper_detection():
    ledger = CryptographicProvenanceLedger()
    ledger.append_record("INPUT_1", ["Base64"], "OUTPUT_1")
    ledger.append_record("INPUT_2", ["ROT13"], "OUTPUT_2")
    
    # Initial verification should be valid
    check1 = ledger.verify_ledger_integrity()
    assert check1["valid"] is True
    assert check1["total_blocks"] == 3  # Genesis + 2
    
    # Simulate tampering: tamper with block 2
    ledger.chain[1].steps_applied = ["TAMPERED_STEP"]
    check2 = ledger.verify_ledger_integrity()
    assert check2["valid"] is False
    assert check2["tampered_record_id"] == 2
