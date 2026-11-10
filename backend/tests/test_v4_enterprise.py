"""
CIPHERON-X1 V4.0-ENTERPRISE Comprehensive Test Suite
Validates Post-Quantum Cryptography, ESP-MESH-LITE Swarm, Neural Classifier, and SBOM
(suggestion-v3.md)
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.crypto.pqc import pqc_engine
from app.swarm.mesh_swarm import swarm_coordinator
from app.ai.neural_classifier import neural_classifier
from app.security.sbom import sbom_generator


@pytest.fixture
def client():
    return TestClient(app)


def test_pqc_hybrid_handshake():
    """Verify FIPS 203 ML-KEM-768 + NIST P-256 ECDH Hybrid Handshake."""
    res = pqc_engine.perform_hybrid_handshake()
    assert res["status"] == "HANDSHAKE_ESTABLISHED"
    assert "ML-KEM-768" in res["pqc_standard"]
    assert res["symmetric_cipher"] == "AES-256-GCM"
    assert res["data_stream_verified"] is True
    assert res["quantum_resistance_bits"] == 192


def test_pqc_ml_dsa_3_signatures():
    """Verify FIPS 204 ML-DSA-3 (Dilithium3) digital signatures."""
    msg = b"CIPHERON-X1-MERKLE-DAG-AUDIT-ROOT-RECORD-SEALED"
    sig = pqc_engine.sign_with_ml_dsa_3(msg)
    assert sig["algorithm"] == "FIPS 204 ML-DSA-3 (Dilithium3)"
    assert sig["signature_length"] == 3293
    assert len(sig["public_key_hex"]) > 0

    valid = pqc_engine.verify_ml_dsa_3(msg, sig["signature_hex"], sig["public_key_hex"])
    assert valid is True


def test_swarm_cluster_mapreduce():
    """Verify ESP-MESH-LITE Swarm coordinator partitioning and search dispatch."""
    status = swarm_coordinator.get_cluster_status()
    assert status["total_nodes"] >= 4
    assert status["active_nodes_count"] >= 4

    # Dispatch job
    dispatch_res = swarm_coordinator.partition_and_dispatch(
        ciphertext_hex="4B3A88192C3D",
        total_keys=65536,
        target_cipher="MULTI_BYTE_XOR"
    )
    assert dispatch_res["status"] == "DISPATCHED"
    assert dispatch_res["active_workers"] >= 4
    assert dispatch_res["keys_per_node"] > 0

    updated = swarm_coordinator.get_cluster_status()
    assert len(updated["top_candidates"]) > 0
    assert updated["top_candidates"][0]["score"] > 80.0


def test_swarm_node_failover_recovery():
    """Verify <150ms worker failure detection and keyspace reallocation."""
    failover = swarm_coordinator.simulate_node_failure_and_reallocate(failed_node_id=2)
    assert failover["status"] == "FAILOVER_RECOVERED"
    assert failover["failed_node_id"] == 2
    assert failover["failover_latency_ms"] < 150.0  # Must be < 150 ms benchmark


def test_neural_cipher_classifier():
    """Verify 1D-CNN (ESP-DL vector engine) 12-class cipher identification."""
    # Test Hex
    hex_res = neural_classifier.classify("48656c6c6f31323334")
    assert hex_res["predicted_class"] == "Hex"
    assert hex_res["confidence"] > 0.4
    assert hex_res["inference_latency_ms"] <= 4.2

    # Test JWT
    jwt_res = neural_classifier.classify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTmc6Y5uvRtErqTw")
    assert jwt_res["predicted_class"] == "JWT"
    assert jwt_res["confidence"] > 0.5

    # Test Base64
    b64_res = neural_classifier.classify("SGVsbG8gV29ybGQgQ0lQSEVST04tWDE=")
    assert b64_res["predicted_class"] == "Base64"

    # Test Code
    code_res = neural_classifier.classify("function solveKey(input) { const x = 42; return x * 2; }")
    assert code_res["predicted_class"] == "Code"


def test_sbom_generation():
    """Verify SPDX 2.3 and CycloneDX 1.5 SBOM generators."""
    spdx = sbom_generator.generate_spdx_sbom()
    assert spdx["spdxVersion"] == "SPDX-2.3"
    assert len(spdx["packages"]) >= 8

    cdx = sbom_generator.generate_cyclonedx_sbom()
    assert cdx["bomFormat"] == "CycloneDX"
    assert cdx["specVersion"] == "1.5"
    assert len(cdx["components"]) >= 8


def test_api_v4_routes(client):
    """Verify FastAPI V4 and companion endpoints."""
    # Root check
    root = client.get("/").json()
    assert "ML-KEM-768" in root["pqc_engine"]

    # V4 Analyze endpoint
    v4_an = client.post("/api/v4/analyze", json={
        "raw_payload": "4349504845524f4e",
        "max_depth": 5,
        "enable_pqc_signature": True
    })
    assert v4_an.status_code == 200
    assert v4_an.json()["status"] == "QUEUED"

    # PQC Handshake endpoint
    hs = client.post("/api/v1/pqc/handshake")
    assert hs.status_code == 200
    assert hs.json()["status"] == "HANDSHAKE_ESTABLISHED"

    # Swarm Nodes endpoint
    sw = client.get("/api/v1/swarm/nodes")
    assert sw.status_code == 200
    assert sw.json()["active_nodes_count"] >= 3

    # Neural Classify endpoint
    nc = client.post("/api/v1/neural/classify", json={"content": "48656c6c6f31323334"})
    assert nc.status_code == 200
    assert nc.json()["predicted_class"] == "Hex"

    # SBOM endpoints
    spdx = client.get("/api/v1/sbom/spdx")
    assert spdx.status_code == 200
    assert spdx.json()["spdxVersion"] == "SPDX-2.3"

    cdx = client.get("/api/v1/sbom/cyclonedx")
    assert cdx.status_code == 200
    assert cdx.json()["bomFormat"] == "CycloneDX"
