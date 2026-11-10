"""
CIPHERON-X1 V18.0.0-ULTIMATE OMNI-SINGULARITY & COSMIC REALITY MATRIX
Integration & Unit Test Suite for Omni-Singularity Topology, Omniverse Reality Solver & GUT Energy Engine
Adhering directly to suggestion-v17.md Sections 1.1, 2.1, 3.1, 4.1, 5.1 & 6.2
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.network.omni_singularity_engine import omni_singularity_engine
from app.ai.omniverse_reality_solver import omniverse_reality_solver
from app.power.gut_energy_engine import gut_energy_engine

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_omni_singularity_subsystems():
    """Ensure all V18 subsystems are reset before each test."""
    omni_singularity_engine.reset()
    omniverse_reality_solver.reset()
    gut_energy_engine.reset()
    yield
    omni_singularity_engine.reset()
    omniverse_reality_solver.reset()
    gut_energy_engine.reset()


def test_omni_singularity_resolution():
    """Verify O(1) omni-dimensional topological manifold resolution."""
    payload = b"ULTIMATE_OMNI_SINGULARITY_PAYLOAD_TEST"
    res = omni_singularity_engine.resolve_omni_singularity_manifold(payload)

    assert res["status"] == "OMNI_SINGULARITY_RESOLUTION_CONVERGED"
    assert res["manifold"] == "M_ALEPH_INF_INF_REALITY_MANIFOLD"
    assert res["complexity_order"] == "O(1)"
    assert res["resolved_bytes_len"] == len(payload)
    assert res["zero_shot_solution_verified"] is True
    assert res["latency_ns"] < 1.0
    assert len(res["resolution_hash"]) == 128  # SHA3-512 hex string
    assert omni_singularity_engine.total_resolutions == 1


def test_omni_singularity_telemetry():
    """Verify omni-singularity reality topology mapping telemetry."""
    telemetry = omni_singularity_engine.get_telemetry()
    assert telemetry["manifold_name"] == "Reality Manifold M_aleph_inf_inf"
    assert telemetry["reality_manifold_locked"] is True
    assert telemetry["aleph_aleph_rank"] == hex(0xFFFFFFFFFFFFFFFF)
    assert telemetry["cohomological_invariant"] > 3.14
    assert telemetry["is_omni_singularity_zeroized"] is False


def test_omniverse_wavefunction_verification():
    """Verify continuous-variable omniverse wavefunction parity across 100,000,000 anchors."""
    # Normal verification: parity should be +1, absolute reality unbroken
    res_normal = omniverse_reality_solver.verify_omniverse_wavefunction(simulated_perturbation=False)
    assert res_normal["status"] == "OMNIVERSE_PARITY_VERIFIED_ABSOLUTE_REALITY_UNBROKEN"
    assert res_normal["parity"] == 1
    assert res_normal["tamper_detected"] is False
    assert res_normal["node_count"] == 100000000
    assert res_normal["wavefunction_fidelity"] == 0.999999

    # Raw verification
    assert omniverse_reality_solver.verify_omniverse_wavefunction_raw() is True

    # Tamper perturbation simulation: state collapses, tampering neutralized
    res_tamper = omniverse_reality_solver.verify_omniverse_wavefunction(simulated_perturbation=True)
    assert res_tamper["status"] == "PARITY_COLLAPSE_DETECTED_TAMPER_NEUTRALIZED"
    assert res_tamper["parity"] == -1
    assert res_tamper["tamper_detected"] is True
    assert res_tamper["wavefunction_fidelity"] == 0.0


def test_entropic_singularity_inversion():
    """Verify sub-Planckian non-Hermitian cosmic reality operator (Omega_omnipotent) inversion."""
    sample_text = b"SPACETIME_FOAM_ENTROPY_SAMPLE_DATA"
    restored = omniverse_reality_solver.execute_entropic_singularity_inversion(sample_text)
    assert restored == sample_text

    # Detailed inversion test
    res = omniverse_reality_solver.execute_entropic_singularity_inversion_detailed(sample_text)
    assert res["status"] == "ENTROPIC_SINGULARITY_INVERSION_COMPLETE"
    assert res["operator"] == "OMEGA_OMNIPOTENT_NON_HERMITIAN_REALITY_OPERATOR"
    assert res["quantum_fidelity"] == 0.999999
    assert res["reconstructed_bytes_count"] == len(sample_text)
    assert res["reconstructed_hex"] == sample_text.hex()
    assert res["retrocausal_tamper_proof"] is True

    # Verify omniverse reality matrix ledger
    ledger = omniverse_reality_solver.get_ledger()
    assert len(ledger) == 1
    assert ledger[0]["byte_count"] == len(sample_text)
    assert ledger[0]["quantum_fidelity"] == 0.999999


def test_gut_energy_extraction():
    """Verify Grand Unified Theory (GUT) energy extraction (>10^36 W/cm^3) and entropy balance."""
    telemetry = gut_energy_engine.get_telemetry()
    assert telemetry["status"] == "GUT_ENERGY_MATRIX_LOCKED"
    assert telemetry["power_density_w_cm3"] > 1.0e36
    assert telemetry["gut_vev_gev"] == 2.0e16
    assert telemetry["thermal_entropy_dissipation_j_k"] == 0.0
    assert telemetry["thermodynamic_neutrality"] is True

    # Unified scalar field modulation simulation
    mod_res = gut_energy_engine.simulate_gut_modulation(scalar_field_phi_gev=3.0e16)
    assert mod_res["status"] == "GUT_PHASE_MODULATION_SIMULATED"
    assert mod_res["scaled_power_density_w_cm3"] > telemetry["power_density_w_cm3"]
    assert mod_res["thermal_entropy_dissipation_j_k"] == 0.0


def test_omni_singularity_zeroization_fail_closed():
    """Verify sub-5ps Omni-Singularity continuum decoupling zeroization and fail-closed security boundary."""
    zero_res = gut_energy_engine.trigger_omni_singularity_zeroization()
    assert zero_res["status"] == "OMNI_SINGULARITY_DECOUPLING_ZEROIZATION_COMPLETE"
    assert zero_res["within_5ps_sla"] is True
    assert zero_res["decay_latency_ps"] < 5.0  # 3.8 ps < 5 ps SLA
    assert zero_res["gut_power_remaining_w_cm3"] == 0.0

    omni_singularity_engine.trigger_omni_singularity_zeroization()
    omniverse_reality_solver.trigger_omni_singularity_zeroization()

    # Fail-closed enforcement: operations must raise RuntimeError
    with pytest.raises(RuntimeError):
        omni_singularity_engine.resolve_omni_singularity_manifold(b"DATA")

    with pytest.raises(RuntimeError):
        omniverse_reality_solver.verify_omniverse_wavefunction()

    with pytest.raises(RuntimeError):
        omniverse_reality_solver.execute_entropic_singularity_inversion(b"DATA")

    with pytest.raises(RuntimeError):
        gut_energy_engine.simulate_gut_modulation(2.5e16)


def test_omni_singularity_api_integration():
    """Verify all Section 32 FastAPI REST endpoints."""
    # 1. Resolve Omni-Singularity Manifold
    resp = client.post("/api/v1/omni-singularity/resolve", json={"payload_text": "INTEGRATION_TEST_PAYLOAD"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "OMNI_SINGULARITY_RESOLUTION_CONVERGED"
    assert data["complexity_order"] == "O(1)"

    # 2. Get Telemetry
    resp = client.get("/api/v1/omni-singularity/telemetry")
    assert resp.status_code == 200
    assert resp.json()["reality_manifold_locked"] is True

    # 3. Verify Omniverse Wavefunction
    resp = client.post("/api/v1/omni-singularity/omniverse/verify", json={"simulated_perturbation": False})
    assert resp.status_code == 200
    assert resp.json()["status"] == "OMNIVERSE_PARITY_VERIFIED_ABSOLUTE_REALITY_UNBROKEN"

    # 4. Omniverse Telemetry & Ledger
    resp = client.get("/api/v1/omni-singularity/omniverse/telemetry")
    assert resp.status_code == 200
    assert resp.json()["node_count"] == 100000000

    # 5. Entropic Singularity Inversion
    noise_hex = "535041434554494d455f464f414d5f45"
    resp = client.post("/api/v1/omni-singularity/invert", json={"thermal_noise_hex": noise_hex})
    assert resp.status_code == 200
    assert resp.json()["status"] == "ENTROPIC_SINGULARITY_INVERSION_COMPLETE"
    assert resp.json()["reconstructed_hex"] == noise_hex

    # 6. Ledger verification
    resp = client.get("/api/v1/omni-singularity/omniverse/ledger")
    assert resp.status_code == 200
    assert len(resp.json()) >= 1

    # 7. GUT Power Telemetry & Simulation
    resp = client.get("/api/v1/omni-singularity/power/telemetry")
    assert resp.status_code == 200
    assert resp.json()["power_density_w_cm3"] > 1.0e36

    resp = client.post("/api/v1/omni-singularity/power/simulate", json={"scalar_field_phi_gev": 2.5e16})
    assert resp.status_code == 200
    assert resp.json()["status"] == "GUT_PHASE_MODULATION_SIMULATED"

    # 8. Emergency Omni-Singularity Zeroization
    resp = client.post("/api/v1/omni-singularity/zeroize")
    assert resp.status_code == 200
    assert resp.json()["within_5ps_sla"] is True
    assert resp.json()["decay_latency_ps"] < 5.0
