from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Literal

class InputPayload(BaseModel):
    content: str = Field(..., description="Raw text or hex/base64 encoded binary string")
    source: Literal["web", "file", "esp32", "api"] = "web"
    filename: Optional[str] = None
    security_profile: Optional[Literal["STANDARD", "SECURE", "FORTRESS"]] = None

class StatisticalMetrics(BaseModel):
    length: int
    shannon_entropy: float
    printable_ratio: float
    index_of_coincidence: float
    chi_squared_english: float
    detected_charsets: List[str]
    has_null_bytes: bool
    is_pure_ascii: bool

class Hypothesis(BaseModel):
    family: Literal["ENCODING", "ENCRYPTION", "HASH", "COMPRESSION", "SOURCE_CODE", "STRUCTURED", "BINARY", "UNKNOWN"]
    name: str
    confidence: float = Field(..., ge=0.0, le=100.0)
    details: str
    decoder_id: Optional[str] = None

class DetectionResponse(BaseModel):
    metrics: StatisticalMetrics
    hypotheses: List[Hypothesis]
    execution_time_ms: float

class ScoreComponents(BaseModel):
    ngram_score: float
    dict_score: float
    printable_score: float
    ic_score: float
    entropy_penalty: float
    raw_total: float

class CandidatePlaintext(BaseModel):
    text: str
    transformation: str
    parameter: Optional[str] = None
    score: float = Field(..., ge=0.0, le=100.0)
    score_components: ScoreComponents
    is_most_likely: bool = False
    verified_structure: Optional[str] = None

class PipelineNode(BaseModel):
    id: str
    depth: int
    parent_id: Optional[str] = None
    transformation: str
    parameter: Optional[str] = None
    output_snippet: str
    confidence: float
    execution_time_ms: float
    score: float
    is_terminal: bool = False

class PipelineDAG(BaseModel):
    nodes: List[PipelineNode]
    best_candidate: Optional[CandidatePlaintext] = None
    total_execution_time_ms: float
    recursion_depth: int
    cycle_detected: bool = False

class SecurityProfileStatus(BaseModel):
    profile: Literal["STANDARD", "SECURE", "FORTRESS"]
    max_input_size_bytes: int
    network_isolated: bool
    ram_only_execution: bool
    active_sessions_count: int

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    event_type: str
    input_sha256: str
    security_profile: str
    status: str
    duration_ms: float
    details: str

class HardwarePacket(BaseModel):
    packet_type: Literal["KEYPAD", "BUTTON", "OLED_FRAME", "STATUS", "CHALLENGE", "PANIC", "CONFIG"]
    payload: Dict[str, Any]
    seq_num: int
    signature: Optional[str] = None
    timestamp: float

class CodeAnalysisResult(BaseModel):
    is_code: bool
    language: Optional[str] = None
    syntax_valid: bool = False
    functions: List[str] = []
    classes: List[str] = []
    imports: List[str] = []
    cyclomatic_complexity: int = 1
    obfuscation_risk: float = 0.0  # 0.0 to 100.0
    security_warnings: List[str] = []

class BinaryAnalysisResult(BaseModel):
    magic_hex: str
    file_type: str
    mime_type: str
    size_bytes: int
    byte_histogram: List[int]  # 256 byte frequency counts
    hex_dump: List[Dict[str, str]]

class HashAnalysisResult(BaseModel):
    is_hash: bool
    detected_algorithms: List[str]
    bit_length: Optional[int] = None
    integrity_notice: str

class AIExplanationRequest(BaseModel):
    evidence: Dict[str, Any]

class AIExplanationResponse(BaseModel):
    summary: str
    step_by_step_reasoning: List[str]
    confidence_verdict: str
    security_advisory: str

# --- V3.0 EXECUTION BLUEPRINT SCHEMAS (suggestion-v2.md Section 6.2 & 8.1) ---

class AsyncAnalysisRequest(BaseModel):
    raw_input: str = Field(..., description="Raw encoded input string or cipher payload")
    max_depth: int = Field(5, ge=1, le=10, description="Maximum recursive DAG transformation depth")
    security_profile: Literal["STANDARD", "SECURE", "FORTRESS"] = "SECURE"
    enable_llm_explanation: bool = True

class AsyncAnalysisResponse(BaseModel):
    task_id: str
    status: Literal["PROCESSING", "COMPLETED", "FAILED"]
    estimated_ms: int
    websocket_url: str

class ColumnarTranspositionRequest(BaseModel):
    content: str
    max_cols: int = Field(8, ge=2, le=12)

class MerkleProofRequest(BaseModel):
    leaf_index: int

class MerkleVerifyRequest(BaseModel):
    leaf_hash: str
    proof_path: List[Dict[str, str]]
    expected_root: str

class SanitizerRequest(BaseModel):
    content: str


# --- V4.0 ENTERPRISE & POST-QUANTUM SCHEMAS (suggestion-v3.md Section 6.2) ---

class V4AnalysisRequest(BaseModel):
    raw_payload: str = Field(..., description="Base64 or ASCII encoded input text")
    max_depth: int = Field(default=5, ge=1, le=10)
    enable_pqc_signature: bool = Field(default=True)

class V4AnalysisResponse(BaseModel):
    status: str
    task_id: str
    message: str

class PQCSignRequest(BaseModel):
    message: str

class PQCVerifyRequest(BaseModel):
    message: str
    signature_hex: str
    public_key_hex: str

class SwarmDispatchJobRequest(BaseModel):
    ciphertext_hex: str = "4B3A88192C3D"
    total_keys: int = Field(65536, ge=256, le=16777216)
    target_cipher: str = "MULTI_BYTE_XOR"

class NeuralClassifyRequest(BaseModel):
    content: str


