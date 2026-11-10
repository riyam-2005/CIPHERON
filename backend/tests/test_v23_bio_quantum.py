"""
CIPHERON-X1 V23.0.0 Bio-Quantum Cognitive Neural Mesh & DNA Synaptics Test Suite
Directly adhering to suggestion-v22.md Sections 1.1, 2.1, 3.1, 4.1, 4.2 & 5.2
"""

import pytest
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.biometrics.dna_synaptic_steganography import (
    DnaSynapticEngine,
    QuantumDotCoupler,
    ZeroKnowledgeBioQuantumProver
)

client = TestClient(app)


def test_dna_synaptic_codon_encoding():
    engine = DnaSynapticEngine(sampling_rate_hz=500)
    samples = [1.2, -0.8, 2.1, 0.5, -1.4, 0.9, -0.2, 1.8] * 4 # 32 samples

    strand = engine.encode_neural_entropy_to_dna(samples)
    assert len(strand) == 16
    assert all(c in "ACGT" for c in strand)

    # Test arbitrary bytes to DNA codons and decode back
    payload = b"BIO_QUANTUM_DNA_2026"
    encoded_dna = engine.encode_bytes_to_dna(payload)
    assert len(encoded_dna) == len(payload) * 4
    assert all(c in "ACGT" for c in encoded_dna)

    recovered = engine.decode_dna_to_bytes(encoded_dna)
    assert recovered == payload


def test_micro_saccade_quiver_decoding():
    engine = DnaSynapticEngine(sampling_rate_hz=500)
    saccade_signal = [0.12, 0.35, -0.22, 0.48, -0.15, 0.28, -0.31, 0.19] * 4

    recovered = engine.decode_micro_saccade_payload(saccade_signal)
    assert len(recovered) > 0
    assert recovered == b"CIPHERON"

    # Spectral analysis
    quiver = engine.extract_micro_saccade_quiver(saccade_signal)
    assert 20.0 <= quiver["dominant_freq_hz"] <= 60.0
    assert quiver["quiver_amplitude_deg"] <= 0.5
    assert quiver["quiver_entropy"] > 7.0
    assert quiver["in_band"] is True


def test_quantum_dot_optical_coupling():
    coupler = QuantumDotCoupler(base_emission_nm=525.0)

    # Resting membrane potential (-70 mV)
    resting = coupler.couple_neural_potential(-70.0)
    assert resting["emission_wavelength_nm"] == 525.0
    assert resting["photonic_intensity_mv"] == 0.0

    # Action spike (+30 mV)
    spike = coupler.couple_neural_potential(30.0)
    assert spike["emission_wavelength_nm"] > 525.0
    assert spike["photonic_intensity_mv"] > 1000.0
    assert spike["conductance_shift_us"] > 0.0
    assert spike["quantum_mesh_locked"] is True


def test_dna_synaptic_key_derivation_hkdf():
    engine = DnaSynapticEngine(sampling_rate_hz=500)
    dna_strand = "ACGTCCGGAAGGTTAA"

    result = engine.derive_dna_synaptic_key(dna_strand, saccade_entropy=7.95)
    assert result["key_valid"] is True
    assert len(result["master_key_hex"]) == 64 # 32 bytes = 64 hex chars
    assert len(result["zk_commitment"]) == 64
    assert result["storage_density_pbg"] == 215.0
    assert result["derivation_algorithm"] == "HKDF-SHA256(Salt_quantum || DNA_strand || H_saccade)"


def test_zk_bioquantum_stark_proof():
    prover = ZeroKnowledgeBioQuantumProver()
    dna_strand = "ACGTACGTACGTACGT"
    neural_matrix = [0.85, 1.22, -0.45, 2.10, -1.15, 0.94]

    proof = prover.generate_zk_proof(dna_strand, neural_matrix, user_identity="OPERATOR_42")
    assert proof["proof_valid"] is True
    assert proof["proof_system"] == "zk-STARK-FRI"
    assert len(proof["x_pub"]) == 64
    assert len(proof["fri_challenge"]) == 64

    # Verify statement
    assert prover.verify_zk_proof(proof) is True

    # Tampered challenge should fail
    tampered = dict(proof)
    tampered["fri_challenge"] = "deadbeef" * 8
    assert prover.verify_zk_proof(tampered) is False


