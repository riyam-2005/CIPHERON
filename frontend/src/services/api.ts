import {
  DetectionResponse,
  PipelineDAG,
  SecurityProfileStatus,
  AuditLogEntry,
  CodeAnalysisResult,
  BinaryAnalysisResult,
  HashAnalysisResult,
  AIExplanationResponse,
  HardwareStatus,
  SecurityMode,
  JWTInspectionResult,
  ProtobufInspectionResult,
  CBORInspectionResult,
  Base85Result,
  KasiskiResult,
  VigenereSolveResult,
  WASMPlugin,
  ProvenanceLedgerRecord,
  LedgerVerificationResult,
  ColumnarTranspositionResult,
  MultilingualICResult,
  MerkleAuditProof,
  MerkleVerifyResult,
  AsyncAnalysisInitResponse,
  SanitizedContentResult,
  PQCHandshakeResult,
  PQCSignatureResult,
  PQCVerifyResult,
  SwarmStatus,
  NeuralClassificationResult,
  SBOMManifest,
  AgenticSMTResult,
  AgenticMCTSResult,
  SDRSpectrumResult,
  SDRDemodulateResult,
  DPAResult,
  GridPeer,
  GridStatus,
  IPFSArtifact,
  FedLMRoundResult,
  SNNInferenceResult,
  FirmwareCFGResult,
  GlitchPulseResult,
  GlitchCampaignResult,
  ZKSNARKProof,
  ZKSNARKVerifyResult,
  EFPGANetlistResult,
  EFPGAHealingResult,
  EFPGAFabricTelemetry,
  FHESearchResult,
  MPCCollaborateResult,
  DNAArchiveResult,
  DNADecodeResult,
  QKDMeshResult,
  QKDBellTestResult,
  FSOLinkBudget,
  OrbitalConstellationTelemetry,
  PhotonicMZIResult,
  PhotonicMeshResult,
  TopologicalBraidResult,
  TopologicalBraidSequenceResult,
  ASTMutationResult,
  DTNBundleInfo,
  DTNConstellationTelemetry,
  DTNRouteTelemetry,
  MemristorVMMResult,
  MemristorTelemetry,
  MemristorFrequencyResult,
  ZKSTARKProofResult,
  ZKSTARKVerificationResult,
  MicrofluidicTelemetry,
  TransRecursiveTelemetry,
  QuantumPlasmonicDispersionResult,
  TransRecursiveKeyResult,
  TransRecursivePSDResult,
  MultiSpectralMicroSaccadeDecodeResult,
  MultiSpectralMicroSaccadeModulateResult,
  AbsoluteCognitiveKeyDeriveResult,
  ZKAbsoluteCognitiveProofResult,
  ZKAbsoluteCognitiveVerifyResult,
  TransRecursiveZeroizeResult
} from '../types';