# --- V5.0 AUTONOMOUS AGENTIC & GLOBAL FORENSIC GRID SCHEMAS (suggestion-v4.md) ---

class AgenticSMTRequest(BaseModel):
    ciphertext: str = Field(..., description="Target ciphertext (ASCII, Hex or Raw)")
    max_key_len: int = Field(default=4, ge=1, le=8)

class AgenticMCTSRequest(BaseModel):
    ciphertext: str = Field(..., description="Target obfuscated text/encoding")
    max_iterations: int = Field(default=40, ge=5, le=200)
    exploration_constant: float = Field(default=1.414, ge=0.5, le=3.0)

class SDRSpectrumRequest(BaseModel):
    center_freq_mhz: float = 433.92
    sample_rate_mhz: float = 2.4
    n_fft: int = 128
    iq_samples: Optional[List[List[float]]] = None

class SDRDemodulateRequest(BaseModel):
    modulation: str = "ASK"  # ASK, FSK, PSK
    samples_per_symbol: int = 8
    iq_samples: Optional[List[List[float]]] = None

class DPATraceRequest(BaseModel):
    target_bit: int = 0
    use_synthetic: bool = True
    secret_key: int = 0x5A
    num_traces: int = 60
    traces: Optional[List[List[float]]] = None
    plaintexts: Optional[List[int]] = None

class IPFSPublishRequest(BaseModel):
    title: str
    payload: Dict[str, Any]

class FedLMRoundRequest(BaseModel):
    noise_sigma: float = 0.02
    num_client_nodes: int = 4


# --- V6.0 NEURAL-QUANTUM SILICON FABRIC SCHEMAS (suggestion-v5.md) ---

class SNNInferenceRequest(BaseModel):
    data: str = Field(..., description="Raw text, ASCII or Hex byte stream for LIF SNN processing")

class FirmwareDecompileRequest(BaseModel):
    binary_hex: str = Field(..., description="Raw firmware flash binary blob in hex")
    load_address: int = Field(default=0x08000000, description="Base load address")
    arch: str = Field(default="ARMEL", description="Target architecture (ARMEL, RISCV, XTENSA)")

class GlitchPulseRequest(BaseModel):
    pulse_width_ns: float = Field(default=25.0, ge=12.5, le=500.0)
    delay_offset_ns: float = Field(default=120.0, ge=10.0, le=10000.0)
    repeat_count: int = Field(default=1, ge=1, le=16)

class GlitchCampaignRequest(BaseModel):
    min_width_ns: float = Field(default=12.5, ge=12.5, le=100.0)
    max_width_ns: float = Field(default=62.5, ge=12.5, le=200.0)
    min_delay_ns: float = Field(default=80.0, ge=20.0, le=500.0)
    max_delay_ns: float = Field(default=180.0, ge=50.0, le=1000.0)

class ZKSNARKProveRequest(BaseModel):
    private_witness: str = Field(..., description="Confidential recovered plaintext / key / exploit artifact")
    public_tag: str = Field(default="KEY_RECOVERY_PROOF")

class ZKSNARKVerifyRequest(BaseModel):
    proof: Dict[str, Any]


# --- V7.0 AUTONOMOUS SILICON REGENERATION & QKD SCHEMAS (suggestion-v6.md) ---

class EFPGASynthesizeRequest(BaseModel):
    transformation_type: str = Field(default="LFSR_STREAM_CIPHER", description="Target hardware pipeline: LFSR_STREAM_CIPHER, SBOX_PARALLEL, BIT_PERMUTATION")
    polynomial_tap: int = Field(default=0x80000057, description="Linear feedback shift register polynomial tap")
    sbox_variant: str = Field(default="AES_AFFINE", description="S-Box logic variant")

class EFPGAHealingRequest(BaseModel):
    damaged_lut_id: int = Field(default=12, ge=0, le=63, description="Target LUT ID to isolate and re-route")

class FHEEncryptRequest(BaseModel):
    plaintext: str = Field(..., description="Plaintext or hex payload to encrypt under BFV RLWE scheme")

class FHEFrequencySearchRequest(BaseModel):
    plaintext: str = Field(..., description="Encrypted payload source")
    target_byte: int = Field(default=69, ge=0, le=255, description="Target byte value to search homomorphically (e.g. 69 = 'E')")

class MPCSolveRequest(BaseModel):
    node_a_data: str = Field(default="CIPHERON_RESEARCH_DATA_ALPHA")
    node_b_data: str = Field(default="QUANTUM_FORENSIC_OMEGA_STREAM")
    target_byte: int = Field(default=65, ge=0, le=255, description="Target byte value (e.g. 65 = 'A')")

class DNAEncodeRequest(BaseModel):
    payload: str = Field(..., description="Raw text, hex or binary string to translate into DNA codons")

class DNADecodeRequest(BaseModel):
    dna_sequence: str = Field(..., description="DNA nucleotide sequence string (A, C, G, T)")

class QKDSimulateRequest(BaseModel):
    num_photons: int = Field(default=256, ge=16, le=4096)
    channel_noise_pct: float = Field(default=2.5, ge=0.0, le=50.0)
    eavesdropper_active: bool = Field(default=False)

class QKDBellTestRequest(BaseModel):
    trials: int = Field(default=1000, ge=100, le=10000)


# --- V8.0 AUTONOMOUS SPACE MESH & PHOTONIC RESISTANCE SCHEMAS (suggestion-v7.md) ---

class FSOLinkBudgetRequest(BaseModel):
    distance_km: float = Field(default=1000.0, ge=10.0, le=40000.0)
    tx_power_dbm: float = Field(default=30.0, ge=0.0, le=60.0)
    tx_gain_dbi: float = Field(default=105.0, ge=50.0, le=150.0)
    rx_gain_dbi: float = Field(default=105.0, ge=50.0, le=150.0)
    rx_sensitivity_dbm: float = Field(default=-38.0, ge=-80.0, le=0.0)
    atmospheric_loss_db: float = Field(default=3.0, ge=0.0, le=30.0)

