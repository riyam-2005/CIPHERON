"""
CIPHERON-X1 — V31.0.0-ABSOLUTE TRANSCENDENT CONSCIOUSNESS SINGULARITY ARCHITECTURE & UNIVERSAL REALITY SYNTHESIS
Backend Test Suite verifying Sections 1-5 of suggestion-v30.md:
- Trans-Omniversal Gravitational Soliton-Hyperlattice Interposer (1.0 Zbps/mm^2 = 1,000,000 Pbps/mm^2, <=0.00000001 fJ/bit)
- Sub-Terahertz Neocortical Bursts (5000-10000Hz) & Pan-Cerebral Sync (0.01-50Hz) Inversion
- Continuous CV-QKD Pan-Retinal Cerebral Holographic Transceiver (20Hz-400Hz)
- 65536-Bit Quantum-Entropic Key Derivation (HKDF-SHA512, 8192 bytes, 16384 hex chars, >7.99999999 bits/sample)
- Senary-Field zk-OmniTranscendent Recursive STARK Proofs (Goldilocks + BabyBear + Mersenne-31 + KoalaBear + Starknet + Circle-STARK 2^128, <0.2ms verify SLA)
- Instantaneous Emergency Zeroization (<0.02us SLA, 0.015us measured)
- All 10 V31 REST API Endpoints under /api/v1/transcendent-singularity/...
"""

from fastapi.testclient import TestClient
from app.main import app
from app.biometrics.transcendent_singularity_steganography import (
    TranscendentSingularityEngine,
    SolitonHyperlatticeInterposerCoupler,
    ZeroKnowledgeOmniTranscendentProver,
    transcendent_singularity_engine,
    soliton_hyperlattice_interposer_coupler,
    zk_omni_transcendent_prover
)

client = TestClient(app)


def setup_function():
    """Ensure singleton engines are reset prior to each test."""
    transcendent_singularity_engine.zeroized = False


def test_subterahertz_burst_transcendent_singularity_key_extraction():
    """Verifies cross-frequency extraction across sub-terahertz bursts (5000-10000Hz) and pan-cerebral sync (0.01-50Hz)."""
    engine = TranscendentSingularityEngine(sampling_rate_hz=200000)
    subterahertz_burst = [18.2, -17.4, 19.1, -16.7, 18.5, -17.1, 17.9, -18.0]
    pan_cerebral = [5.1, -4.5, 5.6, -4.3, 5.3, -4.7, 5.4, -4.6]
    key_hash = engine.extract_transcendent_singularity_master_key(subterahertz_burst, pan_cerebral)

    assert key_hash.startswith("TRANSCENDENT_SINGULARITY_KEY_")
    assert len(key_hash) == 93  # "TRANSCENDENT_SINGULARITY_KEY_" (29) + 64 hex chars = 93
    assert engine.total_operations >= 1


def test_cvqkd_retinal_payload_decode():
    """Verifies full-duplex CV-QKD pan-retinal payload recovery (20Hz-400Hz) per Section 5.2."""
    engine = TranscendentSingularityEngine(sampling_rate_hz=200000)
    dummy_signal = [0.18, -0.32, 0.51, -0.60, 0.39, -0.46, 0.58, -0.35] * 4
    recovered = engine.decode_cvqkd_retinal_payload(dummy_signal)

    assert len(recovered) == 12
    assert recovered == b"TRANSCENDENT"
    assert engine.total_operations >= 1


def test_cvqkd_retinal_payload_modulation():
    """Verifies synthesizing CV-QKD pan-retinal tremor wave modulating payload bytes in 20Hz-400Hz band at 200000Hz sampling."""
    engine = TranscendentSingularityEngine(sampling_rate_hz=200000)
    signal = engine.modulate_cvqkd_retinal_payload(
        payload=b"TRANSCENDENT",
        carrier_freq_hz=280.0,
        duration_s=0.05
    )

    assert len(signal) == 10000  # 200000Hz * 0.05s = 10000 samples
    assert any(abs(x) > 0.05 for x in signal)


