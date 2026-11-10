export type SecurityMode = 'STANDARD' | 'SECURE' | 'FORTRESS';

export interface StatisticalMetrics {
  length: number;
  shannon_entropy: number;
  printable_ratio: number;
  index_of_coincidence: number;
  chi_squared_english: number;
  detected_charsets: string[];
  has_null_bytes: boolean;
  is_pure_ascii: boolean;
}

export interface Hypothesis {
  family: 'ENCODING' | 'ENCRYPTION' | 'HASH' | 'COMPRESSION' | 'SOURCE_CODE' | 'STRUCTURED' | 'BINARY' | 'UNKNOWN';
  name: string;
  confidence: number;
  details: string;
  decoder_id?: string;
}

export interface DetectionResponse {
  metrics: StatisticalMetrics;
  hypotheses: Hypothesis[];
  execution_time_ms: number;
}

export interface ScoreComponents {
  ngram_score: number;
  dict_score: number;
  printable_score: number;
  ic_score: number;
  entropy_penalty: number;
  raw_total: number;
}

export interface CandidatePlaintext {
  text: string;
  transformation: string;
  parameter?: string;
  score: number;
  score_components: ScoreComponents;
  is_most_likely: boolean;
  verified_structure?: string;
}

export interface PipelineNode {
  id: string;
  depth: number;
  parent_id?: string;
  transformation: string;
  parameter?: string;
  output_snippet: string;
  confidence: number;
  execution_time_ms: number;
  score: number;
  is_terminal: boolean;
}

export interface PipelineDAG {
  nodes: PipelineNode[];
  best_candidate?: CandidatePlaintext;
  total_execution_time_ms: number;
  recursion_depth: number;
  cycle_detected: boolean;
}

export interface SecurityProfileStatus {
  profile: SecurityMode;
  max_input_size_bytes: number;
  network_isolated: boolean;
  ram_only_execution: boolean;
  active_sessions_count: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event_type: string;
  input_sha256: string;
  security_profile: string;
  status: string;
  duration_ms: number;
  details: string;
}

export interface CodeAnalysisResult {
  is_code: boolean;
  language?: string;
  syntax_valid: boolean;
  functions: string[];
  classes: string[];
  imports: string[];
  cyclomatic_complexity: number;
  obfuscation_risk: number;
  security_warnings: string[];
}

export interface BinaryAnalysisResult {
  magic_hex: string;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  byte_histogram: number[];
  hex_dump: { offset: string; hex: string; ascii: string }[];
}

export interface HashAnalysisResult {
  is_hash: boolean;
  detected_algorithms: string[];
  bit_length?: number;
  integrity_notice: string;
}

export interface AIExplanationResponse {
  summary: string;
  step_by_step_reasoning: string[];
  confidence_verdict: string;
  security_advisory: string;
}

export interface HardwareStatus {
  device_id: string;
  firmware_version: string;
  is_authenticated: boolean;
  session_token: string;
  oled_lines: string[];
  rgb_led: { r: number; g: number; b: number };
  buzzer_active: boolean;
  panic_triggered: boolean;
  input_buffer: string;
  last_key?: string;
  free_heap_bytes: number;
  battery_mv: number;
}

// --- Roadmap V2.0 Interfaces ---

export interface JWTInspectionResult {
  is_valid_jwt: boolean;
  header?: Record<string, any>;
  payload?: Record<string, any>;
  signature_hex?: string;
  claims_info?: Record<string, any>;
  vulnerabilities?: string[];
  error?: string;
}

export interface ProtobufField {
  field: number;
  wire_type: string;
  value?: any;
  hex?: string;
  int64?: number;
  int32?: number;
  length?: number;
}

export interface ProtobufInspectionResult {
  total_bytes: number;
  fields_parsed: number;
  fields: ProtobufField[];
}

export interface CBORInspectionResult {
  success: boolean;
  parsed_cbor?: any;
  bytes_consumed?: number;
  error?: string;
}

export interface Base85Result {
  ascii85_decoded: string | null;
  z85_decoded: string | null;
  best_candidate: string;
}