class PhotonicMZIRequest(BaseModel):
    theta_rad: float = Field(default=1.5708, ge=0.0, le=6.2832)
    phi_rad: float = Field(default=0.7854, ge=0.0, le=6.2832)
    x1: float = Field(default=1.0)
    x2: float = Field(default=0.0)

class PhotonicMeshRequest(BaseModel):
    dim: int = Field(default=4, ge=2, le=16)
    input_vector: List[float] = Field(default=[1.0, 0.5, -0.5, 0.0])

class TopologicalBraidVerifyRequest(BaseModel):
    generator_i: int = Field(default=1, ge=1, le=12)
    strands: int = Field(default=4, ge=3, le=16)

class TopologicalBraidSequenceRequest(BaseModel):
    strands: int = Field(default=4, ge=3, le=16)
    braid_word: List[int] = Field(default=[1, 2, -1, 2])

class ASTEvolveRequest(BaseModel):
    ciphertext_hex: str = Field(default="0e0a1616196a0b1c0b1a", description="Target obfuscated / XOR stream in hex")
    seed_code: str = Field(default="output = input_byte ^ 0x5A")
    generations: int = Field(default=5, ge=1, le=20)
    population_size: int = Field(default=6, ge=2, le=30)
    target_hint: Optional[str] = Field(default=None, description="Optional target plaintext snippet")


# --- V9.0 SINGULARITY SILICON & DEEP SPACE INTERPLANETARY SCHEMAS (suggestion-v8.md) ---

class DTNBundleRequest(BaseModel):
    source_eid: str = Field(default="dtn://earth.ground/node-alpha", description="Source RFC 5050 Endpoint Identifier")
    destination_eid: str = Field(default="dtn://mars.surface/jezero-term", description="Destination Endpoint Identifier")
    payload_text: str = Field(default="CIPHERON_INTERPLANETARY_TELEMETRY_PAYLOAD", description="Raw bundle payload string")
    request_custody_transfer: bool = Field(default=True, description="Request RFC 5050 custody transfer acceptance")

class DTNTransferCustodyRequest(BaseModel):
    bundle_id: str = Field(..., description="Unique SHA-256 Bundle Identifier")
    next_custodian_eid: str = Field(..., description="Target custodian node EID")

class DTNLinkBudgetCalcRequest(BaseModel):
    source_eid: str = Field(default="dtn://earth.ground/node-alpha")
    destination_eid: str = Field(default="dtn://mars.surface/jezero-term")
    tx_power_w: float = Field(default=100.0, ge=1.0, le=5000.0)
    tx_aperture_m: float = Field(default=0.50, ge=0.1, le=10.0)
    rx_aperture_m: float = Field(default=0.70, ge=0.1, le=10.0)

class MemristorVMMRequest(BaseModel):
    input_voltages: List[float] = Field(default=[1.2, 0.8, 1.5, 0.4], description="Wordline input voltage vector")

class MemristorProgramRequest(BaseModel):
    row: int = Field(..., ge=0, le=3, description="Wordline index (row)")
    col: int = Field(..., ge=0, le=3, description="Bitline index (column)")
    conductance_ms: float = Field(..., ge=0.01, le=5.0, description="Target conductance in milliSiemens")

class MemristorFrequencyTransformRequest(BaseModel):
    payload_text: str = Field(..., description="Payload data to transform and classify via Processing-in-Memory crossbar")

class MicrofluidicTriggerRequest(BaseModel):
    trigger_source: str = Field(default="PASSIVATION_BREACH", description="Breach source (e.g. FIB_PROBE, LASER_DECAP, PASSIVATION_BREACH)")

class ZKSTARKProveRequest(BaseModel):
    seed_secret: int = Field(default=42, ge=1, description="Private witness seed integer")
    steps: int = Field(default=64, ge=16, le=256, description="Execution trace trace length")
    homomorphic_context: Optional[str] = Field(default="BFV_CKKS_INTERPLANETARY_CONTEXT")

class ZKSTARKVerifyRequest(BaseModel):
    proof: Dict[str, Any] = Field(..., description="Complete FRI-zk-STARK proof object")


# --- V10.0 OMEGA ARCHITECTURE & HDC VECTOR SCHEMAS (suggestion-v9.md) ---

class HDCBindRequest(BaseModel):
    seed_a: int = Field(default=0xDEADBEEF, description="PRNG seed for Hypervector A")
    seed_b: int = Field(default=0xCAFEBABE, description="PRNG seed for Hypervector B")

class HDCBundleRequest(BaseModel):
    seeds: List[int] = Field(default=[0xDEADBEEF, 0xCAFEBABE, 0x1337C0DE], description="List of seeds to bundle via majority voting")

class HDCPermuteRequest(BaseModel):
    seed: int = Field(default=0xDEADBEEF, description="Seed for base Hypervector")
    shift: int = Field(default=5, ge=1, le=31, description="Cyclic permutation bit shift")

class HDCSimilarityRequest(BaseModel):
    seed_a: int = Field(default=0xDEADBEEF)
    seed_b: int = Field(default=0xCAFEBABE)

class HDCClassifyStreamRequest(BaseModel):
    payload_text: str = Field(default="CIPHERON_UNKNOWN_BYTE_STREAM", description="Payload string to classify via HDC")

class RecursiveSTARKFoldRequest(BaseModel):
    step_id: int = Field(default=1, ge=1)
    state_root: str = Field(default="0x9f8b4c2e1a")

class ChipletThermalSimRequest(BaseModel):
    workload_pct: float = Field(default=75.0, ge=0.0, le=100.0, description="Chiplet workload percentage")


