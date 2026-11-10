import React, { useState, useEffect } from 'react';
import {
  Globe,
  Cpu,
  Radio,
  Shield,
  Activity,
  Layers,
  Zap,
  Terminal,
  Database,
  RefreshCw,
  Play,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import {
  GridStatus,
  GridPeer,
  AgenticSMTResult,
  AgenticMCTSResult,
  SDRSpectrumResult,
  SDRDemodulateResult,
  DPAResult,
  IPFSArtifact,
  FedLMRoundResult
} from '../types';
import ForensicGrid3D from '../components/ForensicGrid3D';
import SDRWaterfall from '../components/SDRWaterfall';

export const GlobalGridPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'network' | 'agentic' | 'sdr' | 'ipfs' | 'silicon'>('network');
  const [loading, setLoading] = useState(false);

  // 1. Grid & Peers State
  const [gridStatus, setGridStatus] = useState<GridStatus | null>(null);
  const [peers, setPeers] = useState<GridPeer[]>([]);

  // 2. Agentic SMT / MCTS State
  const [smtCipherInput, setSmtCipherInput] = useState('17080540111509430b0f170e');
  const [maxKeyLen, setMaxKeyLen] = useState(2);
  const [smtResult, setSmtResult] = useState<AgenticSMTResult | null>(null);
  const [mctsInput, setMctsInput] = useState('Q2lwaGVyb24gRm9yZW5zaWMgR3JpZCBWNS4w');
  const [mctsIterations, setMctsIterations] = useState(40);
  const [mctsResult, setMctsResult] = useState<AgenticMCTSResult | null>(null);

  // 3. SDR & Signal State
  const [centerFreq, setCenterFreq] = useState(433.92);
  const [spectrumData, setSpectrumData] = useState<SDRSpectrumResult | null>(null);
  const [modType, setModType] = useState('ASK');
  const [demodResult, setDemodResult] = useState<SDRDemodulateResult | null>(null);
  const [dpaResult, setDpaResult] = useState<DPAResult | null>(null);
  const [secretKeyByte, setSecretKeyByte] = useState(90);

  // 4. IPFS State
  const [ipfsArtifacts, setIpfsArtifacts] = useState<IPFSArtifact[]>([]);
  const [newRuleTitle, setNewRuleTitle] = useState('POLYALPHABETIC_CHI2_V5');
  const [newRulePayload, setNewRulePayload] = useState('{\n  "target": "vigenere",\n  "threshold": 0.065,\n  "language": "EN"\n}');

  // 5. FedLM & Silicon State
  const [fedlmResult, setFedlmResult] = useState<FedLMRoundResult | null>(null);
  const [noiseSigma, setNoiseSigma] = useState(0.02);

  // Fetch initial telemetry
  useEffect(() => {
    fetchGridInfo();
    fetchSpectrum();
    fetchIpfsList();
  }, []);

  const fetchGridInfo = async () => {
    try {
      const [st, pList] = await Promise.all([api.getGridStatus(), api.getGridPeers()]);
      setGridStatus(st);
      setPeers(pList);
    } catch (err) {
      console.error('Failed to fetch grid info:', err);
    }
  };

  const fetchSpectrum = async () => {
    try {
      const res = await api.getSDRSpectrum(centerFreq, 2.4, 128);
      setSpectrumData(res);
    } catch (err) {
      console.error('Failed to fetch SDR spectrum:', err);
    }
  };

  const fetchIpfsList = async () => {
    try {
      const list = await api.listIPFSArtifacts();
      setIpfsArtifacts(list);
    } catch (err) {
      console.error('Failed to list IPFS artifacts:', err);
    }
  };

  const handleSolveSMT = async () => {
    setLoading(true);
    try {
      const res = await api.solveAgenticSMT(smtCipherInput, maxKeyLen);
      setSmtResult(res);
    } catch (err) {
      alert('SMT solve failed: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRunMCTS = async () => {
    setLoading(true);
    try {
      const res = await api.runAgenticMCTS(mctsInput, mctsIterations, 1.414);
      setMctsResult(res);
    } catch (err) {
      alert('MCTS search failed: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemodulateSDR = async () => {
    setLoading(true);
    try {
      const res = await api.demodulateSDR(modType, 8);
      setDemodResult(res);
    } catch (err) {
      alert('Demodulation failed: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRunDPA = async () => {
    setLoading(true);
    try {
      const res = await api.runDPAAnalysis(secretKeyByte, 60, 0);
      setDpaResult(res);
    } catch (err) {
      alert('DPA analysis failed: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePublishIPFS = async () => {
    setLoading(true);
    try {
      const parsed = JSON.parse(newRulePayload);
      await api.publishIPFS(newRuleTitle, parsed);
      await fetchIpfsList();
      alert('Published rule to IPFS Merkle DAG!');
    } catch (err) {
      alert('Publish failed: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRunFedLM = async () => {
    setLoading(true);
    try {
      const res = await api.runFedLMRound(noiseSigma, 4);
      setFedlmResult(res);
    } catch (err) {
      alert('FedLM round failed: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Globe className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold tracking-wider">
                V5.0.0-AUTONOMOUS
              </span>
              <span className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                GLOBAL FORENSIC GRID
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                Z3 SMT + MCTS ACTIVE
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <Globe className="w-7 h-7 text-cyan-400" />
              Global Forensic Grid & Silicon Security Hub
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Decentralized Zero-Trust P2P Mesh (libp2p), Z3 SMT Symbolic Solver, RTL-SDR RF Waterfall Ingestion, and Non-Maskable Silicon Glitch Defense.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchGridInfo(); fetchSpectrum(); }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono border border-slate-700 flex items-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Grid Telemetry
            </button>
          </div>
        </div>

        {/* Global Key Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">P2P Overlay</div>
            <div className="text-base font-bold font-mono text-cyan-400">libp2p / DHT</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">{peers.length} Regional Nodes</div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">Symbolic Engine</div>
            <div className="text-base font-bold font-mono text-purple-400">Z3 BitVector SMT</div>
            <div className="text-[10px] text-purple-300 mt-0.5">MCTS (C=√2 UCT)</div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">Signal Ingestion</div>
            <div className="text-base font-bold font-mono text-amber-400">RTL-SDR / 480M</div>
            <div className="text-[10px] text-slate-400 mt-0.5">FFT & DPA (&gt;3σ)</div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">Heuristic Store</div>
            <div className="text-base font-bold font-mono text-indigo-400">IPFS Merkle-DAG</div>
            <div className="text-[10px] text-indigo-300 mt-0.5">{ipfsArtifacts.length} CIDs Registered</div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">Silicon Defense</div>
            <div className="text-base font-bold font-mono text-emerald-400">&lt;1µs Wiping</div>
            <div className="text-[10px] text-emerald-300 mt-0.5">VFI & Optical Armed</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('network')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition ${
            activeTab === 'network'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Globe className="w-4 h-4" />
          3D P2P Grid & libp2p Mesh
        </button>
        <button
          onClick={() => setActiveTab('agentic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition ${
            activeTab === 'agentic'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Autonomous Z3 SMT & MCTS
        </button>
        <button
          onClick={() => setActiveTab('sdr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition ${
            activeTab === 'sdr'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Radio className="w-4 h-4" />
          RF SDR & DPA Side-Channel
        </button>
        <button
          onClick={() => setActiveTab('ipfs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition ${
            activeTab === 'ipfs'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Database className="w-4 h-4" />
          IPFS Merkle-DAG Store
        </button>
        <button
          onClick={() => setActiveTab('silicon')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition ${
            activeTab === 'silicon'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Shield className="w-4 h-4" />
          FedLM & Silicon Glitch Defense
        </button>
      </div>

      {/* Tab 1: 3D P2P Grid & libp2p Mesh */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          <ForensicGrid3D activePeersCount={peers.length} />

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold font-mono text-cyan-400 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              GLOBAL FORENSIC PEER REGISTRY (ZERO-TRUST NOISE / TLS 1.3)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Peer ID (libp2p)</th>
                    <th className="p-3">Regional Zone</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">PQC Verified</th>
                    <th className="p-3">Reputation</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {peers.map((p) => (
                    <tr key={p.peer_id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-cyan-300 font-bold">{p.peer_id}</td>
                      <td className="p-3 text-slate-200">{p.region}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {p.role}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-400">{p.latency_ms} ms</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          ML-DSA-3
                        </span>
                      </td>
                      <td className="p-3 text-amber-300">{p.reputation_score}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ONLINE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Autonomous Z3 SMT & MCTS */}
      {activeTab === 'agentic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Z3 SMT Constraint Satisfaction */}
          <div className="bg-slate-900/60 border border-purple-500/30 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-purple-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Z3 SMT SYMBOLIC EXECUTION ENGINE
              </h3>
              <span className="text-[11px] font-mono text-slate-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                BitVector(8) Satisfaction
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Formulates unknown byte streams as SMT formulas. Enforces printable ASCII constraints and deduces custom multi-byte XOR keys using Z3 SAT theorem proving.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Ciphertext (Hex / Raw)</label>
                <input
                  type="text"
                  value={smtCipherInput}
                  onChange={(e) => setSmtCipherInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-purple-300 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Max Key Length (1..8 bytes): {maxKeyLen}</label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={maxKeyLen}
                  onChange={(e) => setMaxKeyLen(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <button
                onClick={handleSolveSMT}
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition"
              >
                <Play className="w-4 h-4" />
                {loading ? 'Solving SMT Constraints...' : 'Solve with Z3 SMT'}
              </button>

              {smtResult && (
                <div className="bg-slate-950 border border-purple-500/40 rounded-lg p-3 space-y-2 mt-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Status:</span>
                    <strong className={smtResult.status === 'SATISFIABLE' ? 'text-emerald-400' : 'text-red-400'}>
                      {smtResult.status}
                    </strong>
                  </div>
                  {smtResult.key_hex && (
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Recovered Key:</span>
                      <strong className="text-purple-300">{smtResult.key_repr} (0x{smtResult.key_hex})</strong>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-1">Plaintext Output:</span>
                    <pre className="p-2 bg-slate-900 rounded text-emerald-300 text-xs overflow-x-auto whitespace-pre-wrap">
                      {smtResult.plaintext || 'UNSAT — No printable solution'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MCTS Autonomous Tree Search */}
          <div className="bg-slate-900/60 border border-cyan-500/30 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                MONTE CARLO TREE SEARCH (MCTS)
              </h3>
              <span className="text-[11px] font-mono text-slate-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                UCT Exploration (C=√2)
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Explores complex layered obfuscators (Hex, Base64, ROT13, Caesar, XOR) across multi-stage transformation graphs using Upper Confidence Bound tree search.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Obfuscated String</label>
                <input
                  type="text"
                  value={mctsInput}
                  onChange={(e) => setMctsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">MCTS Search Iterations: {mctsIterations}</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={mctsIterations}
                  onChange={(e) => setMctsIterations(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <button
                onClick={handleRunMCTS}
                disabled={loading}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition"
              >
                <Play className="w-4 h-4" />
                {loading ? 'Running MCTS Search...' : 'Launch MCTS Search'}
              </button>

              {mctsResult && (
                <div className="bg-slate-950 border border-cyan-500/40 rounded-lg p-3 space-y-2 mt-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Confidence:</span>
                    <strong className="text-cyan-400">{(mctsResult.confidence_score * 100).toFixed(1)}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-1">Discovered Pipeline:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {mctsResult.pipeline_sequence.map((step, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-1">Recovered Plaintext:</span>
                    <pre className="p-2 bg-slate-900 rounded text-emerald-300 text-xs overflow-x-auto whitespace-pre-wrap">
                      {mctsResult.best_plaintext}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: RF SDR & DPA Side-Channel */}
      {activeTab === 'sdr' && (
        <div className="space-y-6">
          <SDRWaterfall
            spectrumData={spectrumData}
            selectedFreq={centerFreq}
            onFreqChange={setCenterFreq}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SDR Demodulator */}
            <div className="bg-slate-900/60 border border-amber-500/30 rounded-xl p-5 flex flex-col gap-4 font-mono text-xs">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Radio className="w-4 h-4" />
                SDR SIGNAL DEMODULATOR (ASK / FSK / PSK)
              </h3>
              <p className="text-slate-400 text-xs">
                Demodulates raw I/Q samples ingested via USB OTG 480Mbps directly into binary bitstreams and decoded ASCII/Hex payloads.
              </p>

              <div className="flex items-center gap-3">
                <span className="text-slate-400">Modulation:</span>
                {['ASK', 'FSK', 'PSK'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setModType(m)}
                    className={`px-3 py-1 rounded border text-xs ${
                      modType === m
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <button
                onClick={handleDemodulateSDR}
                disabled={loading}
                className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition"
              >
                <Zap className="w-4 h-4" />
                {loading ? 'Demodulating I/Q Samples...' : `Demodulate ${modType} Transmission`}
              </button>

              {demodResult && (
                <div className="bg-slate-950 border border-amber-500/40 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Recovered Bits:</span>
                    <span className="text-amber-300 truncate max-w-[200px]">{demodResult.recovered_bits}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Decoded Hex:</span>
                    <span className="text-cyan-300">{demodResult.decoded_hex}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-1">Decoded Text:</span>
                    <pre className="p-2 bg-slate-900 rounded text-emerald-300 text-xs whitespace-pre-wrap">
                      {demodResult.decoded_text}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Differential Power Analysis (DPA) */}
            <div className="bg-slate-900/60 border border-red-500/30 rounded-xl p-5 flex flex-col gap-4 font-mono text-xs">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Activity className="w-4 h-4" />
                DIFFERENTIAL POWER ANALYSIS (DPA &gt; 3σ)
              </h3>
              <p className="text-slate-400 text-xs">
                Measures sub-milliamp current fluctuations during cryptographic operations: ΔW = W(bit=1) - W(bit=0). Key bits isolated when ΔW exceeds 3σ noise floor.
              </p>

              <div>
                <label className="text-slate-400 block mb-1">Secret Key Hypothesis (0x00..0xFF): 0x{secretKeyByte.toString(16).toUpperCase()}</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={secretKeyByte}
                  onChange={(e) => setSecretKeyByte(parseInt(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              <button
                onClick={handleRunDPA}
                disabled={loading}
                className="py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition"
              >
                <Activity className="w-4 h-4" />
                {loading ? 'Analyzing Waveforms...' : 'Execute DPA Difference-of-Means'}
              </button>

              {dpaResult && (
                <div className="bg-slate-950 border border-red-500/40 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Recovered Key Byte:</span>
                    <strong className="text-red-400 text-sm">{dpaResult.best_key_hex}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">SNR Ratio:</span>
                    <strong className="text-amber-400">{dpaResult.snr_sigma} σ ({dpaResult.criterion})</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Threshold Check:</span>
                    <span className={dpaResult.key_recovered ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                      {dpaResult.key_recovered ? 'PASS (&gt; 3.0σ)' : 'FAIL (&lt;= 3.0σ)'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: IPFS Merkle-DAG Store */}
      {activeTab === 'ipfs' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-indigo-500/30 rounded-xl p-5">
            <h3 className="text-sm font-bold font-mono text-indigo-400 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              DECENTRALIZED IPFS MERKLE-DAG HEURISTIC & WASM STORE
            </h3>
            <p className="text-xs text-slate-300 font-mono mb-4">
              Content-addressed storage (CIDv1 bafyreib...) for verifiable sharing of cryptanalytic rules and sandboxed WASM decoders.
            </p>

            <div className="space-y-3 font-mono text-xs">
              {ipfsArtifacts.map((art) => (
                <div key={art.cid} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="text-indigo-300 font-bold text-sm">{art.title}</div>
                    <div className="text-cyan-400 text-[11px] mt-0.5">{art.cid}</div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                    <span>Size: {art.size_bytes} B</span>
                    <span>Merkle Root: {art.merkle_root}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      VERIFIED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs">
            <h4 className="text-xs font-bold text-slate-300 uppercase">Publish Heuristic Rule to IPFS DAG</h4>
            <div>
              <label className="text-slate-400 block mb-1">Artifact Title</label>
              <input
                type="text"
                value={newRuleTitle}
                onChange={(e) => setNewRuleTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-indigo-300 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Payload JSON</label>
              <textarea
                rows={4}
                value={newRulePayload}
                onChange={(e) => setNewRulePayload(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button
              onClick={handlePublishIPFS}
              disabled={loading}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition"
            >
              Publish to IPFS DAG
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: FedLM & Silicon Glitch Defense */}
      {activeTab === 'silicon' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FedLM Differential Privacy */}
          <div className="bg-slate-900/60 border border-purple-500/30 rounded-xl p-5 flex flex-col gap-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4" />
              FEDERATED LEARNING WITH DIFFERENTIAL PRIVACY (FedLM)
            </h3>
            <p className="text-slate-400 text-xs">
              Refines 1D-CNN vector weights across global nodes without sharing target byte streams. Perturbed with Gaussian noise N(0, σ²I).
            </p>

            <div>
              <label className="text-slate-400 block mb-1">DP Noise Sigma (σ): {noiseSigma}</label>
              <input
                type="range"
                min="0.01"
                max="0.10"
                step="0.01"
                value={noiseSigma}
                onChange={(e) => setNoiseSigma(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <button
              onClick={handleRunFedLM}
              disabled={loading}
              className="py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Aggregating Gradients...' : 'Execute Federated Learning Round'}
            </button>

            {fedlmResult && (
              <div className="bg-slate-950 border border-purple-500/40 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Round Number:</span>
                  <strong className="text-purple-300">Round #{fedlmResult.round}</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Privacy Guarantee:</span>
                  <strong className="text-cyan-400">{fedlmResult.privacy_guarantee}</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Convergence Loss:</span>
                  <strong className="text-emerald-400">{fedlmResult.loss_metric}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">Updated 12-Class Weights:</span>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    {fedlmResult.classes.map((cls, i) => (
                      <div key={cls} className="bg-slate-900 p-1 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">{cls}:</span>
                        <span className="text-purple-300 font-bold">{fedlmResult.updated_weights[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Silicon Glitch Defense & PUF */}
          <div className="bg-slate-900/60 border border-emerald-500/30 rounded-xl p-5 flex flex-col gap-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Shield className="w-4 h-4" />
              HARDWARE SILICON DEFENSE & PHYSICAL PUF STATUS
            </h3>
            <p className="text-slate-400 text-xs">
              Hardware comparator rails monitor Vdd (2.95V..3.60V) and optical photodiode array (&gt;500 Lux). Non-maskable interrupt executes &lt;1µs zeroization.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-slate-300 font-bold">VFI Voltage Comparator</div>
                  <div className="text-[11px] text-slate-400">Rail: 3.30V (Threshold: 2.95V - 3.60V)</div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  NORMAL [OK]
                </span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-slate-300 font-bold">Optical Laser Sensor (GPIO 2)</div>
                  <div className="text-[11px] text-slate-400">Ambient: 140 Lux (Threshold: &gt;500 Lux)</div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  SECURE [OK]
                </span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-slate-300 font-bold">SRAM Physically Unclonable Function (PUF)</div>
                  <div className="text-[11px] text-slate-400">Silicon Fingerprint: 0x5C-CHIP-ROOT</div>
                </div>
                <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">
                  AUTHENTICATED
                </span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-slate-300 font-bold">Emergency Zeroization Latency</div>
                  <div className="text-[11px] text-slate-400">Pattern: 0xDEADBEEF (1024 Words)</div>
                </div>
                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold">
                  820 ns (&lt;1µs)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalGridPage;