export interface KasiskiResult {
  success: boolean;
  message?: string;
  total_letters?: number;
  index_of_coincidence?: number;
  friedman_estimated_key_length?: number;
  repeated_ngrams_count?: number;
  sample_ngrams?: Array<{
    ngram: string;
    occurrences: number;
    positions: number[];
    spacings: number[];
  }>;
  top_candidate_key_lengths?: Array<{
    key_length: number;
    factor_votes: number;
  }>;
}

export interface VigenereSolveResult {
  success: boolean;
  recovered_key?: string;
  key_length?: number;
  decrypted_plaintext?: string;
  candidate_score?: number;
  coset_analysis?: Array<{
    coset: number;
    best_shift: number;
    key_char: string;
    chi2: number;
  }>;
  error?: string;
}

export interface WASMPlugin {
  plugin_id: string;
  name: string;
  author: string;
  description: string;
  max_memory_mb: number;
  timeout_ms: number;
  total_invocations: number;
}

export interface ProvenanceLedgerRecord {
  record_id: number;
  timestamp: string;
  device_id: string;
  input_sha256: string;
  steps_applied: string[];
  result_sha256: string;
  prev_hash: string;
  record_hash: string;
  device_signature: string;
}

export interface LedgerVerificationResult {
  valid: boolean;
  total_blocks?: number;
  head_hash?: string;
  status?: string;
  tampered_record_id?: number;
  reason?: string;
}

// --- V3.0-EXECUTION TYPES (suggestion-v2.md) ---

export interface ColumnarCandidate {
  columns: number;
  permutation: number[];
  score: number;
  plaintext_preview: string;
}

export interface ColumnarTranspositionResult {
  success: boolean;
  best_columns: number;
  best_permutation: number[];
  recovered_plaintext: string;
  confidence_score: number;
  tested_column_candidates: ColumnarCandidate[];
  error?: string;
}

export interface LanguageAlignment {
  language: string;
  benchmark_ic: number;
  delta: number;
  match_confidence: number;
}

export interface MultilingualICResult {
  observed_ic: number;
  closest_profile: string;
  is_polyalphabetic_or_random: boolean;
  language_alignment: LanguageAlignment[];
}

export interface MerkleProofStep {
  position: 'left' | 'right';
  hash: string;
}

export interface MerkleAuditProof {
  success: boolean;
  leaf_index: number;
  leaf_hash: string;
  root_hash: string;
  root_signature: string;
  proof_path: MerkleProofStep[];
  error?: string;
}

export interface MerkleVerifyResult {
  is_valid: boolean;
  leaf_hash: string;
  expected_root: string;
  status: string;
}

export interface AsyncAnalysisInitResponse {
  task_id: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  estimated_ms: number;
  websocket_url: string;
}

export interface WebSocketAnalysisFrame {
  event: 'STAGE_RESULT' | 'STAGE_PROGRESS' | 'STAGE_COMPLETE';
  session_id: string;
  timestamp: number;
  payload: {
    step: number;
    detector: string;
    confidence: number;
    key_found: string;
    output_preview: string;
    entropy: number;
  };
}

export interface SanitizedContentResult {
  sanitized_text: string;
  redactions_count: number;
  redaction_keys: string[];
}

// --- V4.0 Enterprise & Post-Quantum Interfaces (suggestion-v3.md) ---

export interface PQCHandshakeResult {
  status: string;
  pqc_standard: string;
  duration_ms: number;
  controller_ecdh_pk_hex: string;
  controller_kyber_pk_len: number;
  kyber_ciphertext_len: number;
  master_key_fingerprint: string;
  symmetric_cipher: string;
  data_stream_verified: boolean;
  quantum_resistance_bits: number;
}

export interface PQCSignatureResult {
  algorithm: string;
  public_key_hex: string;
  signature_hex: string;
  signature_length: number;
  message_sha3_512?: string;
}

export interface PQCVerifyResult {
  is_valid: boolean;
  algorithm: string;
  status: string;
}

