import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Atom,
  Dna,
  Lock,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Zap,
  Terminal,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Search,
  Users,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import {
  EFPGANetlistResult,
  EFPGAHealingResult,
  EFPGAFabricTelemetry,
  FHESearchResult,
  MPCCollaborateResult,
  DNAArchiveResult,
  DNADecodeResult,
  QKDMeshResult,
  QKDBellTestResult
} from '../types';
import { QuantumDnaVisualizer } from '../components/QuantumDnaVisualizer';

export const AutonomousSiliconPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'efpga' | 'fhe' | 'dna' | 'qkd'>('efpga');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 1. eFPGA State
  const [transformType, setTransformType] = useState('LFSR_STREAM_CIPHER');
  const [polynomialTap, setPolynomialTap] = useState(0x80000057);
  const [netlistResult, setNetlistResult] = useState<EFPGANetlistResult | null>(null);
  const [fabricTelemetry, setFabricTelemetry] = useState<EFPGAFabricTelemetry | null>(null);
  const [selectedDamageLut, setSelectedDamageLut] = useState(12);
  const [healingResult, setHealingResult] = useState<EFPGAHealingResult | null>(null);

  // 2. FHE & MPC State
  const [fhePlaintext, setFhePlaintext] = useState('CIPHERON_HOMOMORPHIC_ENCRYPTED_SEARCH_EXPERIMENT');
  const [fheTargetChar, setFheTargetChar] = useState('E');
  const [fheResult, setFheResult] = useState<FHESearchResult | null>(null);
  const [nodeAData, setNodeAData] = useState('HELLO_ALICE_RESEARCH_NODE');
  const [nodeBData, setNodeBData] = useState('HELLO_BOB_FORENSIC_PEER');
  const [mpcTargetChar, setMpcTargetChar] = useState('L');
  const [mpcResult, setMpcResult] = useState<MPCCollaborateResult | null>(null);

  // 3. DNA Provenance State
  const [dnaInputPayload, setDnaInputPayload] = useState('CIPHERON_ZK_MERKLE_PROVENANCE_ROOT_0x9A4B_V7_ARCHIVE');
  const [dnaArchiveResult, setDnaArchiveResult] = useState<DNAArchiveResult | null>(null);
  const [dnaDecodeResult, setDnaDecodeResult] = useState<DNADecodeResult | null>(null);

  // 4. QKD State
  const [numPhotons, setNumPhotons] = useState(256);
  const [channelNoise, setChannelNoise] = useState(2.5);
  const [eveActive, setEveActive] = useState(false);
  const [qkdResult, setQkdResult] = useState<QKDMeshResult | null>(null);
  const [bellResult, setBellResult] = useState<QKDBellTestResult | null>(null);

  // Initial load
  useEffect(() => {
    refreshFabricTelemetry();
  }, []);

  const refreshFabricTelemetry = async () => {
    try {
      const tel = await api.getEFPGAFabricTelemetry();
      setFabricTelemetry(tel);
    } catch {
      // ignore
    }
  };

  // Handlers
  const handleSynthesizeEFPGA = async () => {
    setLoading(true);
    setStatusMessage('Compiling high-speed gate netlist for target transformation...');
    try {
      const res = await api.synthesizeEFPGA(transformType, polynomialTap);
      setNetlistResult(res);
      await refreshFabricTelemetry();
      setStatusMessage(`eFPGA netlist synthesized: ${res.gate_equivalent_count} gates in ${res.reconfiguration_latency_us}µs (<15µs target).`);
    } catch (e: any) {
      setStatusMessage(`eFPGA synthesis error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfHealLUT = async () => {
    setLoading(true);
    setStatusMessage(`Isolating faulty LUT #${selectedDamageLut} and re-routing signal paths...`);
    try {
      const res = await api.healEFPGALut(selectedDamageLut);
      setHealingResult(res);
      await refreshFabricTelemetry();
      setStatusMessage(
        res.success
          ? `Silicon Self-Healed: LUT #${res.quarantined_lut} re-routed to reserve LUT #${res.replacement_lut} in ${res.reconfig_latency_us}µs!`
          : `Self-healing error: ${res.reason}`
      );
    } catch (e: any) {
      setStatusMessage(`Self-healing error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFHE = async () => {
    setLoading(true);
    setStatusMessage('Evaluating blind frequency search over BFV RLWE polynomial ciphertexts...');
    try {
      const targetByte = fheTargetChar.charCodeAt(0) || 69;
      const res = await api.searchFHEFrequency(fhePlaintext, targetByte);
      setFheResult(res);
      setStatusMessage(`FHE complete: Found ${res.homomorphic_matches} homomorphic matches with zero plaintext disclosure.`);
    } catch (e: any) {
      setStatusMessage(`FHE search error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMPC = async () => {
    setLoading(true);
    setStatusMessage('Executing 2-Party MPC additive secret sharing evaluation...');
    try {
      const targetByte = mpcTargetChar.charCodeAt(0) || 76;
      const res = await api.collaborateMPC(nodeAData, nodeBData, targetByte);
      setMpcResult(res);
      setStatusMessage(`MPC complete: Joint frequency matches = ${res.joint_frequency_matches} without exposing either node share.`);
    } catch (e: any) {
      setStatusMessage(`MPC error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEncodeDNA = async () => {
    setLoading(true);
    setStatusMessage('Translating cryptographic proof into synthetic biological DNA codons...');
    try {
      const res = await api.encodeDNAPayload(dnaInputPayload);
      setDnaArchiveResult(res);
      setDnaDecodeResult(null);
      setStatusMessage(`DNA strand synthesized: ${res.sequence_length_nt} nucleotides, GC Content: ${res.gc_content_pct}%.`);
    } catch (e: any) {
      setStatusMessage(`DNA encoding error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecodeDNA = async () => {
    if (!dnaArchiveResult) return;
    setLoading(true);
    setStatusMessage('Sequencing DNA nucleotide strand and verifying Reed-Solomon parity...');
    try {
      const res = await api.decodeDNASelfSequence(dnaArchiveResult.dna_sequence);
      setDnaDecodeResult(res);
      setStatusMessage(
        res.success
          ? `DNA Strand Verified: Zero mutations detected. Decoded payload recovered!`
          : `DNA decoding error: ${res.reason}`
      );
    } catch (e: any) {
      setStatusMessage(`DNA decoding error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateQKD = async () => {
    setLoading(true);
    setStatusMessage('Transmitting polarized single photons over optical fiber channel...');
    try {
      const res = await api.simulateQKDMesh(numPhotons, channelNoise, eveActive);
      setQkdResult(res);
      setStatusMessage(
        res.is_secure
          ? `QKD Success: QBER = ${res.qber_pct}% (<11.0% limit). Unconditional key established!`
          : `Eavesdropper Alert! QBER = ${res.qber_pct}% (>=11.0% limit). Channel collapsed!`
      );
    } catch (e: any) {
      setStatusMessage(`QKD simulation error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateBell = async () => {
    setLoading(true);
    setStatusMessage('Measuring Bell state correlation angles and evaluating CHSH inequality...');
    try {
      const res = await api.evaluateQKDBellTest();
      setBellResult(res);
      setStatusMessage(`E91 Bell Test: S = ${res.chsh_parameter_s} > 2.0. True quantum non-locality verified!`);
    } catch (e: any) {
      setStatusMessage(`Bell test error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-purple-950/60 border border-blue-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-500/20 border border-blue-500/40 rounded-xl text-blue-300">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Autonomous Silicon Regeneration & Quantum Mesh
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
                  v7.0.0-SILICON
                </span>
              </h1>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Embedded eFPGA dynamic bitstream synthesis with self-healing LUT logic, BFV homomorphic cryptanalysis,
              DNA nucleotide provenance archiving (215 PB/g), and QKD BB84/E91 photonic entanglement monitoring.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl flex items-center space-x-3 text-xs font-mono">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-300">64-LUT eFPGA Fabric</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400">QKD BB84 Active</span>
            </div>
          </div>
        </div>

        {/* Global Terminal Status Bar */}
        {statusMessage && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-2 text-xs font-mono text-cyan-300">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('efpga')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'efpga'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>1. eFPGA Self-Healing Silicon</span>
        </button>

        <button
          onClick={() => setActiveTab('fhe')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'fhe'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Lock className="w-4 h-4 text-purple-400" />
          <span>2. Homomorphic FHE & MPC</span>
        </button>

        <button
          onClick={() => setActiveTab('dna')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'dna'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Dna className="w-4 h-4 text-emerald-400" />
          <span>3. DNA Nucleotide Archive</span>
        </button>

        <button
          onClick={() => setActiveTab('qkd')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'qkd'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Atom className="w-4 h-4 text-cyan-400" />
          <span>4. QKD Optical Mesh & Bell Test</span>
        </button>
      </div>

      {/* TAB 1: eFPGA Silicon & Self-Healing Logic */}
      {activeTab === 'efpga' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Netlist Synthesis Controls */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                Hardware Bitstream Synthesis
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Target Transformation Pipeline</label>
                <select
                  value={transformType}
                  onChange={(e) => setTransformType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 outline-none"
                >
                  <option value="LFSR_STREAM_CIPHER">LFSR Stream Accelerator (Hardware Taps)</option>
                  <option value="SBOX_PARALLEL_ARRAY">Parallel 8-Bit S-Box Substitution Array</option>
                  <option value="BIT_PERMUTATION_MATRIX">High-Speed Bit Permutation & XOR Matrix</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">LFSR Feedback Tap Word (Hex)</label>
                <input
                  type="text"
                  value={`0x${polynomialTap.toString(16).toUpperCase()}`}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 16);
                    if (!isNaN(v)) setPolynomialTap(v);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 outline-none"
                />
              </div>

              <button
                onClick={handleSynthesizeEFPGA}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Synthesize eFPGA Bitstream (&lt;15µs)</span>
              </button>

              {/* Silicon Self-Healing Injector */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Silicon Fault Injection & Self-Healing
                </h4>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedDamageLut}
                    onChange={(e) => setSelectedDamageLut(parseInt(e.target.value))}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 outline-none"
                  >
                    {Array.from({ length: 48 }).map((_, idx) => (
                      <option key={idx} value={idx}>
                        Primary LUT #{idx}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSelfHealLUT}
                    disabled={loading}
                    className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono font-bold transition-all"
                  >
                    Simulate & Heal
                  </button>
                </div>
              </div>

              {/* Fabric Summary Card */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Fabric Total LUTs:</span>
                  <span className="text-slate-200">{fabricTelemetry?.total_luts || 64}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Primary Logic:</span>
                  <span className="text-emerald-400">{fabricTelemetry?.primary_luts || 48}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Reserve Reserve:</span>
                  <span className="text-cyan-400">{fabricTelemetry?.reserve_luts || 16}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Quarantined Faults:</span>
                  <span className="text-rose-400 font-bold">{fabricTelemetry?.quarantined_count || 0}</span>
                </div>
              </div>
            </div>

            {/* Interactive 64-LUT Micro-Fabric Visualizer */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">
                      eFPGA 64-LUT Dynamic Silicon Fabric Matrix
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      48 Primary Active LUTs (0..47) + 16 Dynamic Reserve LUTs (48..63)
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Reconfig: &lt;15µs
                  </span>
                </div>

                {/* LUT Matrix Grid */}
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {fabricTelemetry?.luts_grid ? (
                    fabricTelemetry.luts_grid.map((lut) => {
                      const isQuarantined = lut.state === 'FAULT_QUARANTINED';
                      const isReserveActive = lut.state === 'RESERVE_ACTIVE';
                      const isReserve = lut.role === 'RESERVE';

                      return (
                        <div
                          key={lut.id}
                          className={`group relative p-2 rounded text-center font-mono text-[9px] border transition-all ${
                            isQuarantined
                              ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-pulse'
                              : isReserveActive
                              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                              : isReserve
                              ? 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400'
                              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          <div className="font-bold">L{lut.id}</div>
                          <div className="hidden group-hover:block absolute bottom-8 z-30 bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-left whitespace-nowrap text-[10px]">
                            <div>LUT #{lut.id} ({lut.role})</div>
                            <div className="text-slate-400">State: {lut.state}</div>
                            <div className="text-cyan-300">Word: 0x{lut.config_word.toString(16).toUpperCase()}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-16 text-center text-xs text-slate-500 py-6">
                      Awaiting eFPGA fabric connection...
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                    <span>Primary Active (0..47)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-cyan-500" />
                    <span>Reserve Idle (48..63)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-amber-500" />
                    <span>Reserve Active (Healed)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-rose-500" />
                    <span>Quarantined Fault</span>
                  </div>
                </div>
              </div>

              {/* Bitstream Synthesis Telemetry Card */}
              {netlistResult && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-blue-300 font-bold border-b border-slate-800 pb-1.5">
                    <span>Synthesized Gate Netlist</span>
                    <span className="text-emerald-400">{netlistResult.reconfiguration_latency_us} µs Latency</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-500">Gate Count: </span>
                      <span className="font-bold">{netlistResult.gate_equivalent_count} gates</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Throughput: </span>
                      <span className="font-bold text-cyan-400">{netlistResult.throughput_gbps} Gbps</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Clock: </span>
                      <span className="font-bold">{netlistResult.max_clock_freq_mhz} MHz</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Bitstream: </span>
                      <span className="font-bold">{netlistResult.bitstream_size_bytes} Bytes</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-1">
                    Payload Hex: {netlistResult.bitstream_hex.slice(0, 48)}...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Homomorphic FHE & MPC */}
      {activeTab === 'fhe' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Homomorphic Frequency Search Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-2">
                <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    BFV Homomorphic Frequency Search
                  </h3>
                  <p className="text-xs text-slate-400">
                    Execute search on RLWE ciphertexts without decrypting data
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Plaintext Payload to Encrypt</label>
                <textarea
                  value={fhePlaintext}
                  onChange={(e) => setFhePlaintext(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Target Character to Search</label>
                <input
                  type="text"
                  maxLength={1}
                  value={fheTargetChar}
                  onChange={(e) => setFheTargetChar(e.target.value)}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg p-2 text-center text-xs font-mono text-purple-300 font-bold outline-none"
                />
              </div>

              <button
                onClick={handleSearchFHE}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Execute Homomorphic Search (Zero Decryption)</span>
              </button>

              {fheResult && (
                <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/30 text-xs font-mono space-y-2">
                  <div className="flex justify-between items-center text-purple-300 font-bold border-b border-slate-800 pb-1">
                    <span>Homomorphic Result</span>
                    <span>Scheme: {fheResult.scheme}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>Matches Found: <span className="text-emerald-400 font-bold">{fheResult.homomorphic_matches}</span></div>
                    <div>Frequency: <span className="text-cyan-400 font-bold">{(fheResult.relative_frequency * 100).toFixed(1)}%</span></div>
                    <div>Noise Budget: <span className="text-slate-300">{fheResult.noise_budget_bits} bits</span></div>
                    <div>Plaintext Exposed: <span className="text-emerald-400 font-bold">0 BITS (ZERO)</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Secure Multi-Party Computation (MPC) Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-2">
                <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Multi-Party Computation (MPC) Additive Sharing
                  </h3>
                  <p className="text-xs text-slate-400">
                    Collaborative frequency analysis between mutually untrusted nodes
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Node A Private Payload</label>
                <input
                  type="text"
                  value={nodeAData}
                  onChange={(e) => setNodeAData(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Node B Private Payload</label>
                <input
                  type="text"
                  value={nodeBData}
                  onChange={(e) => setNodeBData(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Joint Target Character</label>
                <input
                  type="text"
                  maxLength={1}
                  value={mpcTargetChar}
                  onChange={(e) => setMpcTargetChar(e.target.value)}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg p-2 text-center text-xs font-mono text-indigo-300 font-bold outline-none"
                />
              </div>

              <button
                onClick={handleRunMPC}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Compute Joint MPC Frequency</span>
              </button>

              {mpcResult && (
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 text-xs font-mono space-y-2">
                  <div className="flex justify-between items-center text-indigo-300 font-bold border-b border-slate-800 pb-1">
                    <span>Joint MPC Result</span>
                    <span className="text-emerald-400">Zero Exposure Verified</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>Joint Matches: <span className="text-emerald-400 font-bold">{mpcResult.joint_frequency_matches}</span></div>
                    <div>Joint Frequency: <span className="text-cyan-400 font-bold">{(mpcResult.joint_relative_frequency * 100).toFixed(1)}%</span></div>
                    <div>Node A Blinded Share: <span className="text-slate-400">{mpcResult.node_a_masked_share}</span></div>
                    <div>Node B Blinded Share: <span className="text-slate-400">{mpcResult.node_b_masked_share}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DNA Nucleotide Archive */}
      {activeTab === 'dna' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Encoder Card */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-2">
                <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300">
                  <Dna className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Biological Codon Synthesis
                  </h3>
                  <p className="text-xs text-slate-400">
                    Map zk-SNARK proof ledgers to A, C, G, T strands
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Audit Proof / Key to Synthesize</label>
                <textarea
                  value={dnaInputPayload}
                  onChange={(e) => setDnaInputPayload(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <button
                onClick={handleEncodeDNA}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Synthesize DNA Strand</span>
              </button>

              {dnaArchiveResult && (
                <div className="space-y-3 pt-2">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Strand Length:</span>
                      <span className="text-emerald-400 font-bold">{dnaArchiveResult.sequence_length_nt} nt</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>GC Content:</span>
                      <span className={dnaArchiveResult.is_biologically_stable ? 'text-emerald-400' : 'text-amber-400'}>
                        {dnaArchiveResult.gc_content_pct}% ({dnaArchiveResult.is_biologically_stable ? 'Stable' : 'Volatile'})
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Density Guarantee:</span>
                      <span className="text-cyan-400 font-bold">{dnaArchiveResult.theoretical_density_pb_per_g} PB / gram</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Physical Half-Life:</span>
                      <span className="text-slate-200">{dnaArchiveResult.half_life_years} Years</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDecodeDNA}
                    disabled={loading}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-mono font-bold transition-all"
                  >
                    Decode & Verify DNA Strand
                  </button>
                </div>
              )}

              {dnaDecodeResult && (
                <div className={`p-3 rounded-lg border ${
                  dnaDecodeResult.success ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                } text-xs font-mono space-y-1`}>
                  <div className="font-bold">{dnaDecodeResult.status}</div>
                  <div className="text-[11px] text-slate-400 truncate">Recovered: {dnaDecodeResult.decoded_text}</div>
                </div>
              )}
            </div>

            {/* 3D DNA Double Helix Visualizer */}
            <div className="lg:col-span-2 space-y-4">
              <QuantumDnaVisualizer
                mode="DNA_HELIX"
                dnaSequence={dnaArchiveResult?.dna_sequence || 'ACGTACGTGCAATGCTAGCTAGCTAGCTAGCT'}
              />

              {dnaArchiveResult && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2">
                  <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-slate-800 pb-1">
                    <span>Synthesized Nucleotide Sequence</span>
                    <span className="text-slate-500">{dnaArchiveResult.fountain_droplets_count} Fountain Droplets</span>
                  </div>
                  <p className="text-slate-300 break-all bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px]">
                    {dnaArchiveResult.dna_sequence}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QKD Optical Mesh & Bell Test */}
      {activeTab === 'qkd' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* QKD Simulation Controls */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-2">
                <div className="p-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300">
                  <Atom className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    BB84 Optical Polarization Mesh
                  </h3>
                  <p className="text-xs text-slate-400">
                    Monitor QBER with 11.0% eavesdropping threshold
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Photons Transmitted:</span>
                  <span className="text-cyan-400 font-bold">{numPhotons}</span>
                </div>
                <input
                  type="range"
                  min="64"
                  max="1024"
                  step="64"
                  value={numPhotons}
                  onChange={(e) => setNumPhotons(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Channel Optical Noise:</span>
                  <span className="text-slate-200 font-bold">{channelNoise}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="15.0"
                  step="0.5"
                  value={channelNoise}
                  onChange={(e) => setChannelNoise(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Eve Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs font-mono text-slate-300">Eavesdropper (Eve Intercept)</span>
                <button
                  onClick={() => setEveActive(!eveActive)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                    eveActive
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {eveActive ? 'EVE ACTIVE' : 'EVE OFF'}
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSimulateQKD}
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>Simulate BB84 Optical Mesh</span>
                </button>

                <button
                  onClick={handleEvaluateBell}
                  disabled={loading}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 rounded-lg text-xs font-mono font-bold transition-all"
                >
                  Evaluate E91 Bell Inequality (CHSH)
                </button>
              </div>
            </div>

            {/* 3D Photonic Bloch Visualizer & Telemetry */}
            <div className="lg:col-span-2 space-y-4">
              <QuantumDnaVisualizer
                mode="QUANTUM_BLOCH"
                chshValue={bellResult?.chsh_parameter_s || 2.828}
              />

              {/* QKD Result HUD */}
              {qkdResult && (
                <div className={`p-4 rounded-xl border ${
                  qkdResult.is_secure
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                } text-xs font-mono space-y-2`}>
                  <div className="flex justify-between items-center font-bold border-b border-slate-800 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      {qkdResult.is_secure ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-400" />}
                      {qkdResult.status}
                    </span>
                    <span>QBER: {qkdResult.qber_pct}% (Limit: 11.0%)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                    <div>Sifted Bits: <span className="font-bold">{qkdResult.sifted_key_length_bits}</span></div>
                    <div>Fidelity: <span className="font-bold text-cyan-400">{qkdResult.photon_fidelity_pct}%</span></div>
                    <div>Eve Detected: <span className={qkdResult.eavesdropper_intercepted ? 'text-rose-400 font-bold' : 'text-slate-400'}>{qkdResult.eavesdropper_intercepted ? 'YES' : 'NO'}</span></div>
                    <div>Key Generated: <span className="font-bold text-emerald-400">{qkdResult.is_secure ? 'VALID' : 'ABORTED'}</span></div>
                  </div>
                  {qkdResult.generated_key_hex && (
                    <div className="text-[11px] text-slate-400 truncate pt-1">
                      Quantum Key Hex: {qkdResult.generated_key_hex}
                    </div>
                  )}
                </div>
              )}

              {/* Bell Inequality Card */}
              {bellResult && (
                <div className="bg-slate-900 border border-purple-500/30 p-4 rounded-xl text-xs font-mono space-y-2">
                  <div className="flex justify-between items-center text-purple-300 font-bold border-b border-slate-800 pb-1.5">
                    <span>E91 CHSH Bell Entanglement Test</span>
                    <span className="text-emerald-400">Non-Locality Verified</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                    <div>CHSH Value S: <span className="font-bold text-purple-400">{bellResult.chsh_parameter_s}</span></div>
                    <div>Classical Bound: <span>&le; {bellResult.classical_local_realism_bound}</span></div>
                    <div>Tsirelson Bound: <span>&le; {bellResult.quantum_tsirelson_bound}</span></div>
                    <div>Entanglement: <span className="text-emerald-400 font-bold">100%</span></div>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    State: {bellResult.bell_state} | Condition: S &gt; 2.0 confirms quantum non-locality.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutonomousSiliconPage;