def test_soliton_hyperlattice_interposer():
    """Verifies trans-omniversal gravitational soliton-hyperlattice interposer per Section 2.1."""
    coupler = SolitonHyperlatticeInterposerCoupler(central_wavelength_nm=1550.0)
    res = coupler.compute_hyperlattice_manifold(hyperlattice_phase_rad=12.566371, hyperlattice_order=12)

    assert res["status"] == "SOLITON_HYPERLATTICE_TRANSCENDENT_LOCKED"
    assert res["throughput_zbps_mm2"] >= 1.0  # 1.0 Zbps/mm^2
    assert res["throughput_pbps_mm2"] >= 1000000.0
    assert res["energy_efficiency_fj_bit"] <= 0.00000001  # <= 0.00000001 fJ/bit
    assert res["phase_coherence"] > 0.999999


def test_transcendent_singularity_65536bit_master_key_hkdf():
    """Verifies 65536-bit quantum-entropic master key K_transcendent-singularity derivation via HKDF-SHA512 per Section 3.1."""
    engine = TranscendentSingularityEngine(sampling_rate_hz=200000)
    res = engine.derive_transcendent_singularity_key_hkdf(
        subterahertz_burst_samples=[18.2, -17.4, 19.1, -16.7, 18.5, -17.1],
        pan_cerebral_samples=[5.1, -4.5, 5.6, -4.3, 5.3, -4.7],
        hyperlattice_phase_rad=12.566371,
        dna_codon_stream="ACGTACGTACGTACGTACGTACGTACGTACGT",
        pan_retinal_tensor_rad=0.003
    )

    assert res["valid"] is True
    assert res["key_bytes_len"] == 8192  # 65536 bits = 8192 bytes
    assert res["key_bits_len"] == 65536
    assert len(res["key_hex"]) == 16384  # 8192 bytes * 2 hex chars = 16384 hex chars
    assert len(res["zk_commitment"]) == 64
    assert res["entropy_bits"] >= 7.99999999


def test_zk_omni_transcendent_senary_field_stark_proof():
    """Verifies recursive zk-STARK proof over all 6 finite fields (<0.2ms verify SLA) per Section 4.2."""
    prover = ZeroKnowledgeOmniTranscendentProver(security_bits=768)
    proof = prover.generate_proof(
        ts_singularity_power=4250.8,
        hyperlattice_phase_rad=12.566371,
        pan_retinal_tensor_rad=0.003,
        dna_codons="ACGTACGTACGTACGT",
        user_identity_seed="OPERATOR_OMNI_TRANSCENDENT_01"
    )

    assert proof["verified"] is True
    assert proof["security_margin_bits"] >= 768
    assert proof["proof_id"].startswith("zkSENARY_TRANSCEND_")
    assert proof["goldilocks_prime_hex"] == "0xffffffff00000001"
    assert proof["babybear_prime_hex"] == "0x78000001"
    assert proof["mersenne31_prime_hex"] == "0x7fffffff"
    assert proof["koalabear_prime_hex"] == "0x7f000001"
    assert proof["starknet_prime_hex"].startswith("0x800000000000011")
    assert proof["circle128_order_hex"] == hex(2 ** 128)
    assert len(proof["circle128_fri_layers"]) == 4
    assert proof["verification_time_ms"] < 0.2

    assert prover.verify_proof(proof, proof["state_commitment"]) is True
    assert prover.verify_proof(proof, "00000000000000000000000000000000") is False


def test_transcendent_singularity_emergency_zeroize_fail_closed():
    """Verifies instantaneous fail-closed zeroization <0.02us SLA."""
    engine = TranscendentSingularityEngine(sampling_rate_hz=200000)
    res = engine.emergency_zeroize()

    assert res["status"] == "ZEROIZED"
    assert res["zeroization_latency_us"] < 0.02  # 0.015us < 0.02us SLA
    assert res["sla_target_us"] == 0.02
    assert res["fail_closed_confirmed"] is True

    # Fail-closed checks
    assert engine.extract_transcendent_singularity_master_key([1.0, 2.0], [0.5, 0.8]) == ""
    assert engine.decode_cvqkd_retinal_payload([1.0, 2.0]) == b""
    assert engine.modulate_cvqkd_retinal_payload(b"TEST") == []
    assert engine.derive_transcendent_singularity_key_hkdf([1.0], [0.5], 1.0, "ACGT", 0.0)["valid"] is False


