"""
CIPHERON-X1 — V7.0 Autonomous Silicon, Homomorphic Cryptanalysis & DNA Provenance Test Suite
Adhering to suggestion-v6.md Sections 2, 3, 4, 5 & 6
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.hardware.efpga_compiler import efpga_compiler
from app.crypto.fhe_analyzer import fhe_analyzer
from app.provenance.dna_archive import dna_archive
from app.crypto.qkd_mesh import qkd_mesh

client = TestClient(app)

def test_efpga_synthesis_and_bitstream():
    """Test dynamic eFPGA netlist synthesis and <15us hardware reconfiguration."""
    efpga_compiler.reset_fabric()
    res = efpga_compiler.synthesize_cipher_pipeline(
        transformation_type="LFSR_STREAM_CIPHER",
        polynomial_tap=0x80000057
    )
    assert res["crc16_verified"] is True
    assert res["allocated_luts_count"] == 16
    assert res["reconfiguration_latency_us"] < 15.0  # <15us constraint
    assert len(res["bitstream_hex"]) > 0
    assert res["gate_equivalent_count"] > 0

def test_efpga_silicon_self_healing():
    """Test dynamic silicon self-healing: isolating damaged LUT and re-routing to reserve logic."""
    efpga_compiler.reset_fabric()
    # Damage LUT 14
    heal_res = efpga_compiler.heal_faulty_lut(damaged_lut_id=14)
    assert heal_res["success"] is True
    assert heal_res["status"] == "SILICON_SELF_HEALED"
    assert heal_res["quarantined_lut"] == 14
    assert heal_res["replacement_lut"] >= 48  # Reserve space (48..63)
    assert heal_res["reconfig_latency_us"] < 15.0

    telemetry = efpga_compiler.get_fabric_telemetry()
    assert telemetry["quarantined_count"] == 1
    assert telemetry["active_reserves_count"] == 1
    assert telemetry["healing_events"] == 1

def test_fhe_encryption_and_homomorphic_search():
    """Test BFV RLWE polynomial homomorphic frequency search without decrypting raw data."""
    sample = b"CIPHERON_HOMOMORPHIC_ENCRYPTED_SEARCH_EXPERIMENT"
    ciphertexts = fhe_analyzer.encrypt_bytes(sample)
    assert len(ciphertexts) == len(sample)

    # Search for byte ord('E') = 69
    expected_e_count = sample.count(b'E')
    search_res = fhe_analyzer.homomorphic_frequency_analysis(ciphertexts, target_byte=69)
    assert search_res["homomorphic_matches"] == expected_e_count
    assert search_res["scheme"] == "BFV_RLWE_POLYNOMIAL"
    assert search_res["target_ascii"] == "E"

def test_mpc_additive_secret_sharing():
    """Test 2-party Secure Multi-Party Computation without data disclosure."""
    node_a = b"SECRETAAA"
    node_b = b"SECRETBBB"
    target = ord('A')  # 65

    res = fhe_analyzer.simulate_mpc_frequency_search(node_a, node_b, target_byte=target)
    assert res["zero_exposure_verified"] is True
    assert res["joint_frequency_matches"] == 3
    assert res["node_a_masked_share"] != 3  # Masked with random blinding factor

def test_dna_archive_encode_decode():
    """Test DNA nucleotide codon translation, GC content, and 215 PB/g density metrics."""
    original_text = "CIPHERON_ZK_MERKLE_PROVENANCE_ROOT_0x9A4B"
    enc = dna_archive.encode_to_dna_sequence(original_text.encode("utf-8"))

    dna_str = enc["dna_sequence"]
    assert len(dna_str) > 0
    assert all(c in "ACGT" for c in dna_str)
    assert enc["theoretical_density_pb_per_g"] == 215.0
    assert 20.0 <= enc["gc_content_pct"] <= 80.0

    # Decode and verify integrity
    dec = dna_archive.decode_from_dna_sequence(dna_str)
    assert dec["success"] is True
    assert dec["crc_verified"] is True
    assert dec["decoded_text"] == original_text
    assert dec["mutations_detected"] == 0

def test_qkd_bb84_and_bell_inequality():
    """Test BB84 QBER monitoring (<11% boundary) and E91 CHSH Bell state violation (S > 2.0)."""
    # 1. Normal secure channel
    bb84_clean = qkd_mesh.simulate_bb84_protocol(num_photons=256, channel_noise_pct=1.0, eavesdropper_active=False)
    assert bb84_clean["is_secure"] is True
    assert bb84_clean["qber_pct"] < 11.0
    assert bb84_clean["status"] == "UNCONDITIONALLY_SECURE_KEY"
    assert bb84_clean["generated_key_hex"] is not None

    # 2. Channel with active eavesdropper (Eve intercept-resend)
    bb84_eve = qkd_mesh.simulate_bb84_protocol(num_photons=512, channel_noise_pct=1.0, eavesdropper_active=True)
    assert bb84_eve["qber_pct"] >= 11.0  # Eve introduces ~25% error
    assert bb84_eve["is_secure"] is False
    assert bb84_eve["status"] == "EAVESDROPPER_DETECTED_STATE_COLLAPSED"

    # 3. E91 CHSH Bell inequality test
    bell_res = qkd_mesh.evaluate_e91_bell_inequality()
    assert bell_res["chsh_parameter_s"] > 2.0  # Quantum violation of local realism
    assert bell_res["entanglement_verified"] is True
    assert bell_res["status"] == "NON_LOCAL_ENTANGLEMENT_CONFIRMED"

def test_api_v7_routes():
    """Verify REST endpoints for all V7 silicon, homomorphic, DNA and QKD services."""
    # 1. eFPGA Synthesize
    res1 = client.post("/api/v1/efpga/synthesize", json={
        "transformation_type": "LFSR_STREAM_CIPHER",
        "polynomial_tap": 0x80000057
    })
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["crc16_verified"] is True
    assert data1["reconfiguration_latency_us"] < 15.0

    # 2. eFPGA Heal
    res2 = client.post("/api/v1/efpga/heal", json={"damaged_lut_id": 5})
    assert res2.status_code == 200
    assert res2.json()["success"] is True

    # 3. eFPGA Telemetry
    res3 = client.get("/api/v1/efpga/telemetry")
    assert res3.status_code == 200
    assert res3.json()["total_luts"] == 64

    # 4. FHE Frequency Search
    res4 = client.post("/api/v1/fhe/search", json={
        "plaintext": "CIPHERON_FHE_SEARCH",
        "target_byte": 67 # 'C'
    })
    assert res4.status_code == 200
    assert res4.json()["homomorphic_matches"] == 2

    # 5. MPC Collaborate
    res5 = client.post("/api/v1/mpc/collaborate", json={
        "node_a_data": "HELLO_ALICE",
        "node_b_data": "HELLO_BOB",
        "target_byte": 76 # 'L'
    })
    assert res5.status_code == 200
    assert res5.json()["joint_frequency_matches"] == 5

    # 6. DNA Encode
    res6 = client.post("/api/v1/dna/encode", json={"payload": "QUANTUM_DNA_LEDGER"})
    assert res6.status_code == 200
    dna_seq = res6.json()["dna_sequence"]

    # 7. DNA Decode
    res7 = client.post("/api/v1/dna/decode", json={"dna_sequence": dna_seq})
    assert res7.status_code == 200
    assert res7.json()["decoded_text"] == "QUANTUM_DNA_LEDGER"

    # 8. QKD Simulate
    res8 = client.post("/api/v1/qkd/simulate", json={
        "num_photons": 128,
        "channel_noise_pct": 2.0,
        "eavesdropper_active": False
    })
    assert res8.status_code == 200
    assert res8.json()["is_secure"] is True

    # 9. QKD Bell Test
    res9 = client.get("/api/v1/qkd/bell-test")
    assert res9.status_code == 200
    assert res9.json()["chsh_parameter_s"] > 2.0