# --- V11.0 TRANSCENDENCE ARCHITECTURE & QGNN / MOF SCHEMAS (suggestion-v10.md) ---

class QGNNKnotEvalRequest(BaseModel):
    crossings: List[int] = Field(default=[1, 1, 1], description="Artin braid crossing generators (e.g. [1, 1, 1] for Trefoil 3_1)")

class QGNNDependencyGraphRequest(BaseModel):
    edges: List[List[int]] = Field(default=[[0, 1], [1, 2], [2, 0], [1, 3], [3, 2]], description="Obfuscated cipher dependency graph edges [u, v]")

class MOFEncodeRequest(BaseModel):
    key_text: str = Field(default="CIPHERON_MOF_MASTER_ENTROPY_KEY_2026", description="Key text to encode into MOF gas sorption")

class TriHarvestSimulateRequest(BaseModel):
    ambient_lux: float = Field(default=500.0, ge=0.0, le=100000.0, description="Ambient optical illuminance in Lux")
    delta_t_c: float = Field(default=3.2, ge=0.0, le=100.0, description="Thermal gradient Delta T in degrees Celsius")


# --- V12.0 NEXUS OMNI-SYNTHESIS ARCHITECTURE SCHEMAS (suggestion-v11.md) ---

class QFieldTeleportRequest(BaseModel):
    payload_text: str = Field(default="NEXUS_EPR_TELEPORTATION_PAYLOAD_V12", description="Data payload to teleport across quantum field channel")

class BioSynapticCurrentRequest(BaseModel):
    ion_current_pA: float = Field(default=120.0, description="Injected ion channel current in picoamperes (pA)")

class CosmicHarvestSimRequest(BaseModel):
    gcr_flux: float = Field(default=4.5, ge=0.1, le=100.0, description="Galactic Cosmic Ray proton flux in particles/(cm²·s)")
    plasma_density: float = Field(default=1.0, ge=0.1, le=10.0, description="Magnetosphere plasma density multiplier")


# --- V13.0 COSMIC OMNIPRESENCE ARCHITECTURE SCHEMAS (suggestion-v12.md) ---

class HolographicContractionRequest(BaseModel):
    payload_text: str = Field(default="COSMIC_HOLOGRAPHIC_BULK_STATE_V13", description="Cryptanalytic bulk state payload to project onto 4D CFT boundary")

class BioMolecularRepairRequest(BaseModel):
    damaged_gate_id: int = Field(default=4096, ge=0, description="Damaged logic gate ID to auto-crystallize in <50us")

class BioMolecularReconfigureRequest(BaseModel):
    target_topology: str = Field(default="HYPER_DIMENSIONAL_CROSSBAR_LATTICE", description="Target cryptanalysis netlist topology")

class CasimirSimRequest(BaseModel):
    cavity_spacing_nm: float = Field(default=45.0, ge=5.0, le=500.0, description="Casimir micro-cavity plate spacing in nanometers")


# --- V14.0 SINGULARITY OMNI-RECURSION ARCHITECTURE SCHEMAS (suggestion-v13.md) ---

class OmniTensorContractionRequest(BaseModel):
    payload_text: str = Field(default="SINGULARITY_RECURSIVE_HYPER_VECTOR_V14", description="Cryptanalytic hyper-vector payload to contract across M_inf")

class TemporalCoherenceRequest(BaseModel):
    timestamp_t1: float = Field(default=100.0, description="Initial timestamp in seconds")
    timestamp_t2: float = Field(default=100.005, description="Comparison timestamp in seconds")

class EntropicInversionRequest(BaseModel):
    noise_hex: str = Field(default="55555555555555555555555555555555", description="Thermal/photonic background noise hex bytes")

class PlanckVacuumSimRequest(BaseModel):
    cutoff_thz: float = Field(default=850.0, ge=100.0, le=10000.0, description="Planck-scale optical waveguide cutoff frequency in THz")


# --- V15.0 OMNI-EXISTENTIAL CONTINUUM ARCHITECTURE SCHEMAS (suggestion-v14.md) ---

class CalabiYauResolutionRequest(BaseModel):
    payload_text: str = Field(default="CALABI_YAU_10D_COMPACTIFIED_CIPHER_PAYLOAD_V15", description="Cipher payload to map to Calabi-Yau K_10 Euler invariants")

class GHZWavefunctionVerifyRequest(BaseModel):
    simulated_perturbation: bool = Field(default=False, description="Simulate unauthorized state modification to test tamper detection")

class SubPlanckianInversionRequest(BaseModel):
    thermal_noise_hex: str = Field(default="3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c", description="Cosmic thermal background noise hex string to reconstruct via Omega_inversion")

class VacuumPolarizationSimRequest(BaseModel):
    electric_field_v_m: float = Field(default=1.32e18, ge=1.0e16, le=1.0e20, description="Intense electrodynamic background field intensity in V/m")


# --- V16.0 OMNI-COSMOLOGICAL OMNIPRESENCE ARCHITECTURE SCHEMAS (suggestion-v15.md) ---

class TransfiniteResolutionRequest(BaseModel):
    payload_text: str = Field(default="TRANSFINITE_HILBERT_ALEPH_CIPHER_PAYLOAD_V16", description="Cipher payload to map to Hilbert-Aleph M_aleph_0 ordinal invariants")

class InfiniteGHZVerifyRequest(BaseModel):
    simulated_perturbation: bool = Field(default=False, description="Simulate unauthorized state modification across infinite-node cluster")

class SubQuantumRestorationRequest(BaseModel):
    thermal_noise_hex: str = Field(default="0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f", description="Primordial sub-quantum thermal background noise hex string to reconstruct via Xi_transcendent")

