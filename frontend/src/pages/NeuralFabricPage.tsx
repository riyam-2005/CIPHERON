import React, { useState } from 'react';
import {
  Brain,
  Cpu,
  Zap,
  Shield,
  FileCode,
  Crosshair,
  Lock,
  Layers,
  Activity,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  FileCheck2,
  RefreshCw,
  Terminal,
  Fingerprint
} from 'lucide-react';
import { api } from '../services/api';
import {
  SNNInferenceResult,
  FirmwareCFGResult,
  CFGNode,
  GlitchPulseResult,
  GlitchCampaignResult,
  ZKSNARKProof,
  ZKSNARKVerifyResult
} from '../types';
import { ControlFlowGraph3D } from '../components/ControlFlowGraph3D';
import { SNNSpikeVisualizer } from '../components/SNNSpikeVisualizer';

export const NeuralFabricPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'snn' | 'decompiler' | 'emfi' | 'zk'>('snn');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 1. SNN Neuromorphic State
  const [snnInput, setSnnInput] = useState<string>(
    'CIPHERON_QUANTUM_EVENT_STREAM_ENTROPY_0123456789ABCDEF_LIF_NEURON_SPIKE_ARRAY'
  );
  const [snnResult, setSnnResult] = useState<SNNInferenceResult | null>(null);

  // 2. Symbolic Firmware Decompiler State
  const sampleFirmwareHex =
    '00b5074b786500200840002801d0002000bd704761646d696e5f70617373776f72645f7365637265743132330067e6096a85ae67bb72f36e3c3af54fa5637c777b';
  const [firmwareHexInput, setFirmwareHexInput] = useState<string>(sampleFirmwareHex);
  const [loadAddress, setLoadAddress] = useState<number>(0x08000000);
  const [arch, setArch] = useState<string>('ARMEL');
  const [cfgResult, setCfgResult] = useState<FirmwareCFGResult | null>(null);
  const [selectedNode, setSelectedNode] = useState<CFGNode | null>(null);

  // 3. Active EMFI Glitch State
  const [pulseWidthNs, setPulseWidthNs] = useState<number>(25.0);
  const [delayOffsetNs, setDelayOffsetNs] = useState<number>(120.0);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [glitchResult, setGlitchResult] = useState<GlitchPulseResult | null>(null);
  const [campaignResult, setCampaignResult] = useState<GlitchCampaignResult | null>(null);

  // 4. zk-SNARK State
  const [privateWitness, setPrivateWitness] = useState<string>(
    '0x9F82A4C18357B96E0D21A384_RECOVERED_MASTER_KEY_CIPHERON'
  );
  const [publicTag, setPublicTag] = useState<string>('EXPLOIT_VERIFICATION_AES256');
  const [zkProof, setZkProof] = useState<ZKSNARKProof | null>(null);
  const [verifyResult, setVerifyResult] = useState<ZKSNARKVerifyResult | null>(null);

  // Handlers
  const handleRunSNN = async () => {
    setLoading(true);
    setStatusMessage('Processing streaming events through 32 LIF neurons...');
    try {
      const res = await api.processSNNEvent(snnInput);
      setSnnResult(res);
      setStatusMessage(`SNN complete: ${res.total_spikes_emitted} spikes emitted, entropy ${res.estimated_entropy} bits.`);
    } catch (e: any) {
      setStatusMessage(`SNN inference error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecompileFirmware = async () => {
    setLoading(true);
    setStatusMessage('Disassembling flash binary blob and resolving basic blocks...');
    try {
      const res = await api.decompileFirmware(firmwareHexInput, loadAddress, arch);
      setCfgResult(res);
      if (res.nodes.length > 0) setSelectedNode(res.nodes[0]);
      setStatusMessage(`CFG reconstructed: ${res.basic_blocks_count} basic blocks, ${res.edges_count} branches.`);
    } catch (e: any) {
      setStatusMessage(`Decompilation error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerGlitch = async () => {
    setLoading(true);
    setStatusMessage('Pulsing 12.5ns tick-calibrated EMFI burst to target rail...');
    try {
      const res = await api.triggerGlitchPulse(pulseWidthNs, delayOffsetNs, repeatCount);
      setGlitchResult(res);
      setStatusMessage(
        res.fault_injected
          ? `Fault Success! Response: ${res.target_response}`
          : `Glitch pulse emitted. Response: ${res.target_response}`
      );
    } catch (e: any) {
      setStatusMessage(`Glitch error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunGlitchCampaign = async () => {
    setLoading(true);
    setStatusMessage('Running automated 2D parameter sweep matrix (pulse width vs delay offset)...');
    try {
      const res = await api.runGlitchCampaign(12.5, 62.5, 80.0, 180.0);
      setCampaignResult(res);
      setStatusMessage(`Sweep campaign complete: ${res.successful_faults}/${res.total_trials} faults (${res.vulnerability_rate_pct}%).`);
    } catch (e: any) {
      setStatusMessage(`Campaign error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateZKProof = async () => {
    setLoading(true);
    setStatusMessage('Synthesizing Plonk BN254 zk-SNARK proof vector...');
    try {
      const proof = await api.generateZKProof(privateWitness, publicTag);
      setZkProof(proof);
      setVerifyResult(null);
      setStatusMessage('zk-SNARK proof synthesized successfully with zero witness leakage.');
    } catch (e: any) {
      setStatusMessage(`zk-SNARK proof generation error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyZKProof = async () => {
    if (!zkProof) return;
    setLoading(true);
    setStatusMessage('Verifying pairing equations e(pi_a, pi_b) on BN254 elliptic curve...');
    try {
      const ver = await api.verifyZKProof(zkProof);
      setVerifyResult(ver);
      setStatusMessage(
        ver.is_valid
          ? 'Proof Verified: Zero-knowledge provenance mathematically confirmed!'
          : `Proof Verification Rejected: ${ver.reason}`
      );
    } catch (e: any) {
      setStatusMessage(`Verification error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-300">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Neural-Quantum Silicon Fabric & ZK Provenance
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  v6.0.0-FABRIC
                </span>
              </h1>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Neuromorphic Spiking Neural Network (LIF) continuous bitstream classification, bare-metal symbolic
              firmware decompiler with WebGL 3D CFG, nanosecond EMFI glitch generator, and Plonk BN254 zk-SNARK provenance.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl flex items-center space-x-3 text-xs font-mono">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300">ULP / Xtensa LX7 Ready</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400">12.5ns RMT Glitch Pulser</span>
            </div>
          </div>
        </div>

        {/* Global Status Bar */}
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
          onClick={() => setActiveTab('snn')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'snn'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>1. Neuromorphic SNN Event Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('decompiler')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'decompiler'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>2. Symbolic Decompiler & 3D CFG</span>
        </button>

        <button
          onClick={() => setActiveTab('emfi')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'emfi'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Crosshair className="w-4 h-4 text-amber-400" />
          <span>3. Active EMFI Glitch Pulser</span>
        </button>

        <button
          onClick={() => setActiveTab('zk')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'zk'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>4. zk-SNARK Proof-of-Analysis</span>
        </button>
      </div>

      {/* TAB 1: Neuromorphic SNN Event Engine */}
      {activeTab === 'snn' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input & Parameters Card */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Bitstream Stream Ingestion
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Stream Payload / Bitstream</label>
                <textarea
                  value={snnInput}
                  onChange={(e) => setSnnInput(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:border-cyan-500 outline-none"
                  placeholder="Enter raw ASCII text or hex bitstream..."
                />
              </div>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-500">Payload Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSnnInput('CIPHERON_RANDOM_HIGH_ENTROPY_0a9b8c7d6e5f4a3b2c1d0e')}
                    className="text-[10px] font-mono px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    High Entropy Stream
                  </button>
                  <button
                    onClick={() => setSnnInput('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')}
                    className="text-[10px] font-mono px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    Low Entropy Repetition
                  </button>
                  <button
                    onClick={() => setSnnInput('00b5074b786500200840002801d0002000bd704761646d696e')}
                    className="text-[10px] font-mono px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    Firmware Bytecode
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Architecture:</span>
                  <span className="text-cyan-400">32-Neuron LIF</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Decay Parameter (β):</span>
                  <span className="text-slate-200">0.85</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Firing Threshold (Vth):</span>
                  <span className="text-slate-200">0.35 V</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Execution Core:</span>
                  <span className="text-emerald-400">ESP32 ULP Co-Processor</span>
                </div>
              </div>

              <button
                onClick={handleRunSNN}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Process Neuromorphic Stream</span>
              </button>
            </div>

            {/* SNN Raster & Metrics Display */}
            <div className="lg:col-span-2 space-y-4">
              <SNNSpikeVisualizer data={snnResult} />

              {snnResult && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <span className="text-[11px] font-mono text-slate-500">Bytes Processed</span>
                    <p className="text-lg font-mono font-bold text-slate-200 mt-1">
                      {snnResult.total_bytes_processed} B
                    </p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <span className="text-[11px] font-mono text-slate-500">Shannon Entropy</span>
                    <p className="text-lg font-mono font-bold text-cyan-400 mt-1">
                      {snnResult.estimated_entropy} / 8.0
                    </p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <span className="text-[11px] font-mono text-slate-500">Sub-mW Power Draw</span>
                    <p className="text-lg font-mono font-bold text-emerald-400 mt-1">
                      {snnResult.power_consumption_mw} mW
                    </p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <span className="text-[11px] font-mono text-slate-500">Latency Mode</span>
                    <p className="text-xs font-mono font-bold text-amber-400 mt-2">
                      {snnResult.latency_classification}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Symbolic Firmware Decompiler & 3D CFG */}
      {activeTab === 'decompiler' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Disassembler Input Card */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                Firmware Flash Ingestion
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Firmware Hex Binary</label>
                <textarea
                  value={firmwareHexInput}
                  onChange={(e) => setFirmwareHexInput(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:border-cyan-500 outline-none"
                  placeholder="Paste raw hex dump from SPI Flash (e.g. 00b5074b...)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">Base Load Address</label>
                  <input
                    type="text"
                    value={`0x${loadAddress.toString(16).toUpperCase()}`}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 16);
                      if (!isNaN(val)) setLoadAddress(val);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">Architecture</label>
                  <select
                    value={arch}
                    onChange={(e) => setArch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 outline-none"
                  >
                    <option value="ARMEL">ARM Cortex-M (Thumb)</option>
                    <option value="XTENSA">Xtensa LX7 (ESP32-S3)</option>
                    <option value="RISCV">RISC-V 32-bit</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleDecompileFirmware}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Disassemble & Recover CFG</span>
              </button>

              {/* Selected Node Details */}
              {selectedNode && (
                <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 text-xs font-mono space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-cyan-400">Node: {selectedNode.id}</span>
                    <span className="text-slate-400">{selectedNode.address}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>
                      <span className="text-slate-500">Block Size: </span>
                      <span>{selectedNode.size_bytes} Bytes</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Instructions: </span>
                      <span>{selectedNode.instructions_count}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Terminator: </span>
                      <span className="text-amber-400">{selectedNode.terminator}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Crypto Marker: </span>
                      <span className={selectedNode.has_crypto ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {selectedNode.has_crypto ? 'TRUE' : 'FALSE'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3D WebGL CFG Viewer */}
            <div className="lg:col-span-2 space-y-4">
              {cfgResult ? (
                <ControlFlowGraph3D
                  nodes={cfgResult.nodes}
                  edges={cfgResult.edges}
                  onSelectNode={setSelectedNode}
                  selectedNodeId={selectedNode?.id}
                />
              ) : (
                <div className="h-[420px] bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Layers className="w-8 h-8 text-slate-600" />
                  <p className="text-xs font-mono">Disassemble a firmware binary to render interactive 3D CFG</p>
                </div>
              )}

              {/* Detected Cryptographic Constants & CWE Alerts */}
              {cfgResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cryptographic Signatures */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-mono font-semibold text-rose-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      Cryptographic Primitives ({cfgResult.detected_constants.length})
                    </h4>
                    {cfgResult.detected_constants.length === 0 ? (
                      <p className="text-xs text-slate-500 font-mono">No cryptographic markers detected.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {cfgResult.detected_constants.map((c, i) => (
                          <div key={i} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs font-mono">
                            <div className="flex justify-between text-slate-200 font-semibold">
                              <span>{c.primitive}</span>
                              <span className="text-rose-400">{c.address}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-1">
                              Match: {c.constant_hex}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Vulnerability Audit Alerts */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-mono font-semibold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Vulnerability Audit Alerts ({cfgResult.vulnerability_alerts.length})
                    </h4>
                    {cfgResult.vulnerability_alerts.length === 0 ? (
                      <p className="text-xs text-slate-500 font-mono">No critical security findings.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {cfgResult.vulnerability_alerts.map((v, i) => (
                          <div key={i} className="bg-slate-950 p-2.5 rounded border border-amber-500/20 text-xs font-mono">
                            <div className="flex justify-between text-amber-300 font-semibold">
                              <span>{v.title}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">{v.cwe}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">{v.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Active EMFI Glitch Pulser */}
      {activeTab === 'emfi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Glitch Pulser Control Card */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-amber-400" />
                EMFI Pulser Parameters (12.5ns Resolution)
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Pulse Width:</span>
                  <span className="text-amber-400 font-bold">{pulseWidthNs} ns</span>
                </div>
                <input
                  type="range"
                  min="12.5"
                  max="125.0"
                  step="12.5"
                  value={pulseWidthNs}
                  onChange={(e) => setPulseWidthNs(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>12.5 ns (1 tick)</span>
                  <span>125 ns (10 ticks)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Delay Offset from Trigger:</span>
                  <span className="text-cyan-400 font-bold">{delayOffsetNs} ns</span>
                </div>
                <input
                  type="range"
                  min="20.0"
                  max="300.0"
                  step="10.0"
                  value={delayOffsetNs}
                  onChange={(e) => setDelayOffsetNs(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>20 ns</span>
                  <span>300 ns</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Pulse Repeat Count</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={repeatCount}
                  onChange={(e) => setRepeatCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 outline-none"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Hardware GPIO:</span>
                  <span className="text-amber-400">GPIO 21 (EMFI Glitch Out)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Peripheral:</span>
                  <span className="text-slate-300">ESP32 RMT (80MHz APB)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tick Unit:</span>
                  <span className="text-slate-300">12.5 ns / tick</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleTriggerGlitch}
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                  <span>Trigger Single Glitch Pulse</span>
                </button>

                <button
                  onClick={handleRunGlitchCampaign}
                  disabled={loading}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-300 border border-slate-700 text-xs font-mono font-medium rounded-lg flex items-center justify-center space-x-2 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Execute 2D Sweep Campaign</span>
                </button>
              </div>
            </div>

            {/* Glitch Results & Sweep Matrix */}
            <div className="lg:col-span-2 space-y-4">
              {/* Single Glitch HUD */}
              {glitchResult && (
                <div className={`p-4 rounded-xl border ${
                  glitchResult.fault_injected
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-mono font-bold flex items-center gap-1.5">
                      {glitchResult.fault_injected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-rose-400" />
                          FAULT INJECTED: SUCCESS
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-slate-400" />
                          NOMINAL EXECUTION (NO FAULT)
                        </>
                      )}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{glitchResult.timing_resolution}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-slate-500">Calibrated Width: </span>
                      <span className="text-white font-bold">{glitchResult.calibrated_width_ns} ns</span>
                    </div>
                    <div>
                      <span className="text-slate-500">RMT Ticks: </span>
                      <span className="text-amber-400 font-bold">{glitchResult.quantized_ticks}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Target Response: </span>
                      <span className="text-cyan-300">{glitchResult.target_response}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Rail Voltage: </span>
                      <span>{glitchResult.glitch_voltage_level_v} V</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sweep Campaign Heatmap */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">
                      2D Parameter Sweep Vulnerability Matrix
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Pulse Width (12.5ns - 62.5ns) vs Offset Delay (80ns - 180ns)
                    </p>
                  </div>
                  {campaignResult && (
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Vulnerability: {campaignResult.vulnerability_rate_pct}%
                    </span>
                  )}
                </div>

                {campaignResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2">
                      {campaignResult.sweep_sample.map((point, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg border text-center font-mono text-[10px] transition-all ${
                            point.fault_injected
                              ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-md shadow-rose-500/20'
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="font-bold">{point.width_ns}ns @ {point.delay_ns}ns</div>
                          <div className="mt-1 text-[9px] uppercase tracking-wider">
                            {point.response}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Sweet Spot Recommendation:</span>
                      <span className="text-cyan-300 font-bold">{campaignResult.sweet_spot_recommendation}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <Crosshair className="w-8 h-8 text-slate-600" />
                    <p className="text-xs font-mono">Click &quot;Execute 2D Sweep Campaign&quot; to map fault boundaries</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: zk-SNARK Proof-of-Analysis */}
      {activeTab === 'zk' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prover Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-300">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    zk-SNARK Prover (Circom / Plonk BN254)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Prove analysis correctness without disclosing confidential witness
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">
                  Private Witness (Key / Exploit / Plaintext) — NEVER EXPOSED
                </label>
                <input
                  type="text"
                  value={privateWitness}
                  onChange={(e) => setPrivateWitness(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Public Tag / Statement Scope</label>
                <input
                  type="text"
                  value={publicTag}
                  onChange={(e) => setPublicTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 outline-none"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Proving System:</span>
                  <span className="text-indigo-400 font-bold">PLONK_KZG</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Elliptic Curve:</span>
                  <span className="text-slate-200">BN254 (alt_bn128)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Circuit:</span>
                  <span className="text-cyan-400">SHA256_PREIMAGE_CONSTRAINTS</span>
                </div>
              </div>

              <button
                onClick={handleGenerateZKProof}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Synthesize zk-SNARK Proof</span>
              </button>

              {/* Synthesized Proof Vector */}
              {zkProof && (
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 text-xs font-mono space-y-2">
                  <div className="flex justify-between items-center text-indigo-300 font-bold border-b border-slate-800 pb-1.5">
                    <span>Synthesized Proof Vector</span>
                    <span className="text-[10px] text-slate-500">{zkProof.circuit}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Public SHA256: </span>
                    <span className="text-cyan-300 break-all">
                      {zkProof.public_inputs.public_statement_sha256}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">π_a[0]: </span>
                    <span className="text-slate-300 break-all">{zkProof.proof_vector.pi_a[0]}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Verifying Key Hash: </span>
                    <span className="text-slate-400 break-all">{zkProof.verifying_key_hash}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Verifier Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                  <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">
                      On-Grid Cryptographic Verifier
                    </h3>
                    <p className="text-xs text-slate-400">
                      Zero-knowledge pairing verification without secret disclosure
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                  <p className="text-slate-400">
                    The verifier computes pairing checks over BN254:
                  </p>
                  <p className="text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800 text-[11px]">
                    e(π_a, π_b) · e(-α, β) · e(-x, γ) = 1
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    If valid, the verifier confirms that the operator possesses a secret preimage
                    matching the public SHA-256 statement, without learning any bit of the secret.
                  </p>
                </div>

                {verifyResult && (
                  <div className={`p-4 rounded-xl border ${
                    verifyResult.is_valid
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                  } space-y-2 text-xs font-mono`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {verifyResult.status}
                      </span>
                      <span>Gas: {verifyResult.gas_estimate?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Verified Statement: </span>
                      <span className="text-slate-200 break-all">{verifyResult.verified_statement}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleVerifyZKProof}
                disabled={loading || !zkProof}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-mono font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all mt-4"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Verify zk-SNARK Proof on Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
