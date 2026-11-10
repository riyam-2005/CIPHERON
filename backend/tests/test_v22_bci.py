"""
CIPHERON-X1 V22.0.0 Bio-Cybernetic Cognitive Interface & Neural Intent Test Suite
Directly adhering to suggestion-v21.md Sections 1.1, 2.1, 3.1, 4.1, 4.2 & 5.2
"""

import pytest
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.biometrics.neural_intent_engine import (
    NeuralIntentEngine,
    CognitiveKeyDerivator,
    NeuralGazeSteganography,
    ZeroKnowledgeBCIProver,
    NeuralBand
)

client = TestClient(app)


def test_spectral_band_entropy_extraction():
    engine = NeuralIntentEngine(eeg_sampling_rate_hz=250)
    np.random.seed(42)
    # 250 samples simulating 1 second of EEG activity
    eeg_data = list(np.random.normal(loc=0.0, scale=12.0, size=250))

    entropy = engine.extract_spectral_band_entropy(eeg_data)
    assert entropy > 0.0
    assert isinstance(entropy, float)

    # Test spectral band decomposition (Delta, Theta, Alpha, Beta, Gamma)
    bands = engine.decompose_spectral_bands(eeg_data)
    assert "delta_power" in bands
    assert "theta_power" in bands
    assert "alpha_power" in bands
    assert "beta_power" in bands
    assert "gamma_power" in bands
    assert "erd_beta_ratio" in bands
    assert bands["total_power"] > 0.0


def test_p300_intent_classification():
    engine = NeuralIntentEngine(eeg_sampling_rate_hz=250)

    # Negative test: baseline fluctuations below 15 uV
    sub_threshold_window = [2.0, 5.0, 11.2, 8.0, 1.0]
    assert engine.classify_p300_intent(sub_threshold_window) is False

    # Positive test: P300 voltage spike > 15 uV
    p300_window = [2.0, 5.0, 18.5, 8.0, 1.0]
    assert engine.classify_p300_intent(p300_window) is True

    # Detailed analytics
    detailed = engine.detect_p300_detailed(p300_window)
    assert detailed["p300_detected"] is True
    assert detailed["peak_amplitude_uv"] == 18.5
    assert detailed["snr_db"] > 0.0
    assert detailed["confidence_score"] > 0.0
    assert detailed["intent_locked"] is True


def test_cognitive_key_derivation_hkdf():
    derivator = CognitiveKeyDerivator()
    p300_peak = 18.5
    neural_entropy = 7.92
    eog_vector = [120.0, -45.0, 210.0, -180.0]

    result = derivator.derive_key(p300_peak, neural_entropy, eog_vector)
    assert result["key_valid"] is True
    assert len(result["master_key_hex"]) == 64  # 32 bytes = 64 hex characters
    assert len(result["zk_commitment"]) == 64
    assert result["derivation_algorithm"] == "HKDF-SHA256(Salt_P300 || H_neural || V_EOG)"
    assert derivator.total_keys_derived >= 1


def test_neural_gaze_steganography():
    stego = NeuralGazeSteganography(aoi_count=4)
    secret = b"BCI_KEY"

    encoded = stego.encode_neural_stego(secret, initial_aoi=0)
    assert encoded["total_bits"] == len(secret) * 8
    assert len(encoded["aoi_path"]) == len(encoded["flicker_frequencies_hz"]) + 1
    assert len(encoded["flicker_frequencies_hz"]) == encoded["total_bits"]

    # Decode back from the synthesized signal
    decoded = stego.decode_neural_stego(
        encoded["aoi_path"],
        encoded["flicker_frequencies_hz"]
    )
    assert decoded == secret


def test_zk_bci_prover_and_verifier():
    prover = ZeroKnowledgeBCIProver()

    # Valid brainwave vector with P300 event > 15 uV
    brainwaves = [3.2, 5.1, 19.8, 4.3, 1.2, -2.4]
    proof = prover.generate_zk_proof(brainwaves, user_identity="OPERATOR_42")
    assert proof["proof_valid"] is True
    assert proof["is_valid_p300"] is True
    assert len(proof["x_pub"]) == 64
    assert len(proof["nullifier"]) == 64

    # Verify statement
    is_valid = prover.verify_zk_proof(proof)
    assert is_valid is True

    # Tampered challenge should fail
    tampered_proof = dict(proof)
    tampered_proof["proof_challenge"] = "deadbeef" * 8
    assert prover.verify_zk_proof(tampered_proof) is False

    # Brainwave without P300 should fail circuit check
    low_brainwaves = [1.2, 2.1, 4.8, 3.3]
    low_proof = prover.generate_zk_proof(low_brainwaves)
    assert low_proof["proof_valid"] is False
    assert prover.verify_zk_proof(low_proof) is False