class QCDCondensateSimRequest(BaseModel):
    gluon_condensate_gev4: float = Field(default=0.012, ge=0.001, le=1.0, description="QCD gluon vacuum condensate density in GeV^4")


# --- V17.0 ABSOLUTE UNIFIED CONTINUUM ARCHITECTURE SCHEMAS (suggestion-v16.md) ---

class TranscosmicResolutionRequest(BaseModel):
    payload_text: str = Field(default="TRANSCOSMIC_HYPER_CONTINUUM_CIPHER_PAYLOAD_V17", description="Cipher payload to map to Trans-Cosmic M_inf_aleph_inf homotopy invariants")

class MultiverseWavefunctionVerifyRequest(BaseModel):
    simulated_perturbation: bool = Field(default=False, description="Simulate unauthorized state modification across continuous multi-verse wavefunction")

class PrimordialReconstructRequest(BaseModel):
    thermal_noise_hex: str = Field(default="5052494d4f524449414c5f5350414345", description="Primordial spacetime foam noise hex string to reconstruct via Omega_primordial")

class ElectroweakPhaseSimRequest(BaseModel):
    scalar_field_phi_gev: float = Field(default=246.22, ge=1.0, le=10000.0, description="Electroweak scalar field value phi in GeV")


# --- V18.0 ULTIMATE OMNI-SINGULARITY ARCHITECTURE SCHEMAS (suggestion-v17.md) ---

class OmniSingularityResolutionRequest(BaseModel):
    payload_text: str = Field(default="OMNI_SINGULARITY_ALEPH_ALEPH_CIPHER_PAYLOAD_V18", description="Cipher payload to map to Aleph-Aleph M_aleph_inf_inf cohomological invariants")

class OmniverseWavefunctionVerifyRequest(BaseModel):
    simulated_perturbation: bool = Field(default=False, description="Simulate unauthorized state modification across continuous omniverse wavefunction")

class EntropicSingularityInvertRequest(BaseModel):
    thermal_noise_hex: str = Field(default="535041434554494d455f464f414d5f45", description="Primordial spacetime foam entropy hex string to invert via Omega_omnipotent")

class GUTPhaseSimRequest(BaseModel):
    scalar_field_phi_gev: float = Field(default=2.0e16, ge=1.0e12, le=1.0e20, description="GUT scalar field value Phi in GeV")


# --- V19.0 ABSOLUTE OMNI-EXISTENTIAL INFINITY ARCHITECTURE SCHEMAS (suggestion-v18.md) ---

class OmniInfinityResolutionRequest(BaseModel):
    payload_text: str = Field(default="OMNI_INFINITY_HYPER_ALEPH_CIPHER_PAYLOAD_V19", description="Cipher payload to map to Hyper-Aleph M_aleph_inf+1 homological invariants")

class UniversalWavefunctionVerifyRequest(BaseModel):
    simulated_perturbation: bool = Field(default=False, description="Simulate unauthorized state modification across continuous universal wavefunction")

class TransdimensionalRematerializeRequest(BaseModel):
    thermal_noise_hex: str = Field(default="5052494d4f524449414c5f56414355554d5f464f414d5f563139", description="Primordial spacetime foam noise hex string to reconstruct via Omega_infinite")

class PlanckVacuumModulationRequest(BaseModel):
    vacuum_fluctuation_frequency_hz: float = Field(default=1.85e43, ge=1.0e30, le=1.0e50, description="Planck-scale vacuum fluctuation frequency in Hz")


# --- V20.0 ABSOLUTE OMNI-EXISTENTIAL TOTALITY ARCHITECTURE SCHEMAS (suggestion-v19.md) ---

class OmniTotalityResolutionRequest(BaseModel):
    payload_text: str = Field(default="OMNI_TOTALITY_HYPER_ALEPH_CIPHER_PAYLOAD_V20", description="Cipher payload to map to Hyper-Aleph M_aleph_inf+inf homological invariants")

class TotalityWavefunctionVerifyRequest(BaseModel):
    simulated_perturbation: bool = Field(default=False, description="Simulate unauthorized state modification across continuous totality wavefunction")

class TotalityRematerializeRequest(BaseModel):
    thermal_noise_hex: str = Field(default="5052494d4f524449414c5f544f54414c4954595f464f414d5f563230", description="Primordial spacetime foam noise hex string to reconstruct via Omega_totality")

class TotalityVacuumModulationRequest(BaseModel):
    vacuum_fluctuation_frequency_hz: float = Field(default=1.0e45, ge=1.0e30, le=1.0e55, description="Totality quantum vacuum fluctuation frequency in Hz")


# --- V21.0 OCULAR & EYE-GAZE BIOMETRIC CODING/DECODING SCHEMAS (suggestion-v20.md) ---

class EOGSampleRequest(BaseModel):
    raw_h: int = Field(default=2850, ge=0, le=4095, description="Raw ADC horizontal channel reading (0-4095)")
    raw_v: int = Field(default=2048, ge=0, le=4095, description="Raw ADC vertical channel reading (0-4095)")
    threshold: int = Field(default=800, ge=100, le=2000, description="Saccade detection voltage threshold")

class EOGSaccadeStreamRequest(BaseModel):
    saccades: List[str] = Field(default=["LEFT", "RIGHT", "UP", "DOWN"], description="List of saccade directions: LEFT, RIGHT, UP, DOWN")

class EOGDecodeStreamRequest(BaseModel):
    stream_hex: str = Field(default="1b", description="Hexadecimal binary string of encoded saccades (e.g. 1b)")

class PupilEntropyRequest(BaseModel):
    pupil_diameters_mm: List[float] = Field(
        default=[3.52, 3.48, 3.65, 3.50, 3.55, 3.72, 3.49, 3.58, 3.61, 3.44, 3.53, 3.67],
        description="Pupil diameter time series in millimeters (120-200Hz sampling)"
    )