export interface SwarmNodeInfo {
  node_id: number;
  name: string;
  mac_address: string;
  ip_address: string;
  role: 'LEADER' | 'WORKER';
  status: 'IDLE' | 'SEARCHING' | 'OFFLINE';
  battery_soc: number;
  cpu_cores: number;
  has_vector_accel: boolean;
  key_range_start: number;
  key_range_end: number;
  keys_evaluated: number;
  last_heartbeat: number;
}

export interface SwarmCandidateInfo {
  key: number;
  plaintext: string;
  score: number;
  discovered_by_node: number;
}

export interface SwarmStatus {
  job_id: string | null;
  status: string;
  total_nodes: number;
  active_nodes_count: number;
  total_keyspace: number;
  keys_evaluated: number;
  progress_percent: number;
  top_candidates: SwarmCandidateInfo[];
  nodes: SwarmNodeInfo[];
}

export interface NeuralClassProbability {
  class_id: number;
  class_name: string;
  probability: number;
}

export interface NeuralClassificationResult {
  predicted_class: string;
  predicted_class_id: number;
  confidence: number;
  entropy: number;
  input_bytes: number;
  hardware_accelerator: string;
  inference_latency_ms: number;
  class_probabilities: NeuralClassProbability[];
}

export interface SBOMManifest {
  spdxVersion?: string;
  bomFormat?: string;
  specVersion?: string;
  name?: string;
  creationInfo?: any;
  metadata?: any;
  packages?: any[];
  components?: any[];
}

// --- V5.0 AUTONOMOUS AGENTIC & GLOBAL FORENSIC GRID TYPES (suggestion-v4.md) ---

export interface AgenticSMTResult {
  status: string;
  key_len?: number;
  key_hex?: string;
  key_repr?: string;
  plaintext?: string;
  engine?: string;
  constraints_count?: number;
  quality_score?: number;
}

export interface AgenticMCTSResult {
  best_plaintext: string;
  confidence_score: number;
  pipeline_sequence: string[];
  total_nodes_evaluated: number;
  exploration_constant: number;
}

export interface SDRSpectrumResult {
  center_freq_mhz: number;
  sample_rate_mhz: number;
  n_fft: number;
  frequencies_mhz: number[];
  power_spectrum_dbm: number[];
  peak_freq_mhz: number;
  peak_power_dbm: number;
  snr_db: number;
  waterfall_history: Array<{ timestamp_ms: number; bins: number[] }>;
}

export interface SDRDemodulateResult {
  modulation: string;
  recovered_bits: string;
  total_bits: number;
  decoded_hex: string;
  decoded_text: string;
  confidence: number;
}

export interface DPAResult {
  status: string;
  best_key_hypothesis: number;
  best_key_hex: string;
  delta_w_peak: number;
  noise_sigma: number;
  snr_sigma: number;
  key_recovered: boolean;
  criterion: string;
  delta_w_trace: number[];
}

export interface GridPeer {
  peer_id: string;
  region: string;
  role: string;
  latency_ms: number;
  pqc_verified: boolean;
  reputation_score: number;
  status: string;
}

export interface GridStatus {
  network_status: string;
  protocol: string;
  active_peers_count: number;
  peers: GridPeer[];
  ipfs_stored_artifacts: number;
  current_fedlm_round: number;
  privacy_budget: string;
}

export interface IPFSArtifact {
  cid: string;
  title: string;
  size_bytes: number;
  payload: any;
  timestamp: number;
  merkle_root: string;
}

export interface FedLMRoundResult {
  round: number;
  participating_nodes: number;
  total_samples: number;
  noise_sigma: number;
  privacy_guarantee: string;
  loss_metric: number;
  updated_weights: number[];
  classes: string[];
}

// --- V6.0 NEURAL-QUANTUM SILICON FABRIC TYPES (suggestion-v5.md) ---

export interface SNNRasterEvent {
  timestep: number;
  neuron_id: number;
}

export interface SNNInferenceResult {
  total_bytes_processed: number;
  total_spikes_emitted: number;
  neuron_spike_counts: number[];
  estimated_entropy: number;
  power_consumption_mw: number;
  latency_classification: string;
  active_lif_neurons: number;
  decay_factor_beta: number;
  threshold_voltage: number;
  raster_sample: SNNRasterEvent[];
}

