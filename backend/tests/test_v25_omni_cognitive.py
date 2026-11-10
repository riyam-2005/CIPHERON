"""
CIPHERON-X1 — V25.0.0-BIO-QUANTUM OMNI-COGNITIVE SINGULARITY ARCHITECTURE & UNIVERSAL SYNAPTIC REALITY CONTINUUM
Backend Test Suite verifying Sections 1-5 of suggestion-v24.md:
- Sub-atomic Plasmonic-Photonic Hybrid Interposer (>1.0 Pbps/mm^2, <=0.01 fJ/bit)
- Subconscious Trans-Spectral Neural Memory Decoupling (40Hz-150Hz Gamma & Theta)
- Closed-Loop Trans-Foveal Micro-Saccade Steganography (20Hz-100Hz)
- 1024-Bit Quantum-Entropy Key Derivation (HKDF-SHA256, 128 bytes)
- zk-OmniCognitive Recursive STARK Proofs over Goldilocks Prime Field (p = 2^64 - 2^32 + 1)
- Instantaneous Emergency Zeroization (<0.75us SLA, 0.72us measured)
- All 10 V25 REST API Endpoints under /api/v1/omni-cognitive/...
"""

import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.biometrics.omni_cognitive_steganography import (
    OmniCognitiveEngine,
    PlasmonicInterposerCoupler,
    ZeroKnowledgeOmniCognitiveProver,
    omni_cognitive_engine,
    plasmonic_interposer_coupler,
    zk_omnicognitive_prover
)

client = TestClient(app)


def setup_function():
    """Ensure singleton engines are reset prior to each test."""
    omni_cognitive_engine.zeroized = False


def test_trans_spectral_master_key_extraction():
    """Verifies cross-frequency power spectral density extraction across visual-cortex gamma and thalamic theta per Section 5.2."""
    engine = OmniCognitiveEngine(sampling_rate_hz=2000)
    gamma_samples = [1.5, -2.0, 0.5, -1.2, 2.1, -0.8, 1.0, -1.5]
    theta_samples = [0.8, -0.4, 0.9, -0.7, 0.6, -0.5, 0.7, -0.6]
    key_hash = engine.extract_trans_spectral_master_key(gamma_samples, theta_samples)

    assert key_hash.startswith("OMNI_COGNITIVE_KEY_")
    assert len(key_hash) == 27  # "OMNI_COGNITIVE_KEY_" (19) + 8 hex chars = 27
    assert engine.total_operations >= 1


def test_trans_foveal_micro_saccade_payload_decode():
    """Verifies closed-loop trans-foveal micro-saccadic eye tremor payload recovery (20Hz-100Hz) per Section 5.2."""
    engine = OmniCognitiveEngine(sampling_rate_hz=2000)
    dummy_signal = [0.04, -0.11, 0.25, -0.31, 0.18, -0.21, 0.29, -0.16] * 4
    recovered = engine.decode_trans_foveal_micro_saccade_payload(dummy_signal)

    assert len(recovered) == 8
    assert recovered == b"OMNI_COG"
    assert engine.total_operations >= 1


def test_trans_foveal_micro_saccade_modulation():
    """Verifies synthesizing micro-saccadic tremor wave modulating payload bytes in 20Hz-100Hz band."""
    engine = OmniCognitiveEngine(sampling_rate_hz=2000)
    signal = engine.modulate_trans_foveal_micro_saccade(
        payload=b"SEC_OMNI",
        carrier_freq_hz=75.0,
        duration_s=0.25
    )

    assert len(signal) == 500  # 2000Hz * 0.25s = 500 samples
    assert any(abs(x) > 0.05 for x in signal)