class GazeStegoEncodeRequest(BaseModel):
    message_text: str = Field(default="EYE_CIPHER", description="Secret message to steganographically embed into gaze path")
    aoi_count: int = Field(default=4, ge=3, le=16, description="Number of Areas of Interest (AOIs)")
    initial_aoi: int = Field(default=0, ge=0, description="Starting AOI index")

class GazeStegoDecodeRequest(BaseModel):
    aoi_path: List[int] = Field(default=[0, 1, 2, 3, 0, 2], description="Observed AOI fixation transition path")

class OcularKeyDerivationRequest(BaseModel):
    eog_stream_hex: str = Field(default="1b4a8c", description="Hex stream of EOG saccades")
    pupil_delta_r: float = Field(default=0.285, description="Phasic pupil fluctuation magnitude delta_R in mm")


# --- V22.0 BIO-CYBERNETIC COGNITIVE INTERFACE & NEURAL INTENT SCHEMAS (suggestion-v21.md) ---

class EEGSpectralEntropyRequest(BaseModel):
    eeg_signal_uv: List[float] = Field(
        default=[12.4, -8.2, 18.5, 3.1, -15.6, 22.0, 5.4, -9.1, 14.8, -2.5, 11.0, -18.0],
        description="Raw EEG signal time-series in microvolts (250Hz sampling)"
    )

class P300ClassifyRequest(BaseModel):
    erp_window_uv: List[float] = Field(
        default=[2.0, 5.0, 18.5, 8.0, 1.0],
        description="ERP epoch window in microvolts centered around 300ms post-stimulus"
    )

class CognitiveKeyDeriveRequest(BaseModel):
    p300_peak_uv: float = Field(default=18.5, description="Detected P300 ERP amplitude peak in microvolts")
    neural_entropy_bits: float = Field(default=7.92, description="Calculated EEG spectral band entropy in bits/sample")
    eog_vector: List[float] = Field(default=[120.5, -45.0, 210.0, -180.0], description="Bi-channel EOG dipole ocular vector")

class NeuralStegoEncodeRequest(BaseModel):
    secret_text: str = Field(default="NEURAL_CIPHER_2026", description="Secret message to steganographically synthesize")
    initial_aoi: int = Field(default=0, ge=0, description="Starting AOI index")

class NeuralStegoDecodeRequest(BaseModel):
    aoi_path: List[int] = Field(default=[0, 1, 2, 0, 2], description="Observed gaze transition trajectory")
    flicker_frequencies_hz: List[float] = Field(default=[20.0, 10.0, 20.0, 10.0], description="Visual stimulus flicker frequencies")

class ZKBCIProofRequest(BaseModel):
    brainwave_vector: List[float] = Field(
        default=[4.2, 8.5, 19.4, 7.1, 2.8, -3.5, 1.2],
        description="Private witness brainwave recording vector"
    )
    user_identity: str = Field(default="CIPHERON_OPERATOR_01", description="Operator identity string")

class ZKBCIVerifyRequest(BaseModel):
    proof: Dict[str, Any] = Field(description="zk-BCI proof object to verify")


# --- V23.0 BIO-QUANTUM COGNITIVE NEURAL MESH & DNA-SYNAPTIC SCHEMAS (suggestion-v22.md) ---

class DNAEntropyEncodeRequest(BaseModel):
    neural_samples: List[float] = Field(
        default=[1.2, -0.8, 2.1, 0.5, -1.4, 0.9, -0.2, 1.8, -1.1, 0.4, 1.6, -0.7, 0.3, -1.9, 0.8, 1.1],
        description="Neural potential samples to translate into DNA nucleotide codons"
    )

class DNACodonEncodeRequest(BaseModel):
    payload_text: str = Field(default="CIPHERON", description="Payload string to encode into synthetic DNA codons")

class DNACodonDecodeRequest(BaseModel):
    dna_strand: str = Field(default="ACGTACGTACGTACGT", description="Synthetic DNA nucleotide strand to decode")

class MicroSaccadeDecodeRequest(BaseModel):
    saccade_signal: List[float] = Field(
        default=[0.12, 0.35, -0.22, 0.48, -0.15, 0.28, -0.31, 0.19, -0.05, 0.41, -0.18, 0.25],
        description="High-frequency micro-saccadic eye quiver signal (20-60Hz)"
    )

class DNASynapticKeyDeriveRequest(BaseModel):
    dna_strand: str = Field(default="ACGTCCGGAAGGTTAA", description="DNA codon sequence stream")
    saccade_entropy: float = Field(default=7.95, description="Micro-saccade quiver Shannon entropy in bits")

class QuantumDotCoupleRequest(BaseModel):
    membrane_potential_mv: float = Field(default=-25.0, ge=-100.0, le=100.0, description="Membrane potential in millivolts (-70mV resting to +30mV action spike)")

class ZKBioQuantumProofRequest(BaseModel):
    dna_strand: str = Field(default="ACGTACGTACGTACGT", description="DNA codon witness strand")
    neural_matrix: List[float] = Field(
        default=[0.85, 1.22, -0.45, 2.10, -1.15, 0.94],
        description="Fused neural potential matrix"
    )
    user_identity: str = Field(default="OPERATOR_BIO_QUANTUM_01", description="Operator identity string")

class ZKBioQuantumVerifyRequest(BaseModel):
    proof: Dict[str, Any] = Field(description="zk-BioQuantum STARK proof to verify")


# --- V24.0 BIO-QUANTUM OMNI-SYNAPTIC REALITY MATRIX SCHEMAS (suggestion-v23.md) ---