const BASE_URL = '/api/v1';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  detectInput: (content: string) =>
    fetchJson<DetectionResponse>('/detect', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  runPipeline: (content: string) =>
    fetchJson<PipelineDAG>('/pipeline', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  runCaesar: (content: string, shift?: number) =>
    fetchJson<{ candidates: any[] }>(`/ciphers/caesar${shift !== undefined ? `?shift=${shift}` : ''}`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  runVigenere: (content: string, key?: string) =>
    fetchJson<{ candidates: any[]; key_ic_analysis: any[] }>(`/ciphers/vigenere${key ? `?key=${key}` : ''}`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  runAffine: (content: string, a?: number, b?: number) => {
    const q = a !== undefined && b !== undefined ? `?a=${a}&b=${b}` : '';
    return fetchJson<{ candidates: any[] }>(`/ciphers/affine${q}`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },

  runRailfence: (content: string, rails?: number) =>
    fetchJson<{ candidates: any[] }>(`/ciphers/railfence${rails ? `?rails=${rails}` : ''}`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  runXor: (content: string) =>
    fetchJson<{ candidates: any[] }>('/ciphers/xor', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  inspectHash: (content: string) =>
    fetchJson<HashAnalysisResult>('/hashes', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  inspectBinary: (content: string) =>
    fetchJson<BinaryAnalysisResult>('/binary', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  inspectCode: (content: string) =>
    fetchJson<CodeAnalysisResult>('/code-analysis', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  getSecurityProfile: () =>
    fetchJson<SecurityProfileStatus>('/security/profile'),

  setSecurityProfile: (profile: SecurityMode) =>
    fetchJson<{ status: string; current_profile: SecurityMode }>(`/security/profile?profile=${profile}`, {
      method: 'POST'
    }),

  triggerPanicWipe: () =>
    fetchJson<any>('/security/panic-wipe', {
      method: 'POST'
    }),

  getAuditLogs: (limit = 50) =>
    fetchJson<AuditLogEntry[]>(`/audit-log?limit=${limit}`),

  getHardwareStatus: () =>
    fetchJson<HardwareStatus>('/hardware/status'),

  interactHardware: (packet: any) =>
    fetchJson<any>('/hardware/interact', {
      method: 'POST',
      body: JSON.stringify(packet)
    }),

  requestAIExplain: (evidence: any) =>
    fetchJson<AIExplanationResponse>('/ai-explain', {
      method: 'POST',
      body: JSON.stringify({ evidence })
    }),

  // --- Roadmap V2.0 Methods ---

  inspectJwt: (content: string) =>
    fetchJson<JWTInspectionResult>('/esoteric/jwt', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  decodeProtobuf: (content: string) =>
    fetchJson<ProtobufInspectionResult>('/esoteric/protobuf', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  decodeCbor: (content: string) =>
    fetchJson<CBORInspectionResult>('/esoteric/cbor', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  decodeBase85: (content: string) =>
    fetchJson<Base85Result>('/esoteric/base85', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  decodeBraille: (content: string) =>
    fetchJson<{ braille_decoded: string | null; success: boolean }>('/esoteric/braille', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  runKasiski: (content: string, maxKeyLen = 16) =>
    fetchJson<KasiskiResult>(`/cryptanalysis/kasiski?max_key_len=${maxKeyLen}`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  solveVigenereCosets: (content: string, keyLength = 5) =>
    fetchJson<VigenereSolveResult>(`/cryptanalysis/vigenere-solve?key_length=${keyLength}`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  listPlugins: () =>
    fetchJson<WASMPlugin[]>('/plugins/list'),

  executePlugin: (pluginId: string, content: string) =>
    fetchJson<any>(`/plugins/execute?plugin_id=${pluginId}`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  getLedgerRecords: (limit = 50) =>
    fetchJson<ProvenanceLedgerRecord[]>(`/ledger/records?limit=${limit}`),

  verifyLedger: () =>
    fetchJson<LedgerVerificationResult>('/ledger/verify'),

  // --- V3.0-EXECUTION Methods ---

  solveColumnar: (content: string, maxCols = 8) =>
    fetchJson<ColumnarTranspositionResult>('/ciphers/columnar', {
      method: 'POST',
      body: JSON.stringify({ content, max_cols: maxCols })
    }),

  analyzeMultilingualIC: (content: string) =>
    fetchJson<MultilingualICResult>('/cryptanalysis/multilingual-ic', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  startAsyncAnalysis: (rawInput: string, maxDepth = 5, securityProfile = 'SECURE') =>
    fetchJson<AsyncAnalysisInitResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify({
        raw_input: rawInput,
        max_depth: maxDepth,
        security_profile: securityProfile,
        enable_llm_explanation: true
      })
    }),

  getAsyncAnalysisStatus: (taskId: string) =>
    fetchJson<any>(`/analyze/${taskId}`),

  getMerkleProof: (leafIndex: number) =>
    fetchJson<MerkleAuditProof>('/merkle/proof', {
      method: 'POST',
      body: JSON.stringify({ leaf_index: leafIndex })
    }),

  verifyMerkleProof: (leafHash: string, proofPath: any[], expectedRoot: string) =>
    fetchJson<MerkleVerifyResult>('/merkle/verify', {
      method: 'POST',
      body: JSON.stringify({
        leaf_hash: leafHash,
        proof_path: proofPath,
        expected_root: expectedRoot
      })
    }),

  sanitizeContent: (content: string) =>
    fetchJson<SanitizedContentResult>('/ai/sanitize', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  // --- V4.0-ENTERPRISE Methods (suggestion-v3.md) ---

  executePQCHandshake: () =>
    fetchJson<PQCHandshakeResult>('/pqc/handshake', {
      method: 'POST'
    }),

  signWithDilithium3: (message: string) =>
    fetchJson<PQCSignatureResult>('/pqc/sign', {
      method: 'POST',
      body: JSON.stringify({ message })
    }),

  verifyDilithium3: (message: string, signatureHex: string, pubKeyHex: string) =>
    fetchJson<PQCVerifyResult>('/pqc/verify', {
      method: 'POST',
      body: JSON.stringify({
        message,
        signature_hex: signatureHex,
        public_key_hex: pubKeyHex
      })
    }),

  getSwarmNodes: () =>
    fetchJson<SwarmStatus>('/swarm/nodes'),

  dispatchSwarmJob: (ciphertextHex = '4B3A88192C3D', totalKeys = 65536, targetCipher = 'MULTI_BYTE_XOR') =>
    fetchJson<any>('/swarm/dispatch', {
      method: 'POST',
      body: JSON.stringify({
        ciphertext_hex: ciphertextHex,
        total_keys: totalKeys,
        target_cipher: targetCipher
      })
    }),

  triggerSwarmFailover: (failedNodeId = 2) =>
    fetchJson<any>(`/swarm/failover?failed_node_id=${failedNodeId}`, {
      method: 'POST'
    }),

  classifyNeural: (content: string) =>
    fetchJson<NeuralClassificationResult>('/neural/classify', {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  getSPDXSbom: () =>
    fetchJson<SBOMManifest>('/sbom/spdx'),

  getCycloneDXSbom: () =>
    fetchJson<SBOMManifest>('/sbom/cyclonedx'),

  startV4Analysis: (rawPayload: string, maxDepth = 5, enablePQCSig = true) =>
    fetchJson<any>('/analyze/v4', {
      method: 'POST',
      body: JSON.stringify({
        raw_payload: rawPayload,
        max_depth: maxDepth,
        enable_pqc_signature: enablePQCSig
      })
    }),

  // --- V5.0-AUTONOMOUS AGENTIC & GLOBAL FORENSIC GRID (suggestion-v4.md) ---

  solveAgenticSMT: (ciphertext: string, maxKeyLen = 4) =>
    fetchJson<AgenticSMTResult>('/agentic/solve-smt', {
      method: 'POST',
      body: JSON.stringify({ ciphertext, max_key_len: maxKeyLen })
    }),

  runAgenticMCTS: (ciphertext: string, maxIterations = 40, explorationC = 1.414) =>
    fetchJson<AgenticMCTSResult>('/agentic/mcts-search', {
      method: 'POST',
      body: JSON.stringify({
        ciphertext,
        max_iterations: maxIterations,
        exploration_constant: explorationC
      })
    }),

  getSDRSpectrum: (centerFreqMHz = 433.92, sampleRateMHz = 2.4, nFFT = 128) =>
    fetchJson<SDRSpectrumResult>('/signal/spectrum', {
      method: 'POST',
      body: JSON.stringify({
        center_freq_mhz: centerFreqMHz,
        sample_rate_mhz: sampleRateMHz,
        n_fft: nFFT
      })
    }),

  demodulateSDR: (modulation = 'ASK', samplesPerSymbol = 8) =>
    fetchJson<SDRDemodulateResult>('/signal/demodulate', {
      method: 'POST',
      body: JSON.stringify({
        modulation,
        samples_per_symbol: samplesPerSymbol
      })
    }),

  runDPAAnalysis: (secretKey = 0x5A, numTraces = 60, targetBit = 0) =>
    fetchJson<DPAResult>('/signal/dpa-analyze', {
      method: 'POST',
      body: JSON.stringify({
        use_synthetic: true,
        secret_key: secretKey,
        num_traces: numTraces,
        target_bit: targetBit
      })
    }),

  getGridStatus: () =>
    fetchJson<GridStatus>('/grid/status'),

  getGridPeers: () =>
    fetchJson<GridPeer[]>('/grid/peers'),

  publishIPFS: (title: string, payload: any) =>
    fetchJson<any>('/grid/ipfs/publish', {
      method: 'POST',
      body: JSON.stringify({ title, payload })
    }),

  listIPFSArtifacts: () =>
    fetchJson<IPFSArtifact[]>('/grid/ipfs/list'),

  runFedLMRound: (noiseSigma = 0.02, numClientNodes = 4) =>
    fetchJson<FedLMRoundResult>('/grid/fedlearn/round', {
      method: 'POST',
      body: JSON.stringify({
        noise_sigma: noiseSigma,
        num_client_nodes: numClientNodes
      })
    }),

  // --- V6.0 NEURAL-QUANTUM SILICON FABRIC & ZK METHODS (suggestion-v5.md) ---

  processSNNEvent: (data: string) =>
    fetchJson<SNNInferenceResult>('/snn/infer', {
      method: 'POST',
      body: JSON.stringify({ data })
    }),

  decompileFirmware: (binaryHex: string, loadAddress = 0x08000000, arch = 'ARMEL') =>
    fetchJson<FirmwareCFGResult>('/firmware/decompile', {
      method: 'POST',
      body: JSON.stringify({
        binary_hex: binaryHex,
        load_address: loadAddress,
        arch
      })
    }),

  triggerGlitchPulse: (pulseWidthNs = 25.0, delayOffsetNs = 120.0, repeatCount = 1) =>
    fetchJson<GlitchPulseResult>('/glitch/pulse', {
      method: 'POST',
      body: JSON.stringify({
        pulse_width_ns: pulseWidthNs,
        delay_offset_ns: delayOffsetNs,
        repeat_count: repeatCount
      })
    }),

  runGlitchCampaign: (minWidthNs = 12.5, maxWidthNs = 62.5, minDelayNs = 80.0, maxDelayNs = 180.0) =>
    fetchJson<GlitchCampaignResult>('/glitch/campaign', {
      method: 'POST',
      body: JSON.stringify({
        min_width_ns: minWidthNs,
        max_width_ns: maxWidthNs,
        min_delay_ns: minDelayNs,
        max_delay_ns: maxDelayNs
      })
    }),

  generateZKProof: (privateWitness: string, publicTag = 'KEY_RECOVERY_PROOF') =>
    fetchJson<ZKSNARKProof>('/zk/prove', {
      method: 'POST',
      body: JSON.stringify({
        private_witness: privateWitness,
        public_tag: publicTag
      })
    }),

  verifyZKProof: (proof: any) =>
    fetchJson<ZKSNARKVerifyResult>('/zk/verify', {
      method: 'POST',
      body: JSON.stringify({ proof })
    }),

  // --- V7.0 AUTONOMOUS SILICON REGENERATION & QKD METHODS (suggestion-v6.md) ---

  synthesizeEFPGA: (transformationType = 'LFSR_STREAM_CIPHER', polynomialTap = 0x80000057, sboxVariant = 'AES_AFFINE') =>
    fetchJson<EFPGANetlistResult>('/efpga/synthesize', {
      method: 'POST',
      body: JSON.stringify({
        transformation_type: transformationType,
        polynomial_tap: polynomialTap,
        sbox_variant: sboxVariant
      })
    }),

  healEFPGALut: (damagedLutId = 12) =>
    fetchJson<EFPGAHealingResult>('/efpga/heal', {
      method: 'POST',
      body: JSON.stringify({ damaged_lut_id: damagedLutId })
    }),

  getEFPGAFabricTelemetry: () =>
    fetchJson<EFPGAFabricTelemetry>('/efpga/telemetry'),

  encryptFHEPayload: (plaintext: string) =>
    fetchJson<any>('/fhe/encrypt', {
      method: 'POST',
      body: JSON.stringify({ plaintext })
    }),

  searchFHEFrequency: (plaintext: string, targetByte = 69) =>
    fetchJson<FHESearchResult>('/fhe/search', {
      method: 'POST',
      body: JSON.stringify({ plaintext, target_byte: targetByte })
    }),

  collaborateMPC: (nodeAData: string, nodeBData: string, targetByte = 65) =>
    fetchJson<MPCCollaborateResult>('/mpc/collaborate', {
      method: 'POST',
      body: JSON.stringify({ node_a_data: nodeAData, node_b_data: nodeBData, target_byte: targetByte })
    }),

  encodeDNAPayload: (payload: string) =>
    fetchJson<DNAArchiveResult>('/dna/encode', {
      method: 'POST',
      body: JSON.stringify({ payload })
    }),

  decodeDNASelfSequence: (dnaSequence: string) =>
    fetchJson<DNADecodeResult>('/dna/decode', {
      method: 'POST',
      body: JSON.stringify({ dna_sequence: dnaSequence })
    }),

  simulateQKDMesh: (numPhotons = 256, channelNoisePct = 2.5, eavesdropperActive = false) =>
    fetchJson<QKDMeshResult>('/qkd/simulate', {
      method: 'POST',
      body: JSON.stringify({
        num_photons: numPhotons,
        channel_noise_pct: channelNoisePct,
        eavesdropper_active: eavesdropperActive
      })
    }),

  evaluateQKDBellTest: () =>
    fetchJson<QKDBellTestResult>('/qkd/bell-test'),

  // --- V8.0 AUTONOMOUS SPACE MESH & PHOTONIC RESISTANCE METHODS (suggestion-v7.md) ---

  calculateFSOLinkBudget: (params?: {
    distance_km?: number;
    tx_power_dbm?: number;
    tx_gain_dbi?: number;
    rx_gain_dbi?: number;
    rx_sensitivity_dbm?: number;
    atmospheric_loss_db?: number;
  }) =>
    fetchJson<FSOLinkBudget>('/orbital/link-budget', {
      method: 'POST',
      body: JSON.stringify({
        distance_km: params?.distance_km ?? 1000.0,
        tx_power_dbm: params?.tx_power_dbm ?? 30.0,
        tx_gain_dbi: params?.tx_gain_dbi ?? 105.0,
        rx_gain_dbi: params?.rx_gain_dbi ?? 105.0,
        rx_sensitivity_dbm: params?.rx_sensitivity_dbm ?? -38.0,
        atmospheric_loss_db: params?.atmospheric_loss_db ?? 3.0
      })
    }),

  getOrbitalConstellation: () =>
    fetchJson<OrbitalConstellationTelemetry>('/orbital/constellation'),

  executePhotonicMZITransform: (thetaRad = 1.5708, phiRad = 0.7854, x1 = 1.0, x2 = 0.0) =>
    fetchJson<PhotonicMZIResult>('/photonic/mzi-transform', {
      method: 'POST',
      body: JSON.stringify({
        theta_rad: thetaRad,
        phi_rad: phiRad,
        x1,
        x2
      })
    }),

  simulatePhotonicTensorMesh: (dim = 4, inputVector = [1.0, 0.5, -0.5, 0.0]) =>
    fetchJson<PhotonicMeshResult>('/photonic/mesh-simulate', {
      method: 'POST',
      body: JSON.stringify({
        dim,
        input_vector: inputVector
      })
    }),

  verifyTopologicalBraid: (generatorI = 1, strands = 4) =>
    fetchJson<TopologicalBraidResult>('/topological/braid-verify', {
      method: 'POST',
      body: JSON.stringify({
        generator_i: generatorI,
        strands
      })
    }),

  evaluateTopologicalBraidSequence: (strands = 4, braidWord = [1, 2, -1, 2]) =>
    fetchJson<TopologicalBraidSequenceResult>('/topological/braid-sequence', {
      method: 'POST',
      body: JSON.stringify({
        strands,
        braid_word: braidWord
      })
    }),

  evolveASTProtocol: (params?: {
    ciphertext_hex?: string;
    seed_code?: string;
    generations?: number;
    population_size?: number;
    target_hint?: string;
  }) =>
    fetchJson<ASTMutationResult>('/mutator/evolve-ast', {
      method: 'POST',
      body: JSON.stringify({
        ciphertext_hex: params?.ciphertext_hex ?? "0e0a1616196a0b1c0b1a",
        seed_code: params?.seed_code ?? "output = input_byte ^ 0x5A",
        generations: params?.generations ?? 5,
        population_size: params?.population_size ?? 6,
        target_hint: params?.target_hint
      })
    }),

  // --- V9.0 SINGULARITY SILICON & DEEP SPACE INTERPLANETARY API ---

  dispatchDTNBundle: (sourceEid = "dtn://earth.ground/node-alpha", destinationEid = "dtn://mars.surface/jezero-term", payloadText = "CIPHERON_V9_PAYLOAD", requestCustody = true) =>
    fetchJson<DTNBundleInfo>('/dtn/bundle-dispatch', {
      method: 'POST',
      body: JSON.stringify({
        source_eid: sourceEid,
        destination_eid: destinationEid,
        payload_text: payloadText,
        request_custody_transfer: requestCustody
      })
    }),

  transferDTNCustody: (bundleId: string, nextCustodianEid: string) =>
    fetchJson<{ bundle_id: string; previous_custodian: string; new_custodian: string; link_budget: any; custody_status: string; merkle_root: string }>('/dtn/custody-transfer', {
      method: 'POST',
      body: JSON.stringify({
        bundle_id: bundleId,
        next_custodian_eid: nextCustodianEid
      })
    }),

  calculateDTNLinkBudget: (sourceEid = "dtn://earth.ground/node-alpha", destinationEid = "dtn://mars.surface/jezero-term", txPowerW = 100.0) =>
    fetchJson<DTNRouteTelemetry>('/dtn/link-budget', {
      method: 'POST',
      body: JSON.stringify({
        source_eid: sourceEid,
        destination_eid: destinationEid,
        tx_power_w: txPowerW,
        tx_aperture_m: 0.50,
        rx_aperture_m: 0.70
      })
    }),

  getDTNTelemetry: () =>
    fetchJson<DTNConstellationTelemetry>('/dtn/telemetry'),

  executeMemristorVMM: (inputVoltages = [1.2, 0.8, 1.5, 0.4]) =>
    fetchJson<MemristorVMMResult>('/memristor/vmm-transform', {
      method: 'POST',
      body: JSON.stringify({
        input_voltages: inputVoltages
      })
    }),

  programMemristorCell: (row: number, col: number, conductanceMs: number) =>
    fetchJson<{ cell: string; previous_conductance_ms: number; new_conductance_ms: number; delta_ms: number }>('/memristor/program-cell', {
      method: 'POST',
      body: JSON.stringify({
        row,
        col,
        conductance_ms: conductanceMs
      })
    }),

  executeMemristorFrequencyTransform: (payloadText: string) =>
    fetchJson<MemristorFrequencyResult>('/memristor/frequency-transform', {
      method: 'POST',
      body: JSON.stringify({
        payload_text: payloadText
      })
    }),

  getMemristorTelemetry: () =>
    fetchJson<MemristorTelemetry>('/memristor/telemetry'),

  generateZKSTARKProof: (seedSecret = 42, steps = 64, homomorphicContext = "BFV_CKKS_INTERPLANETARY_CONTEXT") =>
    fetchJson<ZKSTARKProofResult>('/stark/prove', {
      method: 'POST',
      body: JSON.stringify({
        seed_secret: seedSecret,
        steps,
        homomorphic_context: homomorphicContext
      })
    }),

  verifyZKSTARKProof: (proof: any) =>
    fetchJson<ZKSTARKVerificationResult>('/stark/verify', {
      method: 'POST',
      body: JSON.stringify({ proof })
    }),

  getMicrofluidicStatus: () =>
    fetchJson<MicrofluidicTelemetry>('/security/microfluidic-status'),

  triggerMicrofluidicDissolution: (triggerSource = "PHYSICAL_PASSIVATION_BREACH") =>
    fetchJson<{ trigger_source: string; exothermic_reaction_initiated: boolean; silicon_metallization_destroyed: boolean; dissolution_latency_ns: number; requirement_met: boolean; status: string; fail_closed_secure: boolean }>('/security/microfluidic-trigger', {
      method: 'POST',
      body: JSON.stringify({
        trigger_source: triggerSource
      })
    }),

  // V26.0 Trans-Recursive Absolute Bio-Cognitive API
  getTransRecursiveTelemetry: () =>
    fetchJson<TransRecursiveTelemetry>('/trans-recursive/telemetry'),

  computeQuantumPlasmonicDispersion: (membranePotentialUv: number) =>
    fetchJson<QuantumPlasmonicDispersionResult>('/trans-recursive/quantum-plasmonic-dispersion', {
      method: 'POST',
      body: JSON.stringify({ membrane_potential_uv: membranePotentialUv })
    }),

  extractHighGammaKey: (highGammaSamples: number[], thetaSamples: number[]) =>
    fetchJson<TransRecursiveKeyResult>('/trans-recursive/high-gamma-key', {
      method: 'POST',
      body: JSON.stringify({
        high_gamma_samples: highGammaSamples,
        theta_samples: thetaSamples
      })
    }),

  computeTransRecursivePsd: (highGammaSamples: number[], thetaSamples: number[], phaseSync = 0.95) =>
    fetchJson<TransRecursivePSDResult>('/trans-recursive/trans-recursive-psd', {
      method: 'POST',
      body: JSON.stringify({
        high_gamma_samples: highGammaSamples,
        theta_samples: thetaSamples,
        phase_sync: phaseSync
      })
    }),

  decodeMultiSpectralMicroSaccade: (tremorSignal: number[]) =>
    fetchJson<MultiSpectralMicroSaccadeDecodeResult>('/trans-recursive/decode-saccade', {
      method: 'POST',
      body: JSON.stringify({ tremor_signal: tremorSignal })
    }),

  modulateMultiSpectralMicroSaccade: (payloadText: string, carrierFreqHz = 95.0, durationS = 0.5) =>
    fetchJson<MultiSpectralMicroSaccadeModulateResult>('/trans-recursive/modulate-saccade', {
      method: 'POST',
      body: JSON.stringify({
        payload_text: payloadText,
        carrier_freq_hz: carrierFreqHz,
        duration_s: durationS
      })
    }),

  deriveAbsoluteCognitiveKey: (
    highGammaSamples: number[],
    thetaSamples: number[],
    plasmonicIntensityUv: number,
    dnaCodonStream: string,
    fovealVectorRad: number,
    salt?: string
  ) =>
    fetchJson<AbsoluteCognitiveKeyDeriveResult>('/trans-recursive/derive-key', {
      method: 'POST',
      body: JSON.stringify({
        high_gamma_samples: highGammaSamples,
        theta_samples: thetaSamples,
        plasmonic_intensity_uv: plasmonicIntensityUv,
        dna_codon_stream: dnaCodonStream,
        foveal_vector_rad: fovealVectorRad,
        salt: salt
      })
    }),

  generateZKAbsoluteCognitiveProof: (
    transRecursivePower: number,
    plasmonicIntensityUv: number,
    fovealVectorRad: number,
    dnaCodons: string,
    userIdentity = 'OPERATOR_ABSOLUTE_01'
  ) =>
    fetchJson<ZKAbsoluteCognitiveProofResult>('/trans-recursive/zk-proof', {
      method: 'POST',
      body: JSON.stringify({
        trans_recursive_power: transRecursivePower,
        plasmonic_intensity_uv: plasmonicIntensityUv,
        foveal_vector_rad: fovealVectorRad,
        dna_codons: dnaCodons,
        user_identity: userIdentity
      })
    }),

  verifyZKAbsoluteCognitiveProof: (proof: any) =>
    fetchJson<ZKAbsoluteCognitiveVerifyResult>('/trans-recursive/zk-verify', {
      method: 'POST',
      body: JSON.stringify({ proof })
    }),

  triggerTransRecursiveZeroize: () =>
    fetchJson<TransRecursiveZeroizeResult>('/trans-recursive/zeroize', {
      method: 'POST'
    })
};