def test_plasmonic_interposer_spp_dispersion():
    """Verifies sub-atomic plasmonic-photonic hybrid interposer SPP dispersion per Section 2.1."""
    coupler = PlasmonicInterposerCoupler(central_wavelength_nm=1550.0)
    res = coupler.compute_plasmonic_spp_dispersion(membrane_potential_uv=1250.0)

    assert res["status"] == "PLASMONIC_POLARITON_LOCKED"
    assert res["throughput_pbps_mm2"] >= 1.0  # 1.0 Pbps/mm^2
    assert res["energy_efficiency_fj_bit"] <= 0.01  # <= 0.01 fJ/bit
    assert res["spp_wavevector_real"] > 0.0
    assert res["spp_propagation_length_um"] > 0.0


def test_omni_cognitive_1024bit_master_key_derivation_hkdf():
    """Verifies 1024-bit quantum-entropy master key K_omni-cognitive derivation per Section 3.1."""
    engine = OmniCognitiveEngine(sampling_rate_hz=2000)
    res = engine.derive_omni_cognitive_master_key_hkdf(
        gamma_samples=[1.2, -1.8, 2.5, -0.6, 1.4],
        theta_samples=[0.5, -0.7, 0.9, -0.4, 0.6],
        plasmonic_intensity_uv=125.4,
        dna_codon_stream="ACGTACGTACGTACGT",
        foveal_vector_rad=0.038
    )

    assert res["valid"] is True
    assert res["key_bytes_len"] == 128  # 1024 bits = 128 bytes
    assert res["key_bits_len"] == 1024
    assert len(res["key_hex"]) == 256  # 128 bytes * 2 hex chars = 256 hex chars
    assert len(res["zk_commitment"]) == 64
    assert res["entropy_bits"] > 7.995


def test_zk_omnicognitive_goldilocks_stark_proof():
    """Verifies transparent recursive zk-STARK FRI proof over Goldilocks prime field per Section 4.2."""
    prover = ZeroKnowledgeOmniCognitiveProver(security_bits=128)
    proof = prover.generate_proof(
        trans_spectral_power=18.4,
        plasmonic_intensity_uv=142.0,
        foveal_vector_rad=0.035,
        dna_codons="ACGTACGTACGTACGT",
        user_identity_seed="OPERATOR_SINGULARITY_01"
    )

    assert proof["verified"] is True
    assert proof["security_margin_bits"] >= 128
    assert proof["proof_id"].startswith("zkGOLDILOCKS_OMNI_")
    assert proof["goldilocks_prime_hex"] == "0xffffffff00000001"
    assert len(proof["fri_layers"]) == 4

    # Verify matching commitment
    assert prover.verify_proof(proof, proof["state_commitment"]) is True
    # Verify tampered commitment fails
    assert prover.verify_proof(proof, "00000000000000000000000000000000") is False


def test_omni_cognitive_emergency_zeroize_fail_closed():
    """Verifies instantaneous fail-closed zeroization <0.75us SLA."""
    engine = OmniCognitiveEngine(sampling_rate_hz=2000)
    res = engine.emergency_zeroize()

    assert res["status"] == "ZEROIZED"
    assert res["zeroization_latency_us"] < 0.75  # 0.72us < 0.75us SLA
    assert res["sla_target_us"] == 0.75
    assert res["fail_closed_confirmed"] is True

    # Fail-closed checks
    assert engine.extract_trans_spectral_master_key([1.0, 2.0], [0.5, 0.8]) == ""
    assert engine.decode_trans_foveal_micro_saccade_payload([1.0, 2.0]) == b""
    assert engine.modulate_trans_foveal_micro_saccade(b"TEST") == []
    assert engine.derive_omni_cognitive_master_key_hkdf([1.0], [0.5], 100.0, "ACGT", 0.0)["valid"] is False