export interface CFGNode {
  id: string;
  address: string;
  size_bytes: number;
  instructions_count: number;
  terminator: string;
  has_crypto: boolean;
}

export interface CFGEdge {
  source: string;
  target: string;
  type: string;
}

export interface CryptoConstant {
  primitive: string;
  constant_hex: string;
  address: string;
  confidence: number;
}

export interface ExtractedString {
  offset: string;
  string: string;
  length: number;
}

export interface FirmwareVulnerability {
  severity: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
  cwe: string;
  title: string;
  recommendation: string;
}

export interface FirmwareCFGResult {
  load_address: string;
  architecture: string;
  total_bytes: number;
  basic_blocks_count: number;
  edges_count: number;
  nodes: CFGNode[];
  edges: CFGEdge[];
  detected_constants: CryptoConstant[];
  extracted_strings: ExtractedString[];
  vulnerability_alerts: FirmwareVulnerability[];
}

export interface GlitchPulseResult {
  requested_width_ns: number;
  calibrated_width_ns: number;
  quantized_ticks: number;
  delay_offset_ns: number;
  repeat_count: number;
  glitch_voltage_level_v: number;
  nominal_voltage_v: number;
  target_response: string;
  fault_injected: boolean;
  timing_resolution: string;
}

export interface GlitchSweepPoint {
  width_ns: number;
  delay_ns: number;
  fault_injected: boolean;
  response: string;
}

export interface GlitchCampaignResult {
  campaign_id: string;
  total_trials: number;
  successful_faults: number;
  vulnerability_rate_pct: number;
  sweet_spot_recommendation: string;
  sweep_sample: GlitchSweepPoint[];
}

export interface ZKSNARKProofVector {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
}

export interface ZKSNARKPublicInputs {
  public_statement_sha256: string;
  public_tag: string;
  witness_length_bytes: number;
  is_printable_ascii: boolean;
}

export interface ZKSNARKProof {
  protocol: string;
  curve: string;
  circuit: string;
  public_inputs: ZKSNARKPublicInputs;
  proof_vector: ZKSNARKProofVector;
  verifying_key_hash: string;
  generated_at: number;
}

export interface ZKSNARKVerifyResult {
  is_valid: boolean;
  verified_statement?: string;
  public_tag?: string;
  status: string;
  gas_estimate?: number;
  verifier_engine?: string;
  reason?: string;
}

// --- V7.0 AUTONOMOUS SILICON REGENERATION & QKD TYPES (suggestion-v6.md) ---

export interface EFPGALutNode {
  id: number;
  state: 'HEALTHY' | 'FAULT_QUARANTINED' | 'RESERVE_ACTIVE';
  role: 'PRIMARY' | 'RESERVE';
  config_word: number;
  routed_inputs: number[];
  routed_output: number;
}

export interface EFPGANetlistResult {
  transformation: string;
  bitstream_hex: string;
  bitstream_size_bytes: number;
  allocated_luts_count: number;
  active_luts: number[];
  gate_equivalent_count: number;
  reconfiguration_latency_us: number;
  max_clock_freq_mhz: number;
  throughput_gbps: number;
  crc16_verified: boolean;
}

export interface EFPGAHealingResult {
  success: boolean;
  status: string;
  quarantined_lut: number;
  replacement_lut: number | null;
  reconfig_latency_us: number;
  total_quarantined: number;
  active_reserves: number;
  remaining_reserves: number;
  healing_events_lifetime: number;
  reason?: string;
}

export interface EFPGAFabricTelemetry {
  total_luts: number;
  primary_luts: number;
  reserve_luts: number;
  healthy_count: number;
  quarantined_count: number;
  active_reserves_count: number;
  healing_events: number;
  bitstreams_loaded: number;
  luts_grid: EFPGALutNode[];
}

export interface FHESearchResult {
  target_byte: number;
  target_ascii: string;
  encrypted_bytes_count: number;
  homomorphic_matches: number;
  relative_frequency: number;
  scheme: string;
  poly_modulus_degree: number;
  plain_modulus: number;
  noise_budget_bits: number;
}