def test_bci_emergency_zeroization_fail_closed():
    engine = NeuralIntentEngine(250)
    derivator = CognitiveKeyDerivator()
    prover = ZeroKnowledgeBCIProver()

    zero_res = derivator.emergency_zeroize()
    assert zero_res["status"] == "ZEROIZED"
    assert zero_res["zeroization_latency_us"] < 2.0  # <2.0us SLA
    assert zero_res["within_sla"] is True

    engine.zeroized = True
    prover.zeroized = True

    # Verify fail-closed behavior
    assert engine.extract_spectral_band_entropy([1.0, 2.0, 3.0]) == 0.0
    assert engine.classify_p300_intent([18.5, 20.0]) is False

    fail_key = derivator.derive_key(18.5, 7.92, [100.0])
    assert fail_key["key_valid"] is False
    assert fail_key["master_key_hex"] == "00" * 32

    fail_proof = prover.generate_zk_proof([19.0, 22.0])
    assert fail_proof["proof_valid"] is False
    assert prover.verify_zk_proof(fail_proof) is False


def test_api_v22_bci_routes():
    # 1. Spectral Entropy Endpoint
    resp = client.post("/api/v1/bci/spectral-entropy", json={
        "eeg_signal_uv": [12.4, -8.2, 18.5, 3.1, -15.6, 22.0, 5.4, -9.1, 14.8, -2.5, 11.0, -18.0]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SPECTRAL_ENTROPY_EXTRACTED"
    assert "spectral_entropy_bits_per_sample" in data
    assert "spectral_bands" in data

    # 2. P300 Intent Classification Endpoint
    resp = client.post("/api/v1/bci/p300-intent", json={
        "erp_window_uv": [2.0, 5.0, 18.5, 8.0, 1.0]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "P300_EVALUATION_COMPLETE"
    assert data["intent_locked"] is True
    assert data["action"] == "EXECUTE_CRYPTANALYTIC_SEARCH"

    # 3. Cognitive Key Derivation Endpoint
    resp = client.post("/api/v1/bci/cognitive-key", json={
        "p300_peak_uv": 18.5,
        "neural_entropy_bits": 7.92,
        "eog_vector": [120.5, -45.0, 210.0, -180.0]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["key_valid"] is True
    assert len(data["master_key_hex"]) == 64

    # 4. Neural-Gaze Steganography Encode Endpoint
    resp = client.post("/api/v1/bci/neural-stego/encode", json={
        "secret_text": "SECRET_BCI_2026",
        "initial_aoi": 0
    })
    assert resp.status_code == 200
    stego_data = resp.json()
    assert stego_data["status"] == "NEURAL_STEGANOGRAPHY_SYNTHESIZED"
    aoi_path = stego_data["aoi_path"]
    flicker_freqs = stego_data["flicker_frequencies_hz"]

    # 5. Neural-Gaze Steganography Decode Endpoint
    resp = client.post("/api/v1/bci/neural-stego/decode", json={
        "aoi_path": aoi_path,
        "flicker_frequencies_hz": flicker_freqs
    })
    assert resp.status_code == 200
    decoded_data = resp.json()
    assert decoded_data["decoded_text"] == "SECRET_BCI_2026"

    # 6. zk-BCI Proof Generation Endpoint
    resp = client.post("/api/v1/bci/zk-proof", json={
        "brainwave_vector": [4.2, 8.5, 19.4, 7.1, 2.8, -3.5, 1.2],
        "user_identity": "OPERATOR_ALPHA"
    })
    assert resp.status_code == 200
    zk_data = resp.json()
    assert zk_data["status"] == "ZK_BCI_PROOF_GENERATED"
    proof = zk_data["proof"]

    # 7. zk-BCI Proof Verification Endpoint
    resp = client.post("/api/v1/bci/zk-verify", json={"proof": proof})
    assert resp.status_code == 200
    assert resp.json()["is_valid"] is True

    # 8. BCI Telemetry Endpoint
    resp = client.get("/api/v1/bci/telemetry")
    assert resp.status_code == 200
    telem = resp.json()
    assert "bci_status" in telem
    assert "cognitive_keys" in telem

    # 9. BCI Emergency Zeroize Endpoint
    resp = client.post("/api/v1/bci/zeroize")
    assert resp.status_code == 200
    zero_data = resp.json()
    assert zero_data["status"] == "ZEROIZED"
    assert zero_data["within_sla"] is True