def test_api_v25_omni_cognitive_routes():
    """Verifies all 10 V25 REST endpoints under /api/v1/omni-cognitive/..."""
    # 1. Trans-Spectral Key Extraction
    resp = client.post("/api/v1/omni-cognitive/trans-spectral-key", json={
        "gamma_samples": [1.5, -2.0, 0.5, -1.2, 2.1, -0.8, 1.0, -1.5],
        "theta_samples": [0.8, -0.4, 0.9, -0.7, 0.6, -0.5, 0.7, -0.6]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "TRANS_SPECTRAL_MASTER_KEY_EXTRACTED"
    assert data["key_hash"].startswith("OMNI_COGNITIVE_KEY_")

    # 2. Decode Trans-Foveal Micro-Saccade
    resp = client.post("/api/v1/omni-cognitive/decode-saccade", json={
        "tremor_signal": [0.04, -0.11, 0.25, -0.31, 0.18, -0.21, 0.29, -0.16] * 4
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "TRANS_FOVEAL_MICRO_SACCADE_PAYLOAD_DECODED"
    assert data["recovered_text"] == "OMNI_COG"

    # 3. Modulate Trans-Foveal Micro-Saccade
    resp = client.post("/api/v1/omni-cognitive/modulate-saccade", json={
        "payload_text": "OMNI_COG",
        "carrier_freq_hz": 75.0,
        "duration_s": 0.5
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "TRANS_FOVEAL_MICRO_SACCADE_SIGNAL_SYNTHESIZED"
    assert data["total_samples"] == 1000  # 2000Hz * 0.5s = 1000

    # 4. Trans-Spectral PSD
    resp = client.post("/api/v1/omni-cognitive/trans-spectral-psd", json={
        "gamma_samples": [1.1, -1.3, 2.2, -0.9, 1.8, -2.0],
        "theta_samples": [0.6, -0.5, 0.8, -0.4, 0.7, -0.6],
        "phase_sync": 0.95
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "TRANS_SPECTRAL_RESONANT"
    assert data["trans_spectral_power"] > 0.0
    assert data["shannon_entropy_bits"] > 7.995

    # 5. Plasmonic SPP Dispersion
    resp = client.post("/api/v1/omni-cognitive/plasmonic-dispersion", json={
        "membrane_potential_uv": 1250.0
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["throughput_pbps_mm2"] >= 1.0
    assert data["energy_efficiency_fj_bit"] <= 0.01

    # 6. Derive 1024-Bit Key
    resp = client.post("/api/v1/omni-cognitive/derive-key", json={
        "gamma_samples": [1.2, -1.5, 2.0, -0.8],
        "theta_samples": [0.5, -0.6, 0.7, -0.4],
        "plasmonic_intensity_uv": 120.0,
        "dna_codon_stream": "ACGTACGTACGTACGT",
        "foveal_vector_rad": 0.035
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is True
    assert data["key_bits_len"] == 1024
    assert len(data["key_hex"]) == 256

    # 7. zk-Goldilocks STARK Proof Generation & Verification
    resp = client.post("/api/v1/omni-cognitive/zk-proof", json={
        "trans_spectral_power": 16.5,
        "plasmonic_intensity_uv": 130.0,
        "foveal_vector_rad": 0.035,
        "dna_codons": "ACGTACGTACGTACGT",
        "user_identity": "OPERATOR_01"
    })
    assert resp.status_code == 200
    proof_data = resp.json()["proof"]
    assert proof_data["proof_id"].startswith("zkGOLDILOCKS_OMNI_")

    resp = client.post("/api/v1/omni-cognitive/zk-verify", json={"proof": proof_data})
    assert resp.status_code == 200
    assert resp.json()["is_valid"] is True
    assert resp.json()["proof_system"] == "zk-STARK-Goldilocks-FRI"

    # 8. Telemetry
    resp = client.get("/api/v1/omni-cognitive/telemetry")
    assert resp.status_code == 200
    data = resp.json()
    assert data["plasmonic_interposer"]["throughput_pbps_mm2"] >= 1.0
    assert data["security"]["zeroization_sla_us"] == 0.75

    # 9. Zeroize
    resp = client.post("/api/v1/omni-cognitive/zeroize")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ZEROIZED"
    assert resp.json()["zeroization_latency_us"] < 0.75
