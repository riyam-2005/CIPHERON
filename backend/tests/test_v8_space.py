"""
CIPHERON-X1 V8.0 Space Mesh, Photonic TPU & Topological Quantum Resistance Test Suite
Testing orbital LEO FSO link budget, MZI optical mesh, anyon braiding, and AST protocol mutator.
Adhering to suggestion-v7.md Section 7 Quality Gates.
"""

import pytest
import math
from fastapi.testclient import TestClient

from app.main import app
from app.network.orbital_mesh import OrbitalMeshManager
from app.hardware.photonic_tpu import PhotonicTPUEngine
from app.crypto.topological_braid import TopologicalBraidEngine
from app.ai.orbital_mesh_mutator import ASTProtocolMutator

client = TestClient(app)

def test_orbital_fso_link_budget():
    mgr = OrbitalMeshManager()
    budget = mgr.calculate_link_margin(
        distance_km=1000.0,
        tx_power_dbm=30.0,
        tx_gain_dbi=105.0,
        rx_gain_dbi=105.0,
        rx_sensitivity_dbm=-38.0,
        atmospheric_loss_db=3.0
    )
    assert budget["path_loss_db"] > 240.0  # Path loss >240 dB at 1000 km (Section 2.1)
    assert budget["is_link_closed"] is True
    assert budget["link_margin_db"] > 3.0
    assert budget["bandwidth_gbps"] == 100.0
    assert budget["propagation_latency_ms"] > 0.0

def test_orbital_constellation_telemetry():
    mgr = OrbitalMeshManager(constellation_size=8)
    telem = mgr.get_constellation_telemetry()
    assert telem["active_satellites"] == 8
    assert len(telem["satellites"]) == 8
    assert len(telem["active_fso_links"]) == 8
    assert telem["ground_station_uplink"]["downlink_gbps"] == 100.0
    assert telem["global_orbital_latency_ms"] < 50.0  # Sub-50ms global latency (Section 1.1)

def test_photonic_tpu_mzi_transform():
    engine = PhotonicTPUEngine()
    res = engine.transform_optical_vector(
        theta=math.pi / 2.0,
        phi=math.pi / 4.0,
        x1=1.0,
        x2=0.0
    )
    assert res["energy_dissipation_pj"] < 0.1  # <0.1 pJ/op requirement (Section 3.1)
    assert res["propagation_latency_ps"] < 1000.0  # <1 ns light-speed propagation
    assert len(res["output_amplitudes"]) == 2
    assert len(res["optical_intensities"]) == 2
    assert abs(res["total_power_conserved"] - 1.0) < 1e-3

def test_photonic_optical_tensor_mesh():
    engine = PhotonicTPUEngine()
    mesh_res = engine.simulate_optical_tensor_mesh(
        dim=4,
        input_vector=[1.0, 0.5, -0.5, 0.2]
    )
    assert mesh_res["mesh_dimension"] == "4x4"
    assert mesh_res["mzi_element_count"] == 6
    assert len(mesh_res["output_vector"]) == 4
    assert mesh_res["total_energy_pj"] < 1.0

def test_topological_anyon_yang_baxter():
    engine = TopologicalBraidEngine()
    # Verify B_1 * B_2 * B_1 == B_2 * B_1 * B_2
    res = engine.verify_yang_baxter_braid_relation(i=1, strands=4)
    assert res["relation_holds"] is True
    assert res["lhs_permutation"] == res["rhs_permutation"]
    assert res["decoherence_resistance_score"] == 1.000
    assert res["quantum_fault_tolerance"] == "ABSOLUTE_TOPOLOGICAL_INVARIANCE"

def test_topological_braid_sequence():
    engine = TopologicalBraidEngine()
    braid_word = [1, 2, -1, 2]
    res = engine.evaluate_braid_sequence(strands=4, braid_word=braid_word)
    assert res["total_crossings"] == 4
    assert len(res["steps"]) == 4
    assert len(res["final_permutation"]) == 4
    assert "TOPO-INV" in res["topological_invariant"]

def test_ast_protocol_mutation_and_fitness():
    mutator = ASTProtocolMutator(seed_code="output = input_byte ^ 0x5A")
    # Test on known XOR encrypted ciphertext of "CIPHERON"
    plaintext = b"CIPHERON"
    ciphertext = bytes([b ^ 0x5A for b in plaintext])
    hex_str = ciphertext.hex()

    evolve_res = mutator.evolve_candidate_solvers(
        ciphertext_hex=hex_str,
        generations=4,
        population_size=6,
        target_hint="CIPHERON"
    )
    assert evolve_res["generations_completed"] == 4
    assert len(evolve_res["generation_history"]) == 4
    assert evolve_res["best_fitness_score"] >= 0.5
    assert evolve_res["compilation_target"] == "READY_FOR_EFPGA_AND_P_TPU_ACCELERATION"

def test_api_v8_endpoints():
    # 1. FSO link budget
    resp1 = client.post("/api/v1/orbital/link-budget", json={
        "distance_km": 1000.0,
        "tx_power_dbm": 30.0,
        "tx_gain_dbi": 105.0,
        "rx_gain_dbi": 105.0,
        "rx_sensitivity_dbm": -38.0,
        "atmospheric_loss_db": 3.0
    })
    assert resp1.status_code == 200
    assert resp1.json()["is_link_closed"] is True

    # 2. Orbital constellation
    resp2 = client.get("/api/v1/orbital/constellation")
    assert resp2.status_code == 200
    assert resp2.json()["active_satellites"] == 8

    # 3. Photonic MZI transform
    resp3 = client.post("/api/v1/photonic/mzi-transform", json={
        "theta_rad": 1.5708,
        "phi_rad": 0.7854,
        "x1": 1.0,
        "x2": 0.0
    })
    assert resp3.status_code == 200
    assert resp3.json()["energy_dissipation_pj"] < 0.1

    # 4. Photonic tensor mesh
    resp4 = client.post("/api/v1/photonic/mesh-simulate", json={
        "dim": 4,
        "input_vector": [1.0, 0.5, 0.0, -0.5]
    })
    assert resp4.status_code == 200
    assert len(resp4.json()["output_vector"]) == 4

    # 5. Topological braid verify
    resp5 = client.post("/api/v1/topological/braid-verify", json={
        "generator_i": 1,
        "strands": 4
    })
    assert resp5.status_code == 200
    assert resp5.json()["relation_holds"] is True

    # 6. Topological braid sequence
    resp6 = client.post("/api/v1/topological/braid-sequence", json={
        "strands": 4,
        "braid_word": [1, 2, 1]
    })
    assert resp6.status_code == 200
    assert resp6.json()["total_crossings"] == 3

    # 7. AST mutator
    resp7 = client.post("/api/v1/mutator/evolve-ast", json={
        "ciphertext_hex": "0e0a1616196a0b1c",
        "seed_code": "output = input_byte ^ 0x5A",
        "generations": 3,
        "population_size": 4
    })
    assert resp7.status_code == 200
    assert resp7.json()["generations_completed"] == 3
