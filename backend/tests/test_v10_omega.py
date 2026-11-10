"""
CIPHERON-X1 V10.0.0-OMEGA ARCHITECTURE PyTest Test Suite
Validates 10,000-D Hyperdimensional Computing, Recursive zk-STARKs on Goldilocks Field,
and 3D Heterogeneous Chiplet TSV Interconnects (suggestion-v9.md).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.hardware.hdc_engine import hdc_engine, Hypervector
from app.crypto.recursive_stark import GoldilocksField, recursive_stark_prover, recursive_stark_verifier
from app.hardware.chiplet_stack import chiplet_stack_manager


@pytest.fixture(autouse=True)
def reset_singletons():
    hdc_engine.reset()
    chiplet_stack_manager.reset()
    yield
    hdc_engine.reset()
    chiplet_stack_manager.reset()


def test_hdc_hypervector_prng_and_orthogonality():
    v1 = Hypervector.from_seed(0x12345678)
    v2 = Hypervector.from_seed(0x87654321)

    # Identical vector self-similarity must be exactly 1.00
    assert hdc_engine.cosine_similarity(v1, v1) == 1.0
    # Pseudo-random orthogonal vectors must hover around 0.50 (45% - 55%)
    orth_sim = hdc_engine.cosine_similarity(v1, v2)
    assert 0.45 <= orth_sim <= 0.55


def test_hdc_binding_and_unbinding():
    va = Hypervector.from_seed(0xAAAA1111)
    vb = Hypervector.from_seed(0xBBBB2222)

    # Binding C = A ^ B
    vc = hdc_engine.bind(va, vb)
    assert 0.45 <= hdc_engine.cosine_similarity(vc, va) <= 0.55
    assert 0.45 <= hdc_engine.cosine_similarity(vc, vb) <= 0.55

    # Unbinding: C ^ B retrieves A
    v_retrieved = hdc_engine.bind(vc, vb)
    assert hdc_engine.cosine_similarity(v_retrieved, va) == 1.0


def test_hdc_bundling_majority():
    va = Hypervector.from_seed(0x1111)
    vb = Hypervector.from_seed(0x2222)
    vc = Hypervector.from_seed(0x3333)

    bundled = hdc_engine.bundle_3(va, vb, vc)
    # Bundled vector must have strong positive correlation to each constituent
    assert hdc_engine.cosine_similarity(bundled, va) > 0.55
    assert hdc_engine.cosine_similarity(bundled, vb) > 0.55
    assert hdc_engine.cosine_similarity(bundled, vc) > 0.55


def test_hdc_cyclic_permutation():
    v = Hypervector.from_seed(0x9999)
    permuted = hdc_engine.permute(v, shift=7)
    sim = hdc_engine.cosine_similarity(permuted, v)
    assert 0.45 <= sim <= 0.55


def test_hdc_bytestream_encoding_and_classification():
    profiles = {
        "CIPHER_TYPE_X": Hypervector.from_seed(0x1111),
        "CIPHER_TYPE_Y": Hypervector.from_seed(0x2222),
    }
    result = hdc_engine.classify_stream(b"SAMPLE_TEST_PAYLOAD", profiles)
    assert "predicted_class" in result
    assert result["query_latency_ns"] < 10.0
    assert len(result["stream_vector_preview"]) == 64


def test_goldilocks_field_arithmetic():
    order = GoldilocksField.ORDER
    assert order == 18446744069414584321  # 2^64 - 2^32 + 1

    a = 12345678901234
    b = 98765432109876
    sum_ab = GoldilocksField.add(a, b)
    assert sum_ab == (a + b) % order

    mul_ab = GoldilocksField.mul(a, b)
    assert mul_ab == (a * b) % order

    inv_a = GoldilocksField.inv(a)
    assert GoldilocksField.mul(a, inv_a) == 1


def test_recursive_stark_proof_compression_and_verification():
    p1 = recursive_stark_prover.generate_base_proof(1, "0xabc1")
    p2 = recursive_stark_prover.generate_base_proof(2, "0xabc2")

    rec_proof = recursive_stark_prover.generate_recursive_proof(p1, p2)
    # Proof size must satisfy constant <= 12.4 KB requirement
    assert len(rec_proof) <= 12697

    is_valid, verify_ms, meta = recursive_stark_verifier.verify_recursive_proof(rec_proof)
    assert is_valid is True
    # Verification time must meet < 1.8 ms requirement
    assert verify_ms < 1.8
    assert meta["within_1_8ms_sla"] is True


def test_chiplet_stack_thermal_and_bandwidth():
    telem = chiplet_stack_manager.get_stack_telemetry()
    assert telem["interconnect_bandwidth_tbps_mm2"] == 3.2
    assert telem["micro_bump_pitch_um"] == 10.0
    assert telem["total_micro_bumps"] == 100000
    assert len(telem["layers"]) == 4

    thermal_sim = chiplet_stack_manager.simulate_thermal_distribution(workload_pct=90.0)
    assert len(thermal_sim) == 4
    for layer in thermal_sim:
        assert layer["operating_temp_c"] > 35.0


def test_atomic_zeroization_fail_closed():
    res = hdc_engine.trigger_atomic_zeroization()
    assert res["zeroization_latency_ns"] < 100.0  # 68.5ns < 100ns SLA
    assert res["within_sla"] is True

    # Fail closed: similarity returns 0.0, binding returns zero vector
    v1 = Hypervector.from_seed(0x1)
    v2 = Hypervector.from_seed(0x2)
    assert hdc_engine.cosine_similarity(v1, v2) == 0.0
    bound = hdc_engine.bind(v1, v2)
    assert all(w == 0 for w in bound.words)


def test_api_v10_routes():
    client = TestClient(app)

    # HDC Bind API
    resp_bind = client.post("/api/v1/hdc/bind", json={"seed_a": 100, "seed_b": 200})
    assert resp_bind.status_code == 200
    data = resp_bind.json()
    assert data["operation"] == "HDC_XOR_BINDING"
    assert data["orthogonal_property_verified"] is True

    # HDC Telemetry API
    resp_telem = client.get("/api/v1/hdc/telemetry")
    assert resp_telem.status_code == 200
    assert resp_telem.json()["dimension"] == 10000

    # Recursive STARK Fold API
    resp_fold = client.post("/api/v1/crypto/recursive-stark/fold", json={"step_id": 1, "state_root": "0x123"})
    assert resp_fold.status_code == 200
    assert resp_fold.json()["within_12_4kb_limit"] is True
    assert resp_fold.json()["within_1_8ms_sla"] is True

    # Chiplet Telemetry API
    resp_chiplet = client.get("/api/v1/chiplet/telemetry")
    assert resp_chiplet.status_code == 200
    assert resp_chiplet.json()["interconnect_bandwidth_tbps_mm2"] == 3.2

