"""
CIPHERON-X1 V12.0.0-NEXUS OMNI-SYNTHESIS ARCHITECTURE PyTest Test Suite
Validates Quantum Field Entanglement & Teleportation, Bio-Inorganic Synaptic Interfaces,
Galactic Cosmic Ray Micro-Harvesting, and Sub-Atomic Particle Transmutation Zeroization (suggestion-v11.md).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.network.quantum_field import quantum_field_manager
from app.ai.bio_synaptic_solver import bio_synaptic_solver
from app.power.cosmic_harvesting import cosmic_harvesting_manager


@pytest.fixture(autouse=True)
def reset_singletons():
    quantum_field_manager.reset()
    bio_synaptic_solver.reset()
    cosmic_harvesting_manager.reset()
    yield
    quantum_field_manager.reset()
    bio_synaptic_solver.reset()
    cosmic_harvesting_manager.reset()


def test_quantum_field_epr_squeezing_and_fidelity():
    telem = quantum_field_manager.get_telemetry()
    assert telem["entanglement_locked"] is True
    assert telem["squeezing_parameter_db"] >= 2.5  # 2.85 dB
    assert telem["teleportation_fidelity"] > 0.994  # 0.996


def test_quantum_state_teleportation():
    payload = b"CIPHERON_QUANTUM_TELEPORT_SAMPLE_FRAME"
    res = quantum_field_manager.teleport_state(payload)

    assert res["status"] == "QUANTUM_STATE_TELEPORTED"
    assert res["fidelity_compliant"] is True
    assert res["em_propagation_delay_ns"] == 0.0
    assert res["teleport_latency_ns"] < 10.0


def test_bio_inorganic_synaptic_membrane_dynamics():
    # Test sub-threshold current integration
    step1 = bio_synaptic_solver.inject_ion_current(100.0)
    assert step1["membrane_potential_mv"] == -65.0  # -70.0 + 100 * 0.05
    assert step1["spike_fired"] is False

    # Test spike threshold crossing (+30.0 mV)
    step2 = bio_synaptic_solver.inject_ion_current(2000.0)
    assert step2["spike_fired"] is True
    assert step2["membrane_potential_mv"] == -70.0  # Repolarized reset
    assert step2["memristor_conductance_ms"] > 1.25 # LTP potentiation


def test_bio_payload_decoding():
    waveform = [10.0, 50.0, 100.0, 500.0, 1500.0, 2000.0]
    decode_res = bio_synaptic_solver.decode_bio_payload(waveform)
    assert decode_res["waveform_samples_processed"] == 6
    assert decode_res["action_potential_spikes_in_batch"] >= 1


def test_cosmic_ray_gcr_ionization_harvesting():
    telem = cosmic_harvesting_manager.get_telemetry()
    assert telem["status"] == "COSMIC_HARVESTING_ACTIVE"
    assert telem["cosmic_ray_power_uw"] >= 25.0
    assert telem["deep_space_infinite_power"] is True

    # Test flux simulation
    sim_res = cosmic_harvesting_manager.simulate_flux(gcr_flux=10.0, plasma_density=2.0)
    assert sim_res["gcr_flux_particles_cm2_s"] == 10.0
    assert sim_res["total_cosmic_power_uw"] > 50.0


def test_subatomic_transmutation_zeroization():
    zero_res = cosmic_harvesting_manager.trigger_subatomic_transmutation()
    assert zero_res["status"] == "SUBATOMIC_TRANSMUTATION_COMPLETE"
    assert zero_res["zeroization_latency_ns"] < 10.0  # 6.2ns < 10ns SLA
    assert zero_res["within_10ns_sla"] is True
    assert zero_res["conductive_traces_remaining"] == 0

    # Fail-closed check
    quantum_field_manager.trigger_transmutation()
    bio_synaptic_solver.trigger_transmutation()

    with pytest.raises(RuntimeError):
        quantum_field_manager.teleport_state(b"FAIL_TEST")

    bio_res = bio_synaptic_solver.inject_ion_current(100.0)
    assert bio_res["status"] == "TRANSMUTED_INERT"


def test_api_v12_routes():
    client = TestClient(app)

    # Quantum Teleport API
    resp_teleport = client.post("/api/v1/qfield/teleport", json={"payload_text": "TEST_QUANTUM_DATA"})
    assert resp_teleport.status_code == 200
    assert resp_teleport.json()["fidelity_compliant"] is True

    # QField Telemetry API
    resp_qtelem = client.get("/api/v1/qfield/telemetry")
    assert resp_qtelem.status_code == 200
    assert resp_qtelem.json()["entanglement_locked"] is True

    # Bio-Synaptic Inject Current API
    resp_bio = client.post("/api/v1/bio-synaptic/inject-current", json={"ion_current_pA": 100.0})
    assert resp_bio.status_code == 200
    assert resp_bio.json()["membrane_potential_mv"] == -65.0

    # Cosmic Harvest Telemetry API
    resp_cosmic = client.get("/api/v1/power/cosmic-harvest/telemetry")
    assert resp_cosmic.status_code == 200
    assert resp_cosmic.json()["deep_space_infinite_power"] is True

    # Subatomic Transmute API
    resp_trans = client.post("/api/v1/security/subatomic-transmute")
    assert resp_trans.status_code == 200
    assert resp_trans.json()["within_10ns_sla"] is True
