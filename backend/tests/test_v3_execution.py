import pytest
import time
from fastapi.testclient import TestClient
from app.main import app
from app.ciphers.columnar_transposition import solve_columnar_transposition, decrypt_columnar_transposition
from app.detectors.statistics import analyze_multilingual_ic
from app.ciphers.kasiski import kasiski_examination
from app.sandbox.wasm_sandbox import wasm_manager
from app.telemetry.merkle_tree import merkle_tree_engine, CryptographicMerkleTree
from app.ai.llm_sanitizer import secret_sanitizer, llm_explainer
from tests.fuzz_harness import run_fuzz_campaign

client = TestClient(app)

def test_columnar_transposition_solver():
    plaintext = "DEFENDTHEEASTWALLOFTHECASTLE"
    # Columnar transposition with 4 columns: order [2, 0, 3, 1]
    # Grid:
    # D E F E
    # N D T H
    # E E A S
    # T W A L
    # L O F T
    # H E C A
    # S T L E
    # Col 0: DNETLHS
    # Col 1: EDEWOET
    # Col 2: FTAAFCL
    # Col 3: EHSLT AE -> EHSLTAE
    # Ciphertext in order [2, 0, 3, 1]: FTAAFCL + DNETLHS + EHSLTAE + EDEWOET
    ciphertext = "FTAAFCLDNETLHSEHSLTAEEDEWOET"
    dec = decrypt_columnar_transposition(ciphertext, [2, 0, 3, 1])
    assert "DEFEND" in dec or "EASTWALL" in dec

    res = solve_columnar_transposition(ciphertext, max_cols=6)
    assert res["success"] is True
    assert res["best_columns"] >= 2
    assert len(res["tested_column_candidates"]) > 0

def test_multilingual_ic_analysis():
    # Natural English text
    english_sample = (
        "THE SYSTEM EVOLUTION PROPOSAL OUTLINES COMPREHENSIVE ROADMAP MILESTONES "
        "FOR THE CRYPTOGRAPHIC CODES AND ADVANCED STATISTICAL CRYPTANALYSIS."
    )
    res_en = analyze_multilingual_ic(english_sample)
    assert res_en["observed_ic"] > 0.050
    assert res_en["is_polyalphabetic_or_random"] is False
    assert res_en["language_alignment"][0]["language"] == "English"

    # Random noise
    noise = "XJQFZVBPMKDLRWTSNCYHGJAOPQZVMBC"
    res_noise = analyze_multilingual_ic(noise)
    assert res_noise["observed_ic"] < 0.055

def test_kasiski_gcd_matrix():
    text = "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND THE SATELLITE TRANSMITS THE ENCRYPTED CIPHERON SIGNALS"
    plaintext = ''.join(c.upper() for c in text if c.isalpha())
    key = "KEY"
    k_shifts = [ord(c) - ord('A') for c in key]
    ciphertext = ''.join(chr((ord(c) - ord('A') + k_shifts[i % 3]) % 26 + ord('A')) for i, c in enumerate(plaintext))

    exam = kasiski_examination(ciphertext, max_key_len=10)
    assert exam["success"] is True
    assert "gcd_matrix_candidates" in exam
    # Factor votes should favor key length 3 or multiples
    candidate_lens = [c["key_length"] for c in exam["top_candidate_key_lengths"]]
    assert any(k in candidate_lens for k in [3, 6, 9])


def test_wasmtime_real_bytecode_sandbox():
    # 1. Test ROT47 plugin in real wasmtime runtime
    r1 = wasm_manager.execute_plugin("plugin_rot47_wasm", "Hello World!")
    assert r1["success"] is True
    assert r1["output"] == "w6==@ (@C=5P"
    assert r1["fuel_consumed"] > 0

    # Rotate back
    r1_back = wasm_manager.execute_plugin("plugin_rot47_wasm", r1["output"])
    assert r1_back["output"] == "Hello World!"

    # 2. Test Reverse Hex plugin
    r2 = wasm_manager.execute_plugin("plugin_reverse_hex", "ABCDEF")
    assert r2["success"] is True
    assert r2["output"] == "FEDCBA"

    # 3. Test Nibble Swap plugin
    r3 = wasm_manager.execute_plugin("plugin_nibble_swap", "\x12\x34")
    assert r3["success"] is True
    assert r3["output"] == "\x21\x43"

def test_merkle_tree_proof_generation_and_verification():
    stages = [
        {"step": 1, "algorithm": "BASE64_DECODE", "digest": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"},
        {"step": 2, "algorithm": "VIGENERE_KEY_SOLVE", "digest": "872983764b8a1e2f3d4c5b6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c"},
        {"step": 3, "algorithm": "ROT13", "digest": "112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00"},
        {"step": 4, "algorithm": "DICTIONARY_VERIFY", "digest": "aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899"}
    ]
    tree_summary = merkle_tree_engine.build_tree_from_stages(stages)
    assert tree_summary["total_leaves"] == 4
    assert len(tree_summary["root_hash"]) == 64
    assert len(tree_summary["ecdsa_device_signature"]) > 0

    # Generate audit proof for leaf index 1
    proof = merkle_tree_engine.get_audit_proof(1)
    assert proof["success"] is True
    assert len(proof["proof_path"]) > 0

    # Verify proof matches root
    valid = CryptographicMerkleTree.verify_proof(
        leaf_hash=proof["leaf_hash"],
        proof_path=proof["proof_path"],
        expected_root=proof["root_hash"]
    )
    assert valid is True

    # Tampered leaf hash must fail verification
    tampered_valid = CryptographicMerkleTree.verify_proof(
        leaf_hash="0000000000000000000000000000000000000000000000000000000000000000",
        proof_path=proof["proof_path"],
        expected_root=proof["root_hash"]
    )
    assert tampered_valid is False

def test_secret_sanitizer_high_entropy_masking():
    sensitive_payload = (
        "Analysis context: user provided token: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcxfEmTtRFVShTrqdM4QdU252n1Ns_j4S2mtu3Bg "
        "and private_key = 0xabcdef0123456789abcdef0123456789."
    )
    sanitized, mapping = secret_sanitizer.sanitize_text(sensitive_payload)
    assert "REDACTED" in sanitized
    assert len(mapping) >= 1
    assert "0xabcdef0123456789abcdef0123456789" not in sanitized

    # Verify reverse desanitization
    restored = secret_sanitizer.desanitize_text(sanitized, mapping)
    assert "0xabcdef0123456789abcdef0123456789" in restored

def test_async_202_analysis_flow():
    req_body = {
        "raw_input": "SGVsbG8gQ0lQSEVST04tWDEx",
        "max_depth": 3,
        "security_profile": "SECURE",
        "enable_llm_explanation": True
    }
    resp = client.post("/api/v1/analyze", json=req_body)
    assert resp.status_code == 202
    data = resp.json()
    assert "task_" in data["task_id"]
    assert data["status"] == "PROCESSING"
    assert "/ws/analysis" in data["websocket_url"]

    # Poll status
    time.sleep(0.3)
    poll_resp = client.get(f"/api/v1/analyze/{data['task_id']}")
    assert poll_resp.status_code == 200
    poll_data = poll_resp.json()
    assert poll_data["status"] in ["PROCESSING", "COMPLETED"]

def test_fuzz_campaign_resiliency():
    passed = run_fuzz_campaign(30)
    assert passed == 30