class GammaHolographicKeyRequest(BaseModel):
    eeg_gamma_samples: List[float] = Field(
        default=[1.5, -2.0, 0.5, -1.2, 2.1, -0.8, 1.0, -1.5, 2.4, -0.9, 1.3, -1.7],
        description="Visual-cortex gamma-band EEG samples (40Hz--120Hz)"
    )

class FovealMicroSaccadeDecodeRequest(BaseModel):
    saccade_signal: List[float] = Field(
        default=[0.05, -0.12, 0.28, -0.34, 0.15, -0.22, 0.31, -0.19, 0.08, -0.25, 0.18, -0.30],
        description="Closed-loop foveal micro-saccadic eye quiver signal (20Hz--80Hz)"
    )

class FovealMicroSaccadeModulateRequest(BaseModel):
    payload_text: str = Field(default="OMNI_SYN", description="Payload string to modulate onto foveal micro-saccadic quiver")
    carrier_freq_hz: float = Field(default=60.0, ge=20.0, le=80.0, description="Carrier frequency in Hz (20Hz to 80Hz)")
    duration_s: float = Field(default=0.5, ge=0.1, le=5.0, description="Duration in seconds")

class GammaPSDRequest(BaseModel):
    eeg_samples: List[float] = Field(
        default=[0.8, -1.2, 2.5, -0.7, 1.9, -2.1, 0.6, -1.4, 2.0, -0.5, 1.7, -1.1],
        description="Raw visual-cortex EEG time-series for gamma power spectral density evaluation"
    )

class PhotonicPhaseShiftRequest(BaseModel):
    membrane_potential_mv: float = Field(
        default=-25.0, ge=-100.0, le=100.0,
        description="Neural membrane potential in millivolts for electro-optic phase modulation"
    )

class OmniSynapticKeyDeriveRequest(BaseModel):
    eeg_gamma_samples: List[float] = Field(
        default=[1.2, -1.5, 2.0, -0.8, 1.7, -1.1],
        description="Gamma-band EEG samples"
    )
    photonic_phase_rad: float = Field(default=1.5708, ge=0.0, le=6.2832, description="Photonic phase shift in radians")
    dna_codon_stream: str = Field(default="ACGTACGTACGTACGT", description="Synthetic DNA nucleotide codon stream")
    foveal_theta: float = Field(default=0.045, description="Foveal fixation vector angle in radians")
    salt: Optional[str] = Field(default=None, description="Optional custom photonic salt")

class ZKOmniSynapticProofRequest(BaseModel):
    gamma_power: float = Field(default=12.5, ge=0.0, description="Evaluated gamma oscillation power")
    photonic_phase_rad: float = Field(default=1.5708, ge=0.0, le=6.2832, description="Photonic phase in radians")
    foveal_theta: float = Field(default=0.045, description="Foveal gaze angle in radians")
    dna_codons: str = Field(default="ACGTACGTACGTACGT", description="DNA codon witness strand")
    user_identity: str = Field(default="OPERATOR_OMNI_SYNAPTIC_01", description="Operator identity seed")

class ZKOmniSynapticVerifyRequest(BaseModel):
    proof: Dict[str, Any] = Field(description="zk-OmniSynaptic STARK-FRI proof object to verify")


# --- V25.0 BIO-QUANTUM OMNI-COGNITIVE SINGULARITY SCHEMAS (suggestion-v24.md) ---

class TransSpectralKeyRequest(BaseModel):
    gamma_samples: List[float] = Field(
        default=[2.1, -1.8, 3.2, -0.9, 2.5, -1.4, 1.8, -2.0],
        description="Visual-cortex gamma-band EEG samples (40Hz--150Hz)"
    )
    theta_samples: List[float] = Field(
        default=[0.8, -0.5, 1.1, -0.3, 0.9, -0.7, 1.0, -0.4],
        description="Thalamic theta-band EEG samples (4Hz--8Hz)"
    )

class TransFovealMicroSaccadeDecodeRequest(BaseModel):
    tremor_signal: List[float] = Field(
        default=[0.08, -0.15, 0.32, -0.41, 0.22, -0.29, 0.38, -0.21, 0.11, -0.31, 0.25, -0.37],
        description="Trans-foveal micro-saccadic eye tremor signal (20Hz--100Hz)"
    )

class TransFovealMicroSaccadeModulateRequest(BaseModel):
    payload_text: str = Field(default="OMNI_COG", description="Payload string to modulate onto trans-foveal micro-saccadic quiver")
    carrier_freq_hz: float = Field(default=75.0, ge=20.0, le=100.0, description="Carrier tremor frequency in Hz (20Hz to 100Hz)")
    duration_s: float = Field(default=0.5, ge=0.1, le=5.0, description="Duration in seconds")

class TransSpectralPSDRequest(BaseModel):
    gamma_samples: List[float] = Field(
        default=[1.8, -2.2, 2.9, -1.1, 2.3, -1.7, 1.5, -1.9],
        description="Gamma-band (40-150Hz) EEG signal array"
    )
    theta_samples: List[float] = Field(
        default=[0.7, -0.4, 1.0, -0.5, 0.8, -0.6, 0.9, -0.3],
        description="Theta-band (4-8Hz) EEG signal array"
    )
    phase_sync: float = Field(default=0.95, ge=-1.0, le=1.0, description="Thalamocortical phase synchronization coefficient")

class PlasmonicDispersionRequest(BaseModel):
    membrane_potential_uv: float = Field(
        default=1650.0, ge=0.0, le=3300.0,
        description="Neural membrane potential spike in microvolts for plasmonic SPP conversion"
    )

