import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.detectors.statistics import (
    calculate_shannon_entropy, calculate_printable_ratio,
    calculate_index_of_coincidence, calculate_chi_squared,
    extract_statistical_metrics
)
from app.encoders.base_encoders import (
    decode_base64, encode_base64,
    decode_hex, encode_hex,
    decode_binary, encode_binary,
    decode_morse, encode_morse,
    decode_base32, decode_base58
)
from app.ciphers.classical import (
    caesar_shift, solve_caesar_bruteforce,
    rot13, atbash, affine_decrypt, solve_affine_bruteforce,
    vigenere_decrypt, solve_vigenere_common,
    rail_fence_decrypt, decode_baconian, solve_single_byte_xor
)
from app.scoring.metrics import score_candidate
from app.parsers.hash_detector import analyze_hash
from app.parsers.binary_inspector import analyze_binary_data
from app.code_analysis.code_inspector import analyze_source_code
from app.services.transformation_pipeline import TransformationPipelineEngine
from app.security.profile_manager import security_manager

client = TestClient(app)

# --- 1. PRD Section 8.2 Standardized Baseline Test Vectors ---
def test_baseline_vector_base64():
    raw = "SGVsbG8gQ0lQSEVST04tWDEx"
    decoded = decode_base64(raw)
    assert decoded == "Hello CIPHERON-X11"

def test_baseline_vector_hex():
    raw = "4349504845524f4e"
    decoded = decode_hex(raw)
    assert decoded == "CIPHERON"

def test_baseline_vector_binary():
    raw = "01010100 01100101 01110011 01110100"
    decoded = decode_binary(raw)
    assert decoded == "Test"

def test_baseline_vector_rot13():
    raw = "Uryyb Jbeyq"
    decoded = rot13(raw)
    assert decoded == "Hello World"

def test_baseline_vector_caesar():
    raw = "KHOOR" # Shift 3 of HELLO
    results = solve_caesar_bruteforce(raw)
    assert len(results) > 0
    assert results[0].text == "HELLO"

def test_baseline_vector_morse():
    raw = ".... . .-.. .-.. ---"
    decoded = decode_morse(raw)
    assert decoded == "HELLO"

def test_baseline_vector_sha256_hash():
    # SHA-256 for empty string
    sha256_empty = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    result = analyze_hash(sha256_empty)
    assert result.is_hash is True
    assert "SHA-256" in result.detected_algorithms
    assert "one-way functions and cannot be decoded directly" in result.integrity_notice

# --- 2. Statistical Metrics Tests ---
def test_statistical_metrics():
    text = "CIPHERON IS A HARDWARE ASSISTED CYBERSECURITY RESEARCH PLATFORM FOR DETECTING ENCODED MESSAGES"
    metrics = extract_statistical_metrics(text)
    assert metrics.length == len(text)
    assert metrics.printable_ratio == 1.0
    assert metrics.shannon_entropy > 3.0
    assert metrics.index_of_coincidence > 0.04
    assert "PRINTABLE_ASCII" in metrics.detected_charsets


# --- 3. Classical Ciphers Tests ---
def test_atbash_cipher():
    assert atbash("ABCxyz") == "ZYXcba"

def test_affine_cipher():
    # Affine: E(x) = (5x + 8) mod 26
    # "HELLO" -> D(y) returns HELLO
    dec = affine_decrypt("RCLLA", 5, 8)
    assert dec == "HELLO"

def test_vigenere_cipher():
    # Vigenere with key 'LEMON'
    enc = "LXFOPV" # HELLO + LEMON -> Attack at dawn type
    dec = vigenere_decrypt("LXFOPV", "LEMON")
    assert dec == "ATTACK"

def test_rail_fence():
    # Plaintext "WEAREDISCOVEREDFLEEATONCE" -> 3 rails
    # Decrypting test
    plain = "HELLOWORLD"
    dec = rail_fence_decrypt(plain, 3)
    assert len(dec) == len(plain)

def test_single_byte_xor():
    # XOR with key 0x42
    secret = "SECRET FLAG"
    xor_bytes = bytes([b ^ 0x42 for b in secret.encode('utf-8')])
    res = solve_single_byte_xor(xor_bytes)
    assert any("SECRET FLAG" in c.text for c in res)

# --- 4. Scoring Engine Tests ---
def test_scoring_engine():
    cand_eng = score_candidate("HELLO WORLD THIS IS A SECRET FLAG", "Test")
    cand_gibberish = score_candidate("QXKZJ VBPWL QZXKV PQWZB LKMXJ", "Test")
    assert cand_eng.score > cand_gibberish.score
    assert cand_eng.score > 55.0