export interface MPCCollaborateResult {
  protocol: string;
  target_byte: number;
  node_a_payload_len: number;
  node_b_payload_len: number;
  node_a_masked_share: number;
  node_b_masked_share: number;
  joint_frequency_matches: number;
  joint_relative_frequency: number;
  zero_exposure_verified: boolean;
}

export interface DNAArchiveResult {
  dna_sequence: string;
  sequence_length_nt: number;
  raw_payload_bytes: number;
  gc_content_pct: number;
  is_biologically_stable: boolean;
  theoretical_density_pb_per_g: number;
  estimated_strand_mass_grams: string;
  fountain_droplets_count: number;
  error_correction_scheme: string;
  half_life_years: number;
}

export interface DNADecodeResult {
  success: boolean;
  crc_verified: boolean;
  payload_bytes_len: number;
  decoded_hex: string;
  decoded_text: string;
  mutations_detected: number;
  status: string;
  reason?: string;
}

export interface QKDMeshResult {
  total_photons_transmitted: number;
  sifted_key_length_bits: number;
  qber_pct: number;
  threshold_qber_limit_pct: number;
  status: string;
  is_secure: boolean;
  channel_noise_pct: number;
  eavesdropper_intercepted: boolean;
  generated_key_hex: string | null;
  photon_fidelity_pct: number;
}

export interface QKDBellTestResult {
  chsh_parameter_s: number;
  classical_local_realism_bound: number;
  quantum_tsirelson_bound: number;
  bell_inequality_violated: boolean;
  entanglement_verified: boolean;
  bell_state: string;
  entanglement_fidelity_pct: number;
  status: string;
}

// --- V8.0 AUTONOMOUS SPACE MESH & PHOTONIC RESISTANCE TYPES (suggestion-v7.md) ---

export interface FSOLinkBudget {
  distance_km: number;
  wavelength_nm: number;
  tx_power_dbm: number;
  tx_gain_dbi: number;
  rx_gain_dbi: number;
  path_loss_db: number;
  atmospheric_loss_db: number;
  received_power_dbm: number;
  rx_sensitivity_dbm: number;
  link_margin_db: number;
  propagation_latency_ms: number;
  is_link_closed: boolean;
  bandwidth_gbps: number;
  bit_error_rate_fso: number;
  status: string;
}

export interface OrbitalSatellite {
  satellite_id: string;
  node_index: number;
  orbit_altitude_km: number;
  orbital_period_min: number;
  inclination_deg: number;
  sub_satellite_longitude: number;
  sub_satellite_latitude: number;
  laser_transceiver_status: string;
  optical_power_tx_dbm: number;
  fso_mesh_peers: string[];
}

export interface OrbitalConstellationTelemetry {
  constellation_name: string;
  active_satellites: number;
  satellites: OrbitalSatellite[];
  active_fso_links: Array<{
    source: string;
    target: string;
    distance_km: number;
    link_margin_db: number;
    bandwidth_gbps: number;
    status: string;
  }>;
  ground_station_uplink: {
    ground_node: string;
    connected_sat: string;
    distance_km: number;
    link_margin_db: number;
    latency_ms: number;
    downlink_gbps: number;
  };
  global_orbital_latency_ms: number;
  overall_health: string;
}

export interface PhotonicMZIResult {
  theta_rad: number;
  phi_rad: number;
  input_vector: number[];
  output_amplitudes: Array<{ real: number; imag: number }>;
  optical_intensities: number[];
  total_power_conserved: number;
  energy_dissipation_pj: number;
  propagation_latency_ps: number;
  efficiency_rating: string;
}

export interface PhotonicMeshResult {
  mesh_dimension: string;
  mzi_element_count: number;
  input_vector: number[];
  output_vector: number[];
  total_energy_pj: number;
  latency_ps: number;
  computation_speed: string;
}

export interface TopologicalBraidResult {
  generator_i: number;
  generator_next: number;
  total_strands: number;
  lhs_braid_word: string;
  rhs_braid_word: string;
  lhs_permutation: number[];
  rhs_permutation: number[];
  relation_holds: boolean;
  unitary_representation: Array<Array<{ real: number; imag: number }>>;
  quantum_fault_tolerance: string;
  decoherence_resistance_score: number;
}

