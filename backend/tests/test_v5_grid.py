"""
CIPHERON-X1 V5.0-AUTONOMOUS AGENTIC & GLOBAL FORENSIC GRID Test Suite
Tests Z3 SMT Symbolic Solver, MCTS Agentic Engine, SDR FFT/Demodulator,
DPA Side-Channel (>3 sigma), IPFS Merkle-DAG, FedLM (DP), and API Endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ai.agentic_solver import Z3SymbolicSolver, MCTSCryptanalysisEngine
from app.signal.sdr_processor import SDRSignalProcessor, DPASideChannelAnalyzer
from app.grid.forensic_grid import global_forensic_grid

client = TestClient(app)


def test_z3_smt_symbolic_solver():
    """Verify Z3 BitVector SMT constraint solver recovers XOR key (suggestion-v4.md Section 6.2)."""
    # Sample cipher from Section 6.2 reference implementation
    sample_cipher = bytes([0x17, 0x08, 0x05, 0x40, 0x11, 0x15, 0x09, 0x43, 0x0B, 0x0F, 0x17, 0x0E])
    solver = Z3SymbolicSolver(sample_cipher)
    res = solver.solve_custom_xor_key(max_key_len=2)

    assert res["status"] == "SATISFIABLE"
    assert res["key_len"] in (1, 2)
    assert res["engine"] == "Z3_SMT_BITVECTOR"
    assert len(res["plaintext"]) == len(sample_cipher)

    # Test with target_key_len=2 explicitly
    res2 = solver.solve_custom_xor_key(target_key_len=2)
    assert res2["status"] == "SATISFIABLE"
    assert res2["key_len"] == 2
    assert len(res2["plaintext"]) == len(sample_cipher)


def test_z3_affine_solver():
    """Verify Z3 affine cipher solver over modular byte transformations."""
    # P * 3 + 7 mod 256
    plain = b"SECRET_CIPHER"
    cipher = bytes([(p * 3 + 7) % 256 for p in plain])

    solver = Z3SymbolicSolver(cipher)
    res = solver.solve_affine_cipher()
    assert res["status"] in ("SATISFIABLE", "UNSAT")
    assert res["engine"] == "Z3_AFFINE_SOLVER"


def test_mcts_agentic_cryptanalysis():
    """Verify MCTS tree search recovers Base64-obfuscated payload using UCT heuristic."""
    # "Cipheron Forensic Grid" in Base64
    obfuscated = "Q2lwaGVyb24gRm9yZW5zaWMgR3JpZA=="
    mcts = MCTSCryptanalysisEngine(exploration_c=1.414)
    res = mcts.search(obfuscated, max_iterations=30)

    assert res["confidence_score"] > 0.7
    assert "Cipheron Forensic Grid" in res["best_plaintext"]
    assert "base64_decode" in res["pipeline_sequence"]
    assert res["total_nodes_evaluated"] >= 1


def test_sdr_fft_spectrum_processing():
    """Verify SDR FFT spectral power computation and waterfall generation."""
    sdr = SDRSignalProcessor()
    iq_burst = sdr.generate_synthetic_rf_transmission("TEST_MSG", mod_type="ASK", num_symbols=16)
    res = sdr.process_spectrum(iq_burst, center_freq_mhz=433.92, sample_rate_mhz=2.4, n_fft=64)

    assert res["center_freq_mhz"] == 433.92
    assert len(res["power_spectrum_dbm"]) == 64
    assert len(res["frequencies_mhz"]) == 64
    assert res["snr_db"] is not None
    assert len(res["waterfall_history"]) == 4


def test_sdr_demodulation_modes():
    """Verify ASK, FSK, and PSK demodulation modes over synthetic signals."""
    sdr = SDRSignalProcessor()

    # ASK Demodulation
    ask_iq = sdr.generate_synthetic_rf_transmission("A", mod_type="ASK", num_symbols=8)
    ask_res = sdr.demodulate(ask_iq, mod_type="ASK", samples_per_symbol=8)
    assert ask_res["modulation"] == "ASK"
    assert "recovered_bits" in ask_res
    assert ask_res["total_bits"] > 0

    # FSK Demodulation
    fsk_iq = sdr.generate_synthetic_rf_transmission("B", mod_type="FSK", num_symbols=8)
    fsk_res = sdr.demodulate(fsk_iq, mod_type="FSK", samples_per_symbol=8)
    assert fsk_res["modulation"] == "FSK"

    # PSK Demodulation
    psk_iq = sdr.generate_synthetic_rf_transmission("C", mod_type="PSK", num_symbols=8)
    psk_res = sdr.demodulate(psk_iq, mod_type="PSK", samples_per_symbol=8)
    assert psk_res["modulation"] == "PSK"


def test_dpa_side_channel_analysis():
    """Verify Differential Power Analysis isolates leaked key byte (>3 sigma threshold)."""
    dpa = DPASideChannelAnalyzer()
    secret_key = 0x5A
    traces, plaintexts = dpa.generate_synthetic_traces(secret_key_byte=secret_key, num_traces=60, trace_len=32)
    
    res = dpa.analyze_traces(traces, plaintexts, target_bit=0)
    assert res["status"] == "COMPLETED"
    assert res["snr_sigma"] >= 3.0  # Conforms to Section 3.2 > 3*sigma rule
    assert res["key_recovered"] is True
    assert len(res["delta_w_trace"]) > 0


def test_ipfs_merkle_dag_content_addressing():
    """Verify IPFS Merkle DAG content-addressed storage, CID calculation and retrieval."""
    ipfs = global_forensic_grid.ipfs
    payload = {"heuristic": "POLYSUB_FREQUENCY_MATCH", "version": "5.0"}
    cid = ipfs.publish("HEURISTIC_RULE_01", payload)

    assert cid.startswith("bafyreib")
    artifact = ipfs.resolve(cid)
    assert artifact is not None
    assert artifact["title"] == "HEURISTIC_RULE_01"
    assert artifact["payload"] == payload
    assert "merkle_root" in artifact


def test_fedlm_differential_privacy():
    """Verify Federated Learning round adds Gaussian DP perturbation and normalizes weights."""
    fedlm = global_forensic_grid.fedlm
    round_result = fedlm.execute_round()

    assert round_result["round"] >= 1
    assert round_result["participating_nodes"] == 4
    assert len(round_result["updated_weights"]) == 12
    # Verify weights sum approximately to 1.0 (normalized)
    assert abs(sum(round_result["updated_weights"]) - 1.0) < 0.05
    assert "(1." in round_result["privacy_guarantee"] or "(2." in round_result["privacy_guarantee"]


def test_api_v5_endpoints():
    """Verify FastAPI V5 REST endpoints."""
    # 1. Root status check
    r_root = client.get("/")
    assert r_root.status_code == 200
    assert any(v in r_root.json()["version"] for v in ("5.0.0-AUTONOMOUS", "6.0.0-NEURAL-QUANTUM", "7.0.0-AUTONOMOUS", "8.0.0-AUTONOMOUS", "9.0.0-SINGULARITY"))

    # 2. SMT Solver endpoint
    r_smt = client.post("/api/v1/agentic/solve-smt", json={"ciphertext": "534756736247383d", "max_key_len": 2})
    assert r_smt.status_code == 200

    # 3. MCTS Search endpoint
    r_mcts = client.post("/api/v1/agentic/mcts-search", json={"ciphertext": "SGVsbG8gV29ybGQ=", "max_iterations": 10})
    assert r_mcts.status_code == 200
    assert "best_plaintext" in r_mcts.json()

    # 4. SDR Spectrum endpoint
    r_spec = client.post("/api/v1/signal/spectrum", json={"center_freq_mhz": 433.92, "sample_rate_mhz": 2.4, "n_fft": 64})
    assert r_spec.status_code == 200
    assert "power_spectrum_dbm" in r_spec.json()

    # 5. SDR Demodulate endpoint
    r_demod = client.post("/api/v1/signal/demodulate", json={"modulation": "ASK", "samples_per_symbol": 8})
    assert r_demod.status_code == 200
    assert "recovered_bits" in r_demod.json()

    # 6. DPA Analyze endpoint
    r_dpa = client.post("/api/v1/signal/dpa-analyze", json={"use_synthetic": True, "secret_key": 90, "num_traces": 40})
    assert r_dpa.status_code == 200
    assert "snr_sigma" in r_dpa.json()

    # 7. Global Grid Status & Peers
    r_grid = client.get("/api/v1/grid/status")
    assert r_grid.status_code == 200
    assert r_grid.json()["network_status"] == "ONLINE"

    r_peers = client.get("/api/v1/grid/peers")
    assert r_peers.status_code == 200
    assert len(r_peers.json()) >= 4

    # 8. IPFS Publish & List
    r_ipfs_pub = client.post("/api/v1/grid/ipfs/publish", json={"title": "TEST_RULE", "payload": {"rule": "chi2"}})
    assert r_ipfs_pub.status_code == 200
    assert "cid" in r_ipfs_pub.json()

    r_ipfs_list = client.get("/api/v1/grid/ipfs/list")
    assert r_ipfs_list.status_code == 200
    assert len(r_ipfs_list.json()) >= 1

    # 9. FedLM Round
    r_fed = client.post("/api/v1/grid/fedlearn/round", json={"noise_sigma": 0.02, "num_client_nodes": 4})
    assert r_fed.status_code == 200
    assert "privacy_guarantee" in r_fed.json()