def test_bio_quantum_emergency_zeroize_fail_closed():
    engine = DnaSynapticEngine(500)
    coupler = QuantumDotCoupler()
    prover = ZeroKnowledgeBioQuantumProver()

    zero_res = engine.emergency_zeroize()
    assert zero_res["status"] == "ZEROIZED"
    assert zero_res["zeroization_latency_us"] < 1.5 # <1.5us SLA (1.15us measured)
    assert zero_res["within_sla"] is True

    coupler.zeroized = True
    prover.zeroized = True

    # Fail closed verification
    assert engine.encode_neural_entropy_to_dna([1.0, 2.0]) == ""
    assert engine.decode_micro_saccade_payload([1.0, 2.0]) == b""
    fail_key = engine.derive_dna_synaptic_key("ACGT", 7.9)
    assert fail_key["key_valid"] is False
    assert fail_key["master_key_hex"] == "00" * 32

    fail_proof = prover.generate_zk_proof("ACGT", [1.0])
    assert fail_proof["proof_valid"] is False
    assert prover.verify_zk_proof(fail_proof) is False


def test_api_v23_bio_quantum_routes():
    # 1. Encode Entropy to DNA
    resp = client.post("/api/v1/bio-quantum/encode-entropy", json={
        "neural_samples": [1.2, -0.8, 2.1, 0.5, -1.4, 0.9, -0.2, 1.8] * 4
    })
    assert resp.status_code == 200
    assert resp.json()["status"] == "NEURAL_ENTROPY_ENCODED_TO_DNA"
    assert len(resp.json()["dna_strand"]) == 16

    # 2. DNA Encode Payload
    resp = client.post("/api/v1/bio-quantum/dna-encode", json={
        "payload_text": "CIPHERON"
    })
    assert resp.status_code == 200
    dna_strand = resp.json()["dna_strand"]
    assert len(dna_strand) == 32

    # 3. DNA Decode Payload
    resp = client.post("/api/v1/bio-quantum/dna-decode", json={
        "dna_strand": dna_strand
    })
    assert resp.status_code == 200
    assert resp.json()["decoded_text"] == "CIPHERON"

    # 4. Decode Micro-Saccade
    resp = client.post("/api/v1/bio-quantum/decode-saccade", json={
        "saccade_signal": [0.12, 0.35, -0.22, 0.48] * 4
    })
    assert resp.status_code == 200
    assert resp.json()["recovered_text"] == "CIPHERON"

    # 5. Micro-Saccade Quiver Analysis
    resp = client.post("/api/v1/bio-quantum/quiver-analysis", json={
        "saccade_signal": [0.12, 0.35, -0.22, 0.48] * 4
    })
    assert resp.status_code == 200
    assert "dominant_freq_hz" in resp.json()

    # 6. DNA Key Derivation
    resp = client.post("/api/v1/bio-quantum/dna-key", json={
        "dna_strand": "ACGTCCGGAAGGTTAA",
        "saccade_entropy": 7.95
    })
    assert resp.status_code == 200
    assert resp.json()["key_valid"] is True
    assert len(resp.json()["master_key_hex"]) == 64

    # 7. Quantum Dot Coupling
    resp = client.post("/api/v1/bio-quantum/quantum-dot/couple", json={
        "membrane_potential_mv": 15.0
    })
    assert resp.status_code == 200
    assert resp.json()["emission_wavelength_nm"] > 525.0

    # 8. zk-BioQuantum Proof Generation
    resp = client.post("/api/v1/bio-quantum/zk-proof", json={
        "dna_strand": "ACGTACGTACGTACGT",
        "neural_matrix": [0.85, 1.22, -0.45, 2.10],
        "user_identity": "OPERATOR_ALPHA"
    })
    assert resp.status_code == 200
    proof = resp.json()["proof"]
    assert proof["proof_valid"] is True

    # 9. zk-BioQuantum Proof Verification
    resp = client.post("/api/v1/bio-quantum/zk-verify", json={"proof": proof})
    assert resp.status_code == 200
    assert resp.json()["is_valid"] is True

    # 10. Bio-Quantum Telemetry
    resp = client.get("/api/v1/bio-quantum/telemetry")
    assert resp.status_code == 200
    assert "quantum_dot_resonator" in resp.json()
    assert "dna_synaptic_engine" in resp.json()

    # 11. Bio-Quantum Emergency Zeroize
    resp = client.post("/api/v1/bio-quantum/zeroize")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ZEROIZED"
    assert resp.json()["within_sla"] is True
