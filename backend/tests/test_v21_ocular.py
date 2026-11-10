"""
CIPHERON-X1 V21.0.0 Ocular & Eye-Gaze Biometrics Test Suite
Directly adhering to suggestion-v20.md Sections 1.1, 2.1, 3.1, 4.1 & 5.2
"""

import pytest
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.biometrics.eye_gaze_steganography import (
    OcularEntropyEngine,
    EOGSignalDecoder,
    GazeMarkovSteganography,
    OcularKeyDerivator,
    GazeDirection
)

client = TestClient(app)


def test_eog_classification_and_encoding():
    decoder = EOGSignalDecoder(threshold=800)

    # Test Direction Classification
    assert decoder.classify_sample(2048, 2048) == GazeDirection.CENTER
    assert decoder.classify_sample(3000, 2048) == GazeDirection.RIGHT
    assert decoder.classify_sample(1000, 2048) == GazeDirection.LEFT
    assert decoder.classify_sample(2048, 3000) == GazeDirection.UP
    assert decoder.classify_sample(2048, 1000) == GazeDirection.DOWN

    # Test Binary Encoding: LEFT(00), RIGHT(01), UP(10), DOWN(11) -> 0b00011011 = 0x1B
    dirs = [GazeDirection.LEFT, GazeDirection.RIGHT, GazeDirection.UP, GazeDirection.DOWN]
    encoded = decoder.encode_saccades_to_bytes(dirs)
    assert encoded == b"\x1b"

    # Test Decoding Back
    decoded = decoder.decode_bytes_to_saccades(encoded)
    assert decoded[:4] == dirs


def test_pupil_entropy_extraction():
    engine = OcularEntropyEngine(sampling_rate_hz=120)
    # 240 samples of pupil diameter fluctuating around 3.5mm
    np.random.seed(42)
    pupil_data = list(np.random.normal(loc=3.5, scale=0.25, size=240))

    entropy = engine.extract_pupil_entropy(pupil_data)
    assert entropy > 0.0

    seed = engine.derive_cryptographic_seed(pupil_data)
    assert len(seed) == 32
    assert isinstance(seed, bytes)


def test_gaze_markov_steganography():
    stego = GazeMarkovSteganography(aoi_count=4)

    # Verify natural transition entropy
    entropy = stego.compute_transition_entropy()
    assert entropy > 1.0  # Typically ~1.8 to 2.0 bits

    # Embed and extract secret payload
    secret = b"EYE"
    path = stego.encode_message_to_aoi_path(secret, initial_aoi=0)
    assert len(path) > 1

    extracted = stego.decode_aoi_path_to_message(path)
    assert extracted == secret


def test_ocular_key_derivation_hkdf():
    derivator = OcularKeyDerivator()
    eog_stream = b"\x1b\x4a\x8c"
    pupil_delta = 0.285

    result = derivator.derive_key(eog_stream, pupil_delta)
    assert result["key_valid"] is True
    assert len(result["master_key_hex"]) == 64  # 32 bytes = 64 hex chars
    assert len(result["zk_commitment"]) == 64
    assert result["derivation_algorithm"] == "HKDF-SHA256"


def test_ocular_zeroization_fail_closed():
    decoder = EOGSignalDecoder()
    entropy_engine = OcularEntropyEngine(120)
    derivator = OcularKeyDerivator()

    # Trigger zeroization
    zero_res = derivator.emergency_zeroize()
    assert zero_res["status"] == "ZEROIZED"
    assert zero_res["latency_us"] < 5.0

    decoder.zeroized = True
    entropy_engine.zeroized = True

    # Verify fail-closed behavior
    key_res = derivator.derive_key(b"\x1b", 0.2)
    assert key_res["key_valid"] is False
    assert decoder.encode_saccades_to_bytes([GazeDirection.LEFT]) == b""
    assert entropy_engine.extract_pupil_entropy([3.5, 3.6]) == 0.0


def test_v21_api_endpoints():
    # 1. EOG Sample Classification
    resp = client.post("/api/v1/ocular/eog-sample", json={"raw_h": 3100, "raw_v": 2048, "threshold": 800})
    assert resp.status_code == 200
    data = resp.json()
    assert data["direction"] == "RIGHT"
    assert data["status"] == "EOG_SAMPLE_CLASSIFIED"

    # 2. EOG Encode
    resp = client.post("/api/v1/ocular/eog-encode", json={"saccades": ["LEFT", "RIGHT", "UP", "DOWN"]})
    assert resp.status_code == 200
    data = resp.json()
    assert data["encoded_hex"] == "1b"

    # 3. EOG Decode
    resp = client.post("/api/v1/ocular/eog-decode", json={"stream_hex": "1b"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["saccades"] == ["LEFT", "RIGHT", "UP", "DOWN"]

    # 4. Pupil Entropy
    resp = client.post("/api/v1/ocular/pupil-entropy", json={
        "pupil_diameters_mm": [3.5, 3.6, 3.4, 3.7, 3.5, 3.3, 3.8, 3.5]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "phasic_entropy_bits_per_sample" in data
    assert "cryptographic_seed_hex" in data

    # 5. Gaze Steganography Encode
    resp = client.post("/api/v1/ocular/gaze-stego/encode", json={
        "message_text": "EYE",
        "aoi_count": 4,
        "initial_aoi": 0
    })
    assert resp.status_code == 200
    data = resp.json()
    aoi_path = data["aoi_path"]

    # 6. Gaze Steganography Decode
    resp = client.post("/api/v1/ocular/gaze-stego/decode", json={"aoi_path": aoi_path})
    assert resp.status_code == 200
    assert resp.json()["decoded_text"] == "EYE"

    # 7. Ocular Key Derivation
    resp = client.post("/api/v1/ocular/key-derivation", json={
        "eog_stream_hex": "1b",
        "pupil_delta_r": 0.25
    })
    assert resp.status_code == 200
    assert resp.json()["key_valid"] is True

    # 8. Telemetry
    resp = client.get("/api/v1/ocular/telemetry")
    assert resp.status_code == 200
    assert "eog_status" in resp.json()
    assert "entropy_engine" in resp.json()
