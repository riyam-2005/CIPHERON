"""
CIPHERON-X1 V9.0.0-SINGULARITY SILICON, NEURAL-MEMRISTOR CROSSBAR & DEEP SPACE INTERPLANETARY MESH
PyTest Suite covering DTN RFC 5050 Bundle Protocol, 1T1M Memristor PIM Crossbar,
Transparent FRI-zk-STARKs, and Microfluidic Chemical Zeroization (<500ns).
Adhering to suggestion-v8.md Sections 1-6
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.network.dtn_mesh import dtn_mesh_manager, compute_deep_space_link_margin
from app.hardware.memristor_crossbar import memristor_crossbar
from app.crypto.zk_stark import zk_stark_engine

client = TestClient(app)


def test_dtn_bundle_dispatch_and_merkle():
    """Test RFC 5050 bundle creation, Merkle tree root hash generation, and interplanetary route planning."""
    payload = {
        "source_eid": "dtn://earth.ground/node-alpha",
        "destination_eid": "dtn://mars.surface/jezero-term",
        "payload_text": "SINGULARITY_HOMOMORPHIC_PAYLOAD_V9_INTERPLANETARY",
        "request_custody_transfer": True
    }
    response = client.post("/api/v1/dtn/bundle-dispatch", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "DISPATCHED"
    assert "bundle_id" in data
    assert len(data["bundle_id"]) == 64  # SHA-256
    assert "merkle_root" in data
    assert len(data["merkle_root"]) == 64
    assert data["chunk_count"] >= 1
    assert data["custodian_node"] == "dtn://earth.ground/node-alpha"

    route = data["route_telemetry"]
    assert route["protocol_spec"] == "RFC 5050 / CCSDS 734.2-B-1"
    assert route["direct_distance_km"] > 50000000.0  # Earth-Mars interplanetary distance
    assert route["direct_propagation_delay_min"] >= 3.0  # At least 3 minutes speed-of-light delay
    assert len(route["hops"]) >= 2


def test_dtn_custody_transfer_and_link_margin():
    """Test custodian custody transfer mechanics and deep-space link margin equation (>= 6.0 dB)."""
    # First dispatch bundle
    dispatch_res = client.post("/api/v1/dtn/bundle-dispatch", json={
        "source_eid": "dtn://earth.ground/node-alpha",
        "destination_eid": "dtn://mars.surface/jezero-term",
        "payload_text": "TEST_CUSTODY_TRANSFER_DATA"
    })
    assert dispatch_res.status_code == 200
    bundle_id = dispatch_res.json()["bundle_id"]

    # Transfer custody to Sun-Earth L1 Lagrange custodian
    transfer_res = client.post("/api/v1/dtn/custody-transfer", json={
        "bundle_id": bundle_id,
        "next_custodian_eid": "dtn://lagrange.l1/custodian-sol"
    })
    assert transfer_res.status_code == 200
    t_data = transfer_res.json()

    assert t_data["custody_status"] == "ACCEPTED"
    assert t_data["new_custodian"] == "dtn://lagrange.l1/custodian-sol"
    assert "link_budget" in t_data
    budget = t_data["link_budget"]
    assert budget["link_margin_db"] >= 6.0  # Suggestion-v8.md equation: Link Margin >= 6.0 dB
    assert budget["margin_meets_requirement"] is True


def test_dtn_interplanetary_telemetry():
    """Verify deep-space constellation telemetry and Lagrange point node metadata."""
    response = client.get("/api/v1/dtn/telemetry")
    assert response.status_code == 200
    data = response.json()

    assert data["constellation_version"] == "9.0.0-SINGULARITY SILICON"
    assert data["active_nodes_count"] >= 8
    assert data["carrier_wavelength_nm"] == 1550.0
    assert data["minimum_required_margin_db"] == 6.0

    node_eids = [n["eid"] for n in data["active_nodes"]]
    assert "dtn://earth.ground/node-alpha" in node_eids
    assert "dtn://moon.gateway/node-l1" in node_eids
    assert "dtn://lagrange.l1/custodian-sol" in node_eids
    assert "dtn://lagrange.l2/custodian-deep" in node_eids
    assert "dtn://mars.surface/jezero-term" in node_eids


def test_memristor_vmm_analog_multiplication():
    """Verify 1T1M nanoscale memristive Vector-Matrix Multiplication obeying Ohm's & Kirchhoff's laws."""
    # Reset crossbar to baseline
    memristor_crossbar.is_zeroized = False
    memristor_crossbar.microfluidic_armed = True

    payload = {
        "input_voltages": [1.5, 0.8, 1.2, 0.5]
    }
    response = client.post("/api/v1/memristor/vmm-transform", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "SUCCESS"
    assert len(data["i_out_ma"]) == 4
    for current in data["i_out_ma"]:
        assert current > 0.0  # Accumulated positive currents
    assert data["efficiency_tops_per_watt"] >= 100.0
    assert data["latency_ns"] < 15.0
    assert data["memory_bus_traffic_bytes"] == 0  # Zero memory fetch (Processing-in-Memory)


def test_memristor_cell_conductance_programming():
    """Test dynamic conductance modulation of individual 1T1M memristive cells."""
    memristor_crossbar.is_zeroized = False
    program_res = client.post("/api/v1/memristor/program-cell", json={
        "row": 1,
        "col": 2,
        "conductance_ms": 1.75
    })
    assert program_res.status_code == 200
    data = program_res.json()
    assert data["cell"] == "WL_1_BL_2"
    assert data["new_conductance_ms"] == 1.75

    # Verify telemetry reflects modified conductance
    telem_res = client.get("/api/v1/memristor/telemetry")
    assert telem_res.status_code == 200
    matrix = telem_res.json()["conductance_matrix"]
    assert matrix[1][2] == 1.75


def test_memristor_frequency_transform_and_classification():
    """Test in-memory frequency transformation and neural entropy classification."""
    payload = {
        "payload_text": "ATTACK_AT_DAWN_SECRET_PLAINTEXT_CIPHERON_TEST_VECTOR_12345"
    }
    response = client.post("/api/v1/memristor/frequency-transform", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "neural_classification" in data
    assert data["efficiency_tops_per_watt"] >= 100.0
    assert len(data["input_voltage_bands"]) == 4
    assert len(data["vmm_output_currents_ma"]) == 4


def test_zk_stark_transparent_fri_proof_and_verification():
    """Verify transparent Fast Reed-Solomon IOPP zk-STARK prover and verifier (>=128-bit quantum security)."""
    # 1. Generate zk-STARK proof
    prove_payload = {
        "seed_secret": 987654,
        "steps": 64,
        "homomorphic_context": "BFV_INTERPLANETARY_BLIND_CONTEXT"
    }
    prove_res = client.post("/api/v1/stark/prove", json=prove_payload)
    assert prove_res.status_code == 200
    proof = prove_res.json()

    assert proof["protocol"] == "FRI-zk-STARK"
    assert proof["trusted_setup_required"] is False  # Transparent: NO trusted setup ceremony
    assert proof["post_quantum_resistant"] is True
    assert proof["security_bits"] >= 128
    assert "trace_commitment" in proof["commitments"]
    assert len(proof["fri_folding_rounds"]) >= 3
    assert len(proof["query_evaluations"]) >= 1

    # 2. Verify zk-STARK proof
    verify_res = client.post("/api/v1/stark/verify", json={"proof": proof})
    assert verify_res.status_code == 200
    verify_data = verify_res.json()

    assert verify_data["valid"] is True
    assert verify_data["post_quantum_status"] == "SECURE_AGAINST_GROVER_AND_SHOR"
    assert verify_data["security_level_bits"] >= 128
    assert "NONE (Transparent IOPP)" in verify_data["trusted_setup"]


def test_microfluidic_chemical_zeroization():
    """Verify autonomous microfluidic chemical dissolution (<500ns) and fail-closed defense."""
    # Ensure armed baseline
    memristor_crossbar.is_zeroized = False
    memristor_crossbar.microfluidic_armed = True

    status_res = client.get("/api/v1/security/microfluidic-status")
    assert status_res.status_code == 200
    assert status_res.json()["armed"] is True

    # Trigger emergency zeroization via physical probe intrusion
    trigger_res = client.post("/api/v1/security/microfluidic-trigger", json={
        "trigger_source": "FIB_MICRO_PROBE_PASSIVATION_BREACH"
    })
    assert trigger_res.status_code == 200
    trig_data = trigger_res.json()

    assert trig_data["exothermic_reaction_initiated"] is True
    assert trig_data["silicon_metallization_destroyed"] is True
    assert trig_data["dissolution_latency_ns"] < 500.0  # <500ns silicon dissolution requirement
    assert trig_data["status"] == "PERMANENTLY_ZEROIZED"

    # Subsequent VMM should return zero currents and blocked status
    vmm_after = client.post("/api/v1/memristor/vmm-transform", json={"input_voltages": [1.0, 1.0, 1.0, 1.0]})
    assert vmm_after.status_code == 200
    assert vmm_after.json()["status"] == "ZEROIZED"
    assert vmm_after.json()["i_out_ma"] == [0.0, 0.0, 0.0, 0.0]

    # Re-arm crossbar for system operation
    memristor_crossbar.is_zeroized = False
    memristor_crossbar.microfluidic_armed = True
    memristor_crossbar.__init__(rows=4, cols=4)
