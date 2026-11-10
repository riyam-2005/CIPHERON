"""
CIPHERON-X1 V6.0-NEURAL-QUANTUM SILICON FABRIC Test Suite
Tests Neuromorphic SNN LIF Event Engine, Firmware Symbolic CFG Decompiler,
EMFI Precision Glitch Controller, zk-SNARK Plonk Proof-of-Analysis, and API Endpoints.
"""

import pytest
import struct
from fastapi.testclient import TestClient
from app.main import app
from app.ai.neuromorphic_snn import snn_engine
from app.firmware.decompiler import FirmwareSymbolicDecompiler
from app.hardware.glitch_controller import glitch_controller
from app.crypto.zk_snark import zk_engine

client = TestClient(app)


def test_neuromorphic_snn_lif_events():
    """Verify SNN Leaky Integrate-and-Fire streaming event engine."""
    sample_stream = b"CIPHERON_X1_NEUROMORPHIC_SNN_EVENT_STREAM_V6"
    res = snn_engine.process_event_stream(sample_stream)

    assert res["total_bytes_processed"] == len(sample_stream)
    assert res["total_spikes_emitted"] > 0
    assert len(res["neuron_spike_counts"]) == 32
    assert 0.0 < res["estimated_entropy"] <= 8.0
    assert res["power_consumption_mw"] < 1.0
    assert res["decay_factor_beta"] == 0.85


def test_firmware_symbolic_decompiler():
    """Verify bare-metal firmware decompiler, CFG recovery & crypto constant detection."""
    # Construct synthetic SPI flash dump with SHA-256 H0 and AES S-Box bytes
    sha256_h0 = struct.pack("<I", 0x6A09E667)
    aes_sbox = bytes([0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5])
    padding = b"\x00" * 32
    binary_blob = padding + sha256_h0 + b"password=admin" + padding + aes_sbox + padding

    decompiler = FirmwareSymbolicDecompiler(binary_blob, load_address=0x08000000, arch="ARMEL")
    res = decompiler.analyze_firmware()

    assert res["total_bytes"] == len(binary_blob)
    assert res["basic_blocks_count"] >= 2
    assert res["edges_count"] >= 1
    assert any(c["name"] == "SHA256_INIT_H0" for c in res["detected_constants"])
    assert any(c["name"] == "AES_SBOX_TABLE" for c in res["detected_constants"])
    assert len(res["extracted_strings"]) > 0
    assert any(v["cwe"] == "CWE-798" for v in res["vulnerability_alerts"])


def test_emfi_glitch_controller_precision():
    """Verify Active EMFI glitch pulser quantizes to 12.5ns and simulates fault response."""
    # 25ns width (2 ticks of 12.5ns) at 120ns delay -> Sweet spot
    res = glitch_controller.trigger_single_glitch(pulse_width_ns=25.0, delay_offset_ns=120.0, repeat_count=1)

    assert res["quantized_ticks"] == 2
    assert res["calibrated_width_ns"] == 25.0
    assert res["fault_injected"] is True
    assert "SUCCESSFUL_FAULT" in res["target_response"]

    # 100ns width -> Muted hang / brownout
    res_wide = glitch_controller.trigger_single_glitch(pulse_width_ns=100.0, delay_offset_ns=50.0)
    assert res_wide["fault_injected"] is False
    assert "MUTED_HANG" in res_wide["target_response"]


def test_emfi_glitch_campaign_sweep():
    """Verify automated 2D parameter sweep matrix across pulse widths and offsets."""
    res = glitch_controller.run_parameter_sweep_campaign(
        min_width_ns=12.5,
        max_width_ns=37.5,
        min_delay_ns=100.0,
        max_delay_ns=150.0
    )

    assert res["total_trials"] > 0
    assert res["successful_faults"] >= 1
    assert res["vulnerability_rate_pct"] > 0.0
    assert "sweet_spot_recommendation" in res
    assert len(res["sweep_sample"]) > 0


def test_zk_snark_proof_of_analysis():
    """Verify zk-SNARK Plonk BN254 Zero-Knowledge Proof generation and verification."""
    private_secret = "FLAG{RECOVERED_MASTER_KEY_V6_PROVEN}"
    public_tag = "CHALLENGE_SUBMISSION_01"

    # 1. Prover generates succinct proof
    proof = zk_engine.generate_proof(private_witness=private_secret, public_tag=public_tag)

    assert proof["protocol"] == "PLONK-KZG-16"
    assert proof["curve"] == "BN254"
    assert "pi_a" in proof["proof_vector"]
    assert "pi_b" in proof["proof_vector"]
    assert "pi_c" in proof["proof_vector"]
    assert len(proof["public_inputs"]["public_statement_sha256"]) == 64

    # 2. Verifier verifies proof without access to private_secret
    verify_res = zk_engine.verify_proof(proof)

    assert verify_res["is_valid"] is True
    assert verify_res["status"] == "PROOF_VERIFIED_ZERO_KNOWLEDGE"
    assert verify_res["public_tag"] == public_tag


def test_api_v6_endpoints():
    """Verify FastAPI V6 REST endpoints for SNN, Decompiler, EMFI, and zk-SNARK."""
    # 1. Root check
    r_root = client.get("/")
    assert r_root.status_code == 200
    assert any(v in r_root.json()["version"] for v in ("6.0.0-NEURAL", "7.0.0-AUTONOMOUS", "8.0.0-AUTONOMOUS", "9.0.0-SINGULARITY"))

    # 2. SNN infer endpoint
    r_snn = client.post("/api/v1/snn/infer", json={"data": "48656c6c6f5f534e4e"})
    assert r_snn.status_code == 200
    assert r_snn.json()["total_spikes_emitted"] > 0

    # 3. Firmware decompile endpoint
    hex_payload = "0000000067e6096a" + "41424344" * 8
    r_dec = client.post("/api/v1/firmware/decompile", json={"binary_hex": hex_payload, "load_address": 0x08000000})
    assert r_dec.status_code == 200
    assert r_dec.json()["basic_blocks_count"] >= 1

    # 4. Glitch pulse endpoint
    r_pulse = client.post("/api/v1/glitch/pulse", json={"pulse_width_ns": 25.0, "delay_offset_ns": 120.0})
    assert r_pulse.status_code == 200
    assert "calibrated_width_ns" in r_pulse.json()

    # 5. Glitch campaign endpoint
    r_camp = client.post("/api/v1/glitch/campaign", json={"min_width_ns": 12.5, "max_width_ns": 37.5, "min_delay_ns": 80.0, "max_delay_ns": 140.0})
    assert r_camp.status_code == 200
    assert r_camp.json()["total_trials"] > 0

    # 6. zk-SNARK prove & verify endpoints
    r_prove = client.post("/api/v1/zk/prove", json={"private_witness": "SECRET_KEY_123", "public_tag": "TEST_PROOF"})
    assert r_prove.status_code == 200
    proof = r_prove.json()
    assert "proof_vector" in proof

    r_verify = client.post("/api/v1/zk/verify", json={"proof": proof})
    assert r_verify.status_code == 200
    assert r_verify.json()["is_valid"] is True