class OmniCognitiveKeyDeriveRequest(BaseModel):
    gamma_samples: List[float] = Field(
        default=[2.1, -1.8, 3.2, -0.9, 2.5, -1.4],
        description="Visual-cortex gamma-band samples"
    )
    theta_samples: List[float] = Field(
        default=[0.8, -0.5, 1.1, -0.3, 0.9, -0.7],
        description="Thalamic theta-band samples"
    )
    plasmonic_intensity_uv: float = Field(default=1650.0, ge=0.0, le=3300.0, description="Plasmonic sensor intensity in microvolts")
    dna_codon_stream: str = Field(default="ACGTACGTACGTACGTACGTACGTACGTACGT", description="Synthetic biological DNA codon strand")
    foveal_vector_rad: float = Field(default=0.025, description="Trans-foveal gaze fixation vector angle in radians")
    salt: Optional[str] = Field(default=None, description="Optional custom plasmonic salt")

class ZKOmniCognitiveProofRequest(BaseModel):
    trans_spectral_power: float = Field(default=24.5, ge=0.0, description="Cross-frequency trans-spectral power")
    plasmonic_intensity_uv: float = Field(default=1650.0, ge=0.0, le=3300.0, description="Plasmonic intensity in microvolts")
    foveal_vector_rad: float = Field(default=0.025, description="Trans-foveal fixation vector in radians")
    dna_codons: str = Field(default="ACGTACGTACGTACGTACGTACGTACGTACGT", description="DNA codon witness strand")
    user_identity: str = Field(default="OPERATOR_OMNI_COGNITIVE_01", description="Operator identity seed")

class ZKOmniCognitiveVerifyRequest(BaseModel):
    proof: Dict[str, Any] = Field(description="zk-OmniCognitive Goldilocks STARK-FRI proof object to verify")


# --- 40. V26.0.0-ABSOLUTE BIO-COGNITIVE OMNI-SINGULARITY (suggestion-v25.md) ---

class TransRecursiveKeyRequest(BaseModel):
    high_gamma_samples: List[float] = Field(
        default=[3.5, -2.8, 4.2, -1.9, 3.1, -2.4, 2.9, -3.1],
        description="High-gamma band (150-300Hz) EEG signal array"
    )
    theta_samples: List[float] = Field(
        default=[1.1, -0.7, 1.4, -0.8, 1.2, -0.6, 1.3, -0.9],
        description="Theta-band (4-8Hz) EEG signal array"
    )

class MultiSpectralMicroSaccadeDecodeRequest(BaseModel):
    tremor_signal: List[float] = Field(
        default=[0.05, -0.14, 0.32, -0.41, 0.22, -0.29, 0.38, -0.21],
        description="Multi-spectral trans-foveal micro-saccadic eye tremor signal samples (20Hz-120Hz)"
    )

class MultiSpectralMicroSaccadeModulateRequest(BaseModel):
    payload_text: str = Field(default="ABSOLUTE", description="Secret payload text to modulate onto micro-tremor carrier")
    carrier_freq_hz: float = Field(default=95.0, ge=20.0, le=120.0, description="Carrier frequency in Hz (20Hz-120Hz)")
    duration_s: float = Field(default=0.5, ge=0.05, le=5.0, description="Signal duration in seconds")

class TransRecursivePSDRequest(BaseModel):
    high_gamma_samples: List[float] = Field(
        default=[3.2, -2.7, 4.5, -1.8, 3.6, -2.5, 2.8, -3.2],
        description="High-gamma band (150-300Hz) EEG signal array"
    )
    theta_samples: List[float] = Field(
        default=[1.0, -0.6, 1.3, -0.7, 1.1, -0.5, 1.2, -0.8],
        description="Theta-band (4-8Hz) EEG signal array"
    )
    phase_sync: float = Field(default=0.95, ge=-1.0, le=1.0, description="Thalamocortical phase synchronization coefficient")

class QuantumPlasmonicDispersionRequest(BaseModel):
    membrane_potential_uv: float = Field(
        default=1650.0, ge=0.0, le=3300.0,
        description="Neural membrane potential spike in microvolts for quantum plasmonic SPP conversion"
    )

class AbsoluteCognitiveKeyDeriveRequest(BaseModel):
    high_gamma_samples: List[float] = Field(
        default=[3.1, -2.5, 4.2, -1.6, 3.4, -2.2],
        description="Visual-cortex high-gamma band (150-300Hz) samples"
    )
    theta_samples: List[float] = Field(
        default=[1.2, -0.8, 1.4, -0.5, 1.1, -0.9],
        description="Thalamic theta-band samples"
    )
    plasmonic_intensity_uv: float = Field(default=1650.0, ge=0.0, le=3300.0, description="Quantum-plasmonic sensor intensity in microvolts")
    dna_codon_stream: str = Field(default="ACGTACGTACGTACGTACGTACGTACGTACGT", description="Synthetic biological DNA codon strand")
    foveal_vector_rad: float = Field(default=0.025, description="Trans-foveal gaze fixation vector angle in radians")
    salt: Optional[str] = Field(default=None, description="Optional custom quantum-plasmonic salt")

class ZKAbsoluteCognitiveProofRequest(BaseModel):
    trans_recursive_power: float = Field(default=48.5, ge=0.0, description="Cross-frequency high-gamma trans-recursive power")
    plasmonic_intensity_uv: float = Field(default=1650.0, ge=0.0, le=3300.0, description="Quantum-plasmonic intensity in microvolts")
    foveal_vector_rad: float = Field(default=0.025, description="Trans-foveal fixation vector in radians")
    dna_codons: str = Field(default="ACGTACGTACGTACGTACGTACGTACGTACGT", description="DNA codon witness strand")
    user_identity: str = Field(default="OPERATOR_ABSOLUTE_COGNITIVE_01", description="Operator identity seed")

class ZKAbsoluteCognitiveVerifyRequest(BaseModel):
    proof: Dict[str, Any] = Field(description="zk-AbsoluteCognitive Goldilocks STARK-FRI proof object to verify")