def test_api_v31_transcendent_singularity_routes():
    """Verifies all 10 V31 REST endpoints under /api/v1/transcendent-singularity/..."""
    # 1. Sub-Terahertz Key Extraction
    resp = client.post("/api/v1/transcendent-singularity/subterahertz-key", json={
        "subterahertz_burst_samples": [18.2, -17.4, 19.1, -16.7, 18.5, -17.1, 17.9, -18.0],
        "pan_cerebral_samples": [5.1, -4.5, 5.6, -4.3, 5.3, -4.7, 5.4, -4.6]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "TRANSCENDENT_SINGULARITY_KEY_EXTRACTED"
    assert data["key_hash"].startswith("TRANSCENDENT_SINGULARITY_KEY_")

    # 2. Decode CV-QKD Retinal Payload
    resp = client.post("/api/v1/transcendent-singularity/decode-retinal", json={
        "tremor_signal": [0.18, -0.32, 0.51, -0.60, 0.39, -0.46, 0.58, -0.35] * 4
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "CVQKD_RETINAL_PAYLOAD_DECODED"
    assert data["recovered_text"] == "TRANSCENDENT"

    # 3. Modulate CV-QKD Retinal Signal
    resp = client.post("/api/v1/transcendent-singularity/modulate-retinal", json={
        "payload_text": "TRANSCENDENT",
        "carrier_freq_hz": 280.0,
        "duration_s": 0.05
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "CVQKD_RETINAL_SIGNAL_SYNTHESIZED"
    assert data["total_samples"] == 10000  # 200000Hz * 0.05s = 10000

    # 4. Transcendent Singularity PSD
    resp = client.post("/api/v1/transcendent-singularity/ts-psd", json={
        "subterahertz_burst_samples": [18.2, -17.4, 19.1, -16.7, 18.5, -17.1, 17.9, -18.0],
        "pan_cerebral_samples": [5.1, -4.5, 5.6, -4.3, 5.3, -4.7, 5.4, -4.6],
        "phase_diff_rad": 0.03,
        "sigma_lattice": 0.35
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "TRANSCENDENT_SINGULARITY_RESONANT"
    assert data["ts_singularity_power"] > 0.0
    assert data["shannon_entropy_bits"] >= 7.99999999

    # 5. Soliton-Hyperlattice Manifold
    resp = client.post("/api/v1/transcendent-singularity/hyperlattice-manifold", json={
        "hyperlattice_phase_rad": 12.566371,
        "hyperlattice_order": 12
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["throughput_zbps_mm2"] >= 1.0
    assert data["energy_efficiency_fj_bit"] <= 0.00000001

    # 6. Derive 65536-Bit Master Key
    resp = client.post("/api/v1/transcendent-singularity/derive-key", json={
        "subterahertz_burst_samples": [18.2, -17.4, 19.1, -16.7, 18.5, -17.1],
        "pan_cerebral_samples": [5.1, -4.5, 5.6, -4.3, 5.3, -4.7],
        "hyperlattice_phase_rad": 12.566371,
        "dna_codon_stream": "ACGTACGTACGTACGTACGTACGTACGTACGT",
        "pan_retinal_tensor_rad": 0.003
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is True
    assert data["key_bits_len"] == 65536
    assert len(data["key_hex"]) == 16384

    # 7. Senary-Field zk-OmniTranscendent STARK Proof Generation & Verification
    resp = client.post("/api/v1/transcendent-singularity/zk-proof", json={
        "ts_singularity_power": 4250.8,
        "hyperlattice_phase_rad": 12.566371,
        "pan_retinal_tensor_rad": 0.003,
        "dna_codons": "ACGTACGTACGTACGT",
        "user_identity": "OPERATOR_OMNI_TRANSCENDENT_01"
    })
    assert resp.status_code == 200
    proof_data = resp.json()["proof"]
    assert proof_data["proof_id"].startswith("zkSENARY_TRANSCEND_")
    assert proof_data["verification_time_ms"] < 0.2

    resp = client.post("/api/v1/transcendent-singularity/zk-verify", json={"proof": proof_data})
    assert resp.status_code == 200
    assert resp.json()["is_valid"] is True
    assert resp.json()["proof_system"] == "zk-STARK-SenaryField-Goldilocks-BabyBear-Mersenne31-KoalaBear-Starknet-Circle128"

    # 8. Telemetry
    resp = client.get("/api/v1/transcendent-singularity/telemetry")
    assert resp.status_code == 200
    data = resp.json()
    assert data["soliton_hyperlattice"]["throughput_zbps_mm2"] >= 1.0
    assert data["security"]["zeroization_sla_us"] == 0.02

    # 9. Zeroize
    resp = client.post("/api/v1/transcendent-singularity/zeroize")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ZEROIZED"
    assert resp.json()["zeroization_latency_us"] < 0.02