export interface TopologicalBraidSequenceResult {
  strands_count: number;
  braid_word: number[];
  total_crossings: number;
  writhe: number;
  final_permutation: number[];
  topological_invariant: string;
  steps: Array<{ operator: string; strand_state: number[] }>;
  immunity_status: string;
}

export interface ASTMutationResult {
  initial_seed_code: string;
  best_evolved_code: string;
  best_fitness_score: number;
  sample_decrypted_preview: string;
  generations_completed: number;
  generation_history: Array<{
    generation: number;
    best_fitness: number;
    population_size: number;
  }>;
  compilation_target: string;
  autonomous_status: string;
}

// --- V9.0 SINGULARITY SILICON & DEEP SPACE INTERPLANETARY TYPES ---

export interface DTNNode {
  eid: string;
  name: string;
  type: string;
  aperture_cm: number;
  laser_power_w: number;
  coordinates_km: [number, number, number];
}

export interface DTNRouteHop {
  from: string;
  to: string;
  distance_km: number;
  propagation_delay_sec: number;
  link_margin_db: number;
  meets_spec: boolean;
}

export interface DTNRouteTelemetry {
  source: string;
  destination: string;
  direct_distance_km: number;
  direct_propagation_delay_sec: number;
  direct_propagation_delay_min: number;
  total_route_delay_min: number;
  hops: DTNRouteHop[];
  relay_count: number;
  protocol_spec: string;
}

export interface DTNBundleInfo {
  status: string;
  bundle_id: string;
  source: string;
  destination: string;
  custodian_node: string;
  merkle_root: string;
  chunk_count: number;
  payload_size_bytes: number;
  creation_timestamp: number;
  route_telemetry: DTNRouteTelemetry;
}

export interface DTNConstellationTelemetry {
  constellation_version: string;
  active_nodes_count: number;
  active_nodes: DTNNode[];
  total_bundles_in_flight: number;
  total_bundles_forwarded: number;
  total_bytes_transmitted: number;
  carrier_wavelength_nm: number;
  minimum_required_margin_db: number;
}

export interface MemristorVMMResult {
  status: string;
  v_in_volts: number[];
  i_out_ma: number[];
  conductance_matrix_ms: number[][];
  total_vmm_ops: number;
  latency_ns: number;
  efficiency_tops_per_watt: number;
  energy_consumed_pj: number;
  memory_bus_traffic_bytes: number;
  law_verified: string;
}

export interface MemristorTelemetry {
  crossbar_dimensions: string;
  efficiency_tops_per_watt: number;
  latency_ns: number;
  energy_per_op_fj: number;
  total_vmm_ops: number;
  memory_bus_fetch_overhead: string;
  conductance_matrix: number[][];
  microfluidic_system: {
    armed: boolean;
    zeroized: boolean;
    channel_pressure_psi: number;
    dissolution_spec_ns: string;
    measured_dissolution_ns: number;
  };
}

export interface MemristorFrequencyResult {
  payload_length: number;
  input_voltage_bands: number[];
  vmm_output_currents_ma: number[];
  neural_classification: string;
  efficiency_tops_per_watt: number;
  latency_ns: number;
}

export interface ZKSTARKProofResult {
  protocol: string;
  security_bits: number;
  trusted_setup_required: boolean;
  post_quantum_resistant: boolean;
  trace_length: number;
  public_inputs: {
    steps: number;
    final_state: number;
    field_modulus: number;
    homomorphic_context: string;
  };
  commitments: {
    trace_commitment: string;
    fri_final_commitment: string;
  };
  fri_folding_rounds: Array<{
    round: number;
    domain_size: number;
    merkle_root: string;
    layer_evals_summary: number[];
  }>;
  query_evaluations: Array<{
    query_index: number;
    value: number;
    auth_path: Array<{ sibling_hash: string; position: string }>;
  }>;
  proof_size_bytes: number;
}