def test_json_structural_verification():
    cand = score_candidate('{"status": "ok", "message": "success"}', "JSON")
    assert cand.verified_structure == "VALID_JSON"

# --- 5. Recursive Multi-Stage Transformation Engine ---
def test_recursive_pipeline():
    engine = TransformationPipelineEngine(max_depth=5, timeout_seconds=2.0)
    # Payload: Base64 of ROT13 of "HELLO WORLD"
    # "HELLO WORLD" -> ROT13 -> "URYYB JBEYQ" -> Base64 -> "VVJZeWJKQkVZUT09" or similar
    rot13_str = rot13("HELLO WORLD")
    b64_str = encode_base64(rot13_str)
    
    dag = engine.execute_pipeline(b64_str)
    assert len(dag.nodes) >= 2
    # Check that best candidate contains "HELLO WORLD"
    found = any("HELLO WORLD" in n.output_snippet for n in dag.nodes)
    assert found is True

# --- 6. Source Code Intelligence Tests ---
def test_code_analysis_python():
    code = """
import os
import sys

def calculate_checksum(data):
    if len(data) > 0:
        return sum(data)
    return 0

class CryptoHelper:
    def __init__(self):
        self.key = "123"
"""
    result = analyze_source_code(code)
    assert result.is_code is True
    assert result.language == "Python"
    assert result.syntax_valid is True
    assert "calculate_checksum" in result.functions
    assert "CryptoHelper" in result.classes
    assert "os" in result.imports

def test_code_analysis_obfuscation_detection():
    obf_code = """
function payload() {
    eval(atob("YWxlcnQoMSk="));
}
"""
    result = analyze_source_code(obf_code)
    assert result.is_code is True
    assert result.obfuscation_risk > 30.0
    assert any("eval" in w for w in result.security_warnings)

# --- 7. Binary Analysis Tests ---
def test_binary_analysis_png_magic():
    png_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
    result = analyze_binary_data(png_bytes)
    assert result.file_type == "PNG Image"
    assert result.mime_type == "image/png"
    assert len(result.byte_histogram) == 256
    assert len(result.hex_dump) > 0

# --- 8. Security Profiles & Panic Wipe ---
def test_security_profiles_and_wipe():
    # Standard profile allows 10MB
    security_manager.set_security_profile("STANDARD")
    assert security_manager.validate_input_size(5 * 1024 * 1024) is True
    
    # Fortress profile caps at 500KB
    security_manager.set_security_profile("FORTRESS")
    assert security_manager.validate_input_size(600 * 1024) is False
    assert security_manager.validate_input_size(100 * 1024) is True
    
    # Secure Wipe
    wipe_res = security_manager.execute_secure_wipe()
    assert wipe_res["status"] == "SECURE_WIPE_SUCCESS"
    assert wipe_res["memory_zeroed"] is True

# --- 9. API Integration Tests ---
def test_api_detect_endpoint():
    security_manager.set_security_profile("STANDARD")
    response = client.post("/api/v1/detect", json={"content": "SGVsbG8gQ0lQSEVST04tWDEx"})
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert any(h["family"] == "ENCODING" for h in data["hypotheses"])

def test_api_pipeline_endpoint():
    response = client.post("/api/v1/pipeline", json={"content": "SGVsbG8gV29ybGQ="})
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert data["best_candidate"] is not None
    assert "Hello World" in data["best_candidate"]["text"]

def test_api_oversized_rejection():
    security_manager.set_security_profile("FORTRESS")
    # Generate 600KB payload
    oversized = "A" * (600 * 1024)
    response = client.post("/api/v1/detect", json={"content": oversized})
    assert response.status_code == 413
    assert "ERR_INPUT_TOO_LARGE" in response.json()["detail"]
    # Reset to standard
    security_manager.set_security_profile("STANDARD")

def test_api_ai_explain():
    req = {
        "evidence": {
            "detected_cipher_or_encoding": "Base64",
            "shannon_entropy": 4.2,
            "index_of_coincidence": 0.065,
            "candidate_text": "Hello World",
            "score": 95.5
        }
    }
    response = client.post("/api/v1/ai-explain", json=req)
    assert response.status_code == 200
    data = response.json()
    assert len(data["step_by_step_reasoning"]) == 4
    assert "Base64" in data["summary"]
