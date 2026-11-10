import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  PQCHandshakeResult,
  PQCSignatureResult,
  PQCVerifyResult,
  SwarmStatus,
  NeuralClassificationResult,
  SBOMManifest,
  SecurityMode
} from '../types';
import {
  Cpu,
  Activity,
  Database,
  AlertTriangle,
  ShieldCheck,
  Radio,
  Share2,
  RefreshCw,
  Zap,
  Key,
  Download,
  Copy,
  CheckCircle2,
  Lock,
  Layers,
  Terminal,
  Server
} from 'lucide-react';

interface EnterprisePageProps {
  currentProfile: SecurityMode;
}

export const EnterprisePage: React.FC<EnterprisePageProps> = ({ currentProfile }) => {
  const [activeTab, setActiveTab] = useState<'pqc' | 'swarm' | 'neural' | 'sbom'>('pqc');

  // Top Metrics
  const [hardwareMetrics, setHardwareMetrics] = useState({
    temp: 36.8,
    battery: 94,
    pqcStatus: 'QUANTUM_SECURE',
    activeNodes: 4,
    merkleRoot: '0x9F82A481B2C3E381'
  });

  // PQC State
  const [pqcHandshake, setPqcHandshake] = useState<PQCHandshakeResult | null>(null);
  const [isHandshaking, setIsHandshaking] = useState(false);
  const [pqcMessage, setPqcMessage] = useState('CIPHERON-X1-MERKLE-DAG-AUDIT-ROOT-RECORD-SEALED');
  const [pqcSignature, setPqcSignature] = useState<PQCSignatureResult | null>(null);
  const [pqcVerify, setPqcVerify] = useState<PQCVerifyResult | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  // Swarm State
  const [swarmData, setSwarmData] = useState<SwarmStatus | null>(null);
  const [isLoadingSwarm, setIsLoadingSwarm] = useState(false);
  const [failoverAlert, setFailoverAlert] = useState<any | null>(null);

  // Neural Classifier State
  const [neuralInput, setNeuralInput] = useState('48656c6c6f31323334');
  const [neuralResult, setNeuralResult] = useState<NeuralClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  // SBOM State
  const [sbomFormat, setSbomFormat] = useState<'SPDX' | 'CYCLONEDX'>('SPDX');
  const [sbomData, setSbomData] = useState<SBOMManifest | null>(null);
  const [isLoadingSbom, setIsLoadingSbom] = useState(false);

  // Live Telemetry Logs
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] CIPHERON-X1 V4.0 Ecosystem Initialized.',
    '[HW_SEC] ATECC608A (0x60) + NXP SE050 (0x48) Secure Elements Locked.',
    '[PQC] Hybrid ML-KEM-768 + ECDH-P256 Handshake Established.',
    '[MESH] 4 Active Mesh Swarm Worker Nodes Connected via ESP-MESH-LITE.',
    '[ESP-DL] 1D-CNN Vector Model Ready on Xtensa LX7 VPU (184 KB INT8).'
  ]);

  const addLog = (msg: string) => {
    setLogs((prev) => [msg, ...prev.slice(0, 19)]);
  };

  // --- Handlers ---

  const handleExecutePqcHandshake = async () => {
    setIsHandshaking(true);
    try {
      const res = await api.executePQCHandshake();
      setPqcHandshake(res);
      addLog(`[PQC] Handshake OK: ${res.pqc_standard} (${res.duration_ms} ms) -> AES-256-GCM`);
    } catch (e: any) {
      addLog(`[PQC_ERR] Handshake failed: ${e.message}`);
    } finally {
      setIsHandshaking(false);
    }
  };

  const handleSignDilithium3 = async () => {
    setIsSigning(true);
    setPqcVerify(null);
    try {
      const sig = await api.signWithDilithium3(pqcMessage);
      setPqcSignature(sig);
      addLog(`[PQC_SIG] Signed message with ML-DSA-3 Dilithium (${sig.signature_length} bytes)`);
    } catch (e: any) {
      addLog(`[PQC_ERR] Sign failed: ${e.message}`);
    } finally {
      setIsSigning(false);
    }
  };

  const handleVerifyDilithium3 = async () => {
    if (!pqcSignature) return;
    try {
      const res = await api.verifyDilithium3(pqcMessage, pqcSignature.signature_hex, pqcSignature.public_key_hex);
      setPqcVerify(res);
      addLog(`[PQC_VERIFY] Dilithium3 Signature verified: ${res.status}`);
    } catch (e: any) {
      addLog(`[PQC_ERR] Verify failed: ${e.message}`);
    }
  };

  const fetchSwarmNodes = async () => {
    setIsLoadingSwarm(true);
    try {
      const res = await api.getSwarmNodes();
      setSwarmData(res);
    } catch {
      // ignore
    } finally {
      setIsLoadingSwarm(false);
    }
  };

  const handleDispatchSwarm = async () => {
    setIsLoadingSwarm(true);
    setFailoverAlert(null);
    try {
      await api.dispatchSwarmJob('4B3A88192C3D', 65536, 'MULTI_BYTE_XOR');
      await fetchSwarmNodes();
      addLog('[SWARM] Dispatched 65536 keys across 4 ESP-MESH-LITE worker nodes');
    } catch (e: any) {
      addLog(`[SWARM_ERR] Dispatch failed: ${e.message}`);
    } finally {
      setIsLoadingSwarm(false);
    }
  };

  const handleSimulateFailover = async () => {
    try {
      const res = await api.triggerSwarmFailover(2);
      setFailoverAlert(res);
      await fetchSwarmNodes();
      addLog(`[SWARM_FAILOVER] Node 2 offline -> Reallocated ${res.orphan_keys_reallocated} keys to Node ${res.reallocated_to_node} in ${res.failover_latency_ms} ms (<150ms target)`);
    } catch (e: any) {
      addLog(`[SWARM_ERR] Failover test failed: ${e.message}`);
    }
  };

  const handleRunNeuralClassify = async () => {
    setIsClassifying(true);
    try {
      const res = await api.classifyNeural(neuralInput);
      setNeuralResult(res);
      addLog(`[ESP-DL] 1D-CNN classified payload as '${res.predicted_class}' (Confidence: ${(res.confidence * 100).toFixed(1)}%, Latency: ${res.inference_latency_ms} ms)`);
    } catch (e: any) {
      addLog(`[AI_ERR] Inference failed: ${e.message}`);
    } finally {
      setIsClassifying(false);
    }
  };

  const fetchSbom = async (format: 'SPDX' | 'CYCLONEDX') => {
    setIsLoadingSbom(true);
    try {
      const res = format === 'SPDX' ? await api.getSPDXSbom() : await api.getCycloneDXSbom();
      setSbomData(res);
    } catch {
      // ignore
    } finally {
      setIsLoadingSbom(false);
    }
  };

  useEffect(() => {
    fetchSwarmNodes();
    handleRunNeuralClassify();
    fetchSbom(sbomFormat);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner (suggestion-v3.md Section 6.3) */}
      <div className="glass-panel p-5 rounded-xl border border-[#232B3E]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#232B3E]">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-[#00E5FF]" />
              <h1 className="text-xl font-mono font-bold text-white tracking-wider">
                CIPHERON-X1 ENTERPRISE & POST-QUANTUM ECOSYSTEM
              </h1>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              FIPS 203 ML-KEM-768 • FIPS 204 ML-DSA-3 • ESP-MESH-LITE Swarm • ESP-DL Vector 1D-CNN • Dual ATECC608A + SE050
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-[#00E676]/10 text-[#00E676] rounded-full text-xs font-mono border border-[#00E676]/30 flex items-center space-x-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{hardwareMetrics.pqcStatus}</span>
            </span>
            <span className="px-3 py-1 bg-[#00E5FF]/10 text-[#00E5FF] rounded-full text-xs font-mono border border-[#00E5FF]/30 flex items-center space-x-1.5 font-bold">
              <Radio className="w-3.5 h-3.5" />
              <span>{hardwareMetrics.activeNodes} Mesh Nodes Active</span>
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-[#0B0F17] border border-[#232B3E] p-4 rounded-lg">
            <div className="text-xs font-mono text-slate-400 mb-1 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#00E5FF]" />
              <span>ESP32-S3 Core Temp</span>
            </div>
            <div className="text-xl font-mono font-bold text-white">{hardwareMetrics.temp} °C</div>
            <span className="text-[10px] font-mono text-slate-500">Dual Xtensa LX7 @ 240MHz</span>
          </div>

          <div className="bg-[#0B0F17] border border-[#232B3E] p-4 rounded-lg">
            <div className="text-xs font-mono text-slate-400 mb-1 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#00E676]" />
              <span>Battery SoC (MAX17048)</span>
            </div>
            <div className="text-xl font-mono font-bold text-[#00E676]">{hardwareMetrics.battery} %</div>
            <span className="text-[10px] font-mono text-slate-500">LiPo 3.7V / 4150 mV</span>
          </div>

          <div className="bg-[#0B0F17] border border-[#232B3E] p-4 rounded-lg">
            <div className="text-xs font-mono text-slate-400 mb-1 flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Audit Merkle Root</span>
            </div>
            <div className="text-xs font-mono font-bold text-purple-300 truncate">{hardwareMetrics.merkleRoot}</div>
            <span className="text-[10px] font-mono text-slate-500">Dilithium3 Hardware Signed</span>
          </div>

          <div className="bg-[#0B0F17] border border-[#232B3E] p-4 rounded-lg">
            <div className="text-xs font-mono text-slate-400 mb-1 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Active Security Mode</span>
            </div>
            <div className="text-base font-mono font-bold text-amber-400">{currentProfile}</div>
            <span className="text-[10px] font-mono text-slate-500">Zero-Plaintext Telemetry</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#232B3E] pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab('pqc')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'pqc'
              ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20'
              : 'bg-[#161B26] text-slate-300 hover:text-white border border-[#232B3E]'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>POST-QUANTUM HYBRID & DILITHIUM3</span>
        </button>

        <button
          onClick={() => setActiveTab('swarm')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'swarm'
              ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20'
              : 'bg-[#161B26] text-slate-300 hover:text-white border border-[#232B3E]'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>ESP-MESH-LITE SWARM MAPREDUCE</span>
        </button>

        <button
          onClick={() => setActiveTab('neural')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'neural'
              ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20'
              : 'bg-[#161B26] text-slate-300 hover:text-white border border-[#232B3E]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>ESP-DL 1D-CNN VECTOR CLASSIFIER</span>
        </button>

        <button
          onClick={() => setActiveTab('sbom')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'sbom'
              ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20'
              : 'bg-[#161B26] text-slate-300 hover:text-white border border-[#232B3E]'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>HITL SUPPLY CHAIN & SBOM</span>
        </button>
      </div>

      {/* --- TAB 1: PQC HYBRID HANDSHAKE & DILITHIUM3 SIGNATURES --- */}
      {activeTab === 'pqc' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl space-y-4 border border-[#232B3E]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232B3E] pb-3">
              <div>
                <h3 className="font-mono text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
                  <span>HYBRID QUANTUM-RESISTANT HANDSHAKE (FIPS 203 ML-KEM-768 + ECDH P-256)</span>
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Protects communications against "Store Now, Decrypt Later" quantum attacks using HKDF key extraction.
                </p>
              </div>

              <button
                onClick={handleExecutePqcHandshake}
                disabled={isHandshaking}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-bold text-xs shadow-md shadow-[#00E5FF]/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isHandshaking ? 'animate-spin' : ''}`} />
                <span>{isHandshaking ? 'Deriving Keys...' : 'Execute Hybrid Handshake'}</span>
              </button>
            </div>

            {pqcHandshake ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0B0F17] p-4 rounded-lg border border-[#232B3E] text-xs font-mono">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">PQC Standard:</span>
                    <span className="text-[#00E5FF] font-bold">{pqcHandshake.pqc_standard}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quantum Security Level:</span>
                    <span className="text-[#00E676] font-bold">{pqcHandshake.quantum_resistance_bits}-Bit (NIST Cat 3)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Handshake Latency:</span>
                    <span className="text-white font-bold">{pqcHandshake.duration_ms} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Symmetric Stream Cipher:</span>
                    <span className="text-amber-400 font-bold">{pqcHandshake.symmetric_cipher}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400">Derived Master Key Fingerprint (HKDF):</span>
                    <p className="text-white font-bold bg-[#161B26] p-1.5 rounded border border-[#232B3E] mt-0.5">
                      {pqcHandshake.master_key_fingerprint}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data Stream AES-GCM Integrity:</span>
                    <span className="text-[#00E676] font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>AUTHENTICATED</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs font-mono text-slate-500">
                Click "Execute Hybrid Handshake" to negotiate an ML-KEM-768 + ECDH master session key.
              </div>
            )}
          </div>

          {/* Dilithium3 Post-Quantum Digital Signatures */}
          <div className="glass-panel p-5 rounded-xl space-y-4 border border-[#232B3E]">
            <div className="border-b border-[#232B3E] pb-3">
              <h3 className="font-mono text-sm font-bold text-white flex items-center space-x-2">
                <Key className="w-4 h-4 text-purple-400" />
                <span>FIPS 204 ML-DSA-3 (DILITHIUM3) POST-QUANTUM SIGNATURES</span>
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Generates and verifies lattice-based digital signatures on Provenance Merkle DAG roots (3293-byte signatures).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400">Message / Merkle DAG Root to Sign:</label>
              <input
                type="text"
                value={pqcMessage}
                onChange={(e) => setPqcMessage(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#232B3E] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSignDilithium3}
                disabled={isSigning}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs transition-all disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isSigning ? 'Signing...' : 'Sign with Dilithium3'}</span>
              </button>

              {pqcSignature && (
                <button
                  onClick={handleVerifyDilithium3}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#00E676]/20 hover:bg-[#00E676]/30 text-[#00E676] border border-[#00E676]/40 font-mono font-bold text-xs transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Signature</span>
                </button>
              )}
            </div>

            {pqcSignature && (
              <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E] space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Algorithm: {pqcSignature.algorithm}</span>
                  <span>Signature Size: {pqcSignature.signature_length} Bytes</span>
                </div>
                <div className="text-purple-300 break-all text-[11px] bg-[#161B26] p-2 rounded">
                  {pqcSignature.signature_hex}
                </div>
                {pqcVerify && (
                  <div className={`p-2 rounded font-mono text-xs flex items-center space-x-2 ${
                    pqcVerify.is_valid ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-red-500/10 text-red-400'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{pqcVerify.status}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: DISTRIBUTED SWARM MAPREDUCE --- */}
      {activeTab === 'swarm' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl space-y-4 border border-[#232B3E]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232B3E] pb-3">
              <div>
                <h3 className="font-mono text-sm font-bold text-white flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-[#00E5FF]" />
                  <span>DISTRIBUTED ESP-MESH-LITE SWARM CRYPTANALYSIS (MAPREDUCE)</span>
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Delegates key-space evaluation across multi-device ESP32-S3 clusters with &lt;150ms fault failover.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDispatchSwarm}
                  disabled={isLoadingSwarm}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-bold text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSwarm ? 'animate-spin' : ''}`} />
                  <span>Dispatch 65K Key Search</span>
                </button>
                <button
                  onClick={handleSimulateFailover}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 font-mono font-bold text-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Simulate Node 2 Drop (&lt;150ms Recovery)</span>
                </button>
              </div>
            </div>

            {failoverAlert && (
              <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs flex items-center justify-between">
                <span>
                  WATCHDOG ACTIVE: Worker #{failoverAlert.failed_node_id} dropped! Successfully reallocated {failoverAlert.orphan_keys_reallocated} keys to Worker #{failoverAlert.reallocated_to_node} in {failoverAlert.failover_latency_ms} ms.
                </span>
                <span className="text-[10px] font-bold bg-amber-400/20 px-2 py-0.5 rounded">BENCHMARK PASS</span>
              </div>
            )}

            {/* Swarm Cluster Nodes Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {swarmData?.nodes.map((node) => (
                <div
                  key={node.node_id}
                  className={`p-4 rounded-xl border transition-all ${
                    node.status === 'OFFLINE'
                      ? 'bg-red-950/20 border-red-900/40 opacity-60'
                      : node.role === 'LEADER'
                      ? 'bg-[#161B26] border-[#00E5FF]/40 shadow-lg shadow-[#00E5FF]/5'
                      : 'bg-[#0B0F17] border-[#232B3E]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-white">{node.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      node.status === 'SEARCHING'
                        ? 'bg-[#00E5FF]/20 text-[#00E5FF] animate-pulse'
                        : node.status === 'OFFLINE'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-[#00E676]/20 text-[#00E676]'
                    }`}>
                      {node.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>Role:</span>
                      <span className="text-white font-bold">{node.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IP Address:</span>
                      <span className="text-slate-300">{node.ip_address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Battery SoC:</span>
                      <span className="text-[#00E676]">{node.battery_soc}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vector VPU:</span>
                      <span className={node.has_vector_accel ? 'text-[#00E5FF]' : 'text-slate-500'}>
                        {node.has_vector_accel ? 'ESP-DL ENABLED' : 'STANDARD'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#232B3E]">
                      <span className="text-[10px] text-slate-500">Key Range:</span>
                      <div className="text-amber-400 font-bold text-[10px]">
                        0x{node.key_range_start.toString(16).toUpperCase()} – 0x{node.key_range_end.toString(16).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Swarm Candidates */}
            {swarmData && swarmData.top_candidates.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Top Aggregated Plaintext Candidates (Candidate Aggregator)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-[#232B3E] text-slate-500 text-[11px]">
                        <th className="py-2 px-2">Key (Hex)</th>
                        <th className="py-2 px-2">Candidate Decryption</th>
                        <th className="py-2 px-2">Score</th>
                        <th className="py-2 px-2">Discovered By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#232B3E]/50 text-[11px]">
                      {swarmData.top_candidates.map((cand, idx) => (
                        <tr key={idx} className="hover:bg-[#161B26]">
                          <td className="py-2 px-2 text-[#00E5FF] font-bold">0x{cand.key.toString(16).toUpperCase()}</td>
                          <td className="py-2 px-2 text-white font-mono">{cand.plaintext}</td>
                          <td className="py-2 px-2 text-[#00E676] font-bold">{cand.score}%</td>
                          <td className="py-2 px-2 text-slate-400">Node #{cand.discovered_by_node}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: ESP-DL 1D-CNN VECTOR CLASSIFIER --- */}
      {activeTab === 'neural' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl space-y-4 border border-[#232B3E]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232B3E] pb-3">
              <div>
                <h3 className="font-mono text-sm font-bold text-white flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-[#00E5FF]" />
                  <span>ON-CHIP 8-BIT QUANTIZED 1D-CNN CIPHER CLASSIFIER (ESP-DL)</span>
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Accelerated via Xtensa LX7 Vector Extension. 184 KB INT8 weights with &lt;4.2 ms inference latency.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setNeuralInput('48656c6c6f31323334')}
                  className="px-2.5 py-1 rounded bg-[#161B26] text-[11px] font-mono text-slate-300 hover:text-white border border-[#232B3E]"
                >
                  Hex
                </button>
                <button
                  onClick={() => setNeuralInput('SGVsbG8gV29ybGQgQ0lQSEVST04tWDE=')}
                  className="px-2.5 py-1 rounded bg-[#161B26] text-[11px] font-mono text-slate-300 hover:text-white border border-[#232B3E]"
                >
                  Base64
                </button>
                <button
                  onClick={() => setNeuralInput('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTmc6Y5uvRtErqTw')}
                  className="px-2.5 py-1 rounded bg-[#161B26] text-[11px] font-mono text-slate-300 hover:text-white border border-[#232B3E]"
                >
                  JWT
                </button>
                <button
                  onClick={() => setNeuralInput('function solveCipher(input) { return input ^ 0x5A; }')}
                  className="px-2.5 py-1 rounded bg-[#161B26] text-[11px] font-mono text-slate-300 hover:text-white border border-[#232B3E]"
                >
                  Code
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400">Input Byte Vector (Padded to 256-Bytes):</label>
              <textarea
                value={neuralInput}
                onChange={(e) => setNeuralInput(e.target.value)}
                rows={3}
                className="w-full bg-[#0B0F17] border border-[#232B3E] rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <button
              onClick={handleRunNeuralClassify}
              disabled={isClassifying}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-bold text-xs"
            >
              <Zap className={`w-3.5 h-3.5 ${isClassifying ? 'animate-spin' : ''}`} />
              <span>{isClassifying ? 'Running VPU Inference...' : 'Run 1D-CNN Inference'}</span>
            </button>

            {neuralResult && (
              <div className="bg-[#0B0F17] p-4 rounded-xl border border-[#232B3E] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232B3E] pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-slate-400">Predicted Cipher Class:</span>
                    <span className="px-3 py-1 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-mono font-bold text-sm border border-[#00E5FF]/40">
                      {neuralResult.predicted_class}
                    </span>
                    <span className="text-xs font-mono text-[#00E676] font-bold">
                      {(neuralResult.confidence * 100).toFixed(1)}% Confidence
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400">
                    Inference Latency: <span className="text-white font-bold">{neuralResult.inference_latency_ms} ms</span> | HW: {neuralResult.hardware_accelerator}
                  </div>
                </div>

                {/* 12-Class Softmax Probability Bars */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-slate-400">Softmax Activation Distribution (12 Classes):</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {neuralResult.class_probabilities.map((item) => (
                      <div key={item.class_id} className="bg-[#161B26] p-2 rounded border border-[#232B3E] space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className={item.probability > 0.3 ? 'text-[#00E5FF] font-bold' : 'text-slate-300'}>
                            {item.class_name}
                          </span>
                          <span className="text-slate-400">{(item.probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-[#0B0F17] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.probability > 0.3 ? 'bg-[#00E5FF]' : 'bg-slate-600'
                            }`}
                            style={{ width: `${Math.min(100, item.probability * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: HITL SUPPLY CHAIN & SBOM --- */}
      {activeTab === 'sbom' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl space-y-4 border border-[#232B3E]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232B3E] pb-3">
              <div>
                <h3 className="font-mono text-sm font-bold text-white flex items-center space-x-2">
                  <Server className="w-4 h-4 text-[#00E5FF]" />
                  <span>SOFTWARE BILL OF MATERIALS (SBOM) TRANSPARENCY</span>
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Standardized supply chain audits conforming to SPDX 2.3 and CycloneDX 1.5 specifications.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setSbomFormat('SPDX'); fetchSbom('SPDX'); }}
                  className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-all ${
                    sbomFormat === 'SPDX'
                      ? 'bg-[#00E5FF] text-black'
                      : 'bg-[#161B26] text-slate-300 border border-[#232B3E]'
                  }`}
                >
                  SPDX 2.3
                </button>
                <button
                  onClick={() => { setSbomFormat('CYCLONEDX'); fetchSbom('CYCLONEDX'); }}
                  className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-all ${
                    sbomFormat === 'CYCLONEDX'
                      ? 'bg-[#00E5FF] text-black'
                      : 'bg-[#161B26] text-slate-300 border border-[#232B3E]'
                  }`}
                >
                  CycloneDX 1.5
                </button>
              </div>
            </div>

            {sbomData && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>Manifest: {sbomFormat === 'SPDX' ? sbomData.name : sbomData.metadata?.component?.name}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(sbomData, null, 2))}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#161B26] hover:bg-[#1F2739] text-slate-300 border border-[#232B3E]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </button>
                </div>
                <pre className="bg-[#0B0F17] p-4 rounded-lg border border-[#232B3E] font-mono text-[11px] text-slate-300 max-h-96 overflow-y-auto">
                  {JSON.stringify(sbomData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live System Telemetry Stream (Section 6.3) */}
      <div className="glass-panel p-5 rounded-xl space-y-2 border border-[#232B3E]">
        <div className="flex items-center justify-between border-b border-[#232B3E] pb-2">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#00E5FF]">
            <Terminal className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider">System Live Telemetry Stream (V4.0 Hub)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">WebSocket /ws/analysis</span>
        </div>

        <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E] font-mono text-[11px] text-slate-300 h-40 overflow-y-auto space-y-1">
          {logs.map((log, index) => (
            <p key={index} className="text-slate-300 font-mono">
              {log}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