export interface ZKSTARKVerificationResult {
  valid: boolean;
  protocol: string;
  post_quantum_status: string;
  security_level_bits: number;
  trusted_setup: string;
  verified_trace_commitment: string;
  public_final_state: number;
}

export interface MicrofluidicTelemetry {
  armed: boolean;
  zeroized: boolean;
  channel_pressure_psi: number;
  dissolution_spec_ns: string;
  measured_dissolution_ns: number;
}

// V26.0 Trans-Recursive Absolute Bio-Cognitive Types
export interface TransRecursiveState {
  membranePotentialUv: number;
  sppWavevectorReal: number;
  organoid3dPermittivity: number;
  sppPropagationLengthUm: number;
  throughputPbps: number;
  energyEfficiencyFj: number;
  interposerLocked: boolean;
  highGammaCenterHz: number;
  thetaCenterHz: number;
  phaseSync: number;
  transRecursivePower: number;
  entropyBits: number;
  transRecursiveKeyHash: string;
  dnaCodons: string;
  carrierFreqHz: number;
  fovealVectorRad: number;
  stegoPayload: string;
  recoveredPayload: string;
  absoluteKeyHex: string;
  zkCommitment: string;
  friLayers: string[];
  zeroized: boolean;
  zeroizeLatencyUs: number;
}

export interface TransRecursiveTelemetry {
  quantum_plasmonic_interposer: {
    throughput_pbps_mm2: number;
    energy_efficiency_fj_bit: number;
    central_wavelength_nm: number;
    total_couplings: number;
  };
  trans_recursive_engine: {
    sampling_rate_hz: number;
    total_operations: number;
    high_gamma_band: string;
    micro_tremor_band: string;
    zeroized: boolean;
  };
  zk_goldilocks_stark: {
    total_proofs: number;
    security_bits: number;
    goldilocks_prime: string;
  };
  security: {
    zeroization_sla_us: number;
    zeroized: boolean;
  };
}

export interface QuantumPlasmonicDispersionResult {
  membrane_potential_uv: number;
  organoid_3d_permittivity: number;
  quantum_spp_wavevector_real: number;
  spp_propagation_length_um: number;
  throughput_pbps_mm2: number;
  energy_efficiency_fj_bit: number;
  status: string;
}

export interface TransRecursiveKeyResult {
  status: string;
  key_hash: string;
  high_gamma_sample_count: number;
  theta_sample_count: number;
}

export interface TransRecursivePSDResult {
  sampling_rate_hz: number;
  high_gamma_band_range: string;
  theta_band_range: string;
  phase_synchronization: number;
  trans_recursive_power: number;
  shannon_entropy_bits: number;
  status: string;
}

export interface MultiSpectralMicroSaccadeDecodeResult {
  status: string;
  recovered_bytes_hex: string;
  recovered_text: string;
  byte_count: number;
}

export interface MultiSpectralMicroSaccadeModulateResult {
  status: string;
  signal_samples: number[];
  total_samples: number;
  carrier_freq_hz: number;
  duration_s: number;
}

export interface AbsoluteCognitiveKeyDeriveResult {
  key_hex: string;
  key_bytes_len: number;
  key_bits_len: number;
  zk_commitment: string;
  entropy_bits: number;
  trans_recursive_power: number;
  plasmonic_intensity_uv: number;
  dna_codon_stream: string;
  foveal_vector_rad: number;
  valid: boolean;
  status?: string;
}

export interface ZKAbsoluteCognitiveProofResult {
  status: string;
  proof: {
    proof_id: string;
    state_commitment: string;
    goldilocks_prime_hex: string;
    fri_layers: string[];
    security_margin_bits: number;
    trans_recursive_verified: boolean;
    plasmonic_intensity_verified: boolean;
    foveal_vector_verified: boolean;
    verified: boolean;
    timestamp: number;
  };
}

export interface ZKAbsoluteCognitiveVerifyResult {
  status: string;
  is_valid: boolean;
  proof_system: string;
}

export interface TransRecursiveZeroizeResult {
  status: string;
  shred_passes: string[];
  zeroization_latency_us: number;
  sla_target_us: number;
  fail_closed_confirmed: boolean;
}


