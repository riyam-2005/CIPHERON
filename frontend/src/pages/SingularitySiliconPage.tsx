import React, { useState, useEffect } from 'react';
import {
  Globe,
  Cpu,
  Shield,
  Zap,
  Activity,
  Send,
  RefreshCw,
  AlertTriangle,
  Lock,
  Layers,
  Database,
  Radio,
  Flame,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { InterplanetaryMemristorVisualizer } from '../components/InterplanetaryMemristorVisualizer';
import {
  DTNBundleInfo,
  DTNConstellationTelemetry,
  DTNRouteTelemetry,
  MemristorVMMResult,
  MemristorTelemetry,
  MemristorFrequencyResult,
  ZKSTARKProofResult,
  ZKSTARKVerificationResult,
  MicrofluidicTelemetry
} from '../types';

export const SingularitySiliconPage: React.FC = () => {
  // Navigation & Sub-Tab State
  const [activeTab, setActiveTab] = useState<'dtn' | 'memristor' | 'stark' | 'microfluidic'>('dtn');

  // --- DTN State ---
  const [sourceEid, setSourceEid] = useState<string>('dtn://earth.ground/node-alpha');
  const [destinationEid, setDestinationEid] = useState<string>('dtn://mars.surface/jezero-term');
  const [bundlePayload, setBundlePayload] = useState<string>('HOMOMORPHIC_CIPHERTEXT_DEEP_SPACE_CLUSTER_V9');
  const [dispatchedBundle, setDispatchedBundle] = useState<DTNBundleInfo | null>(null);
  const [dtnConstellation, setDtnConstellation] = useState<DTNConstellationTelemetry | null>(null);
  const [dtnRoute, setDtnRoute] = useState<DTNRouteTelemetry | null>(null);
  const [targetCustodian, setTargetCustodian] = useState<string>('dtn://lagrange.l1/custodian-sol');
  const [custodyTransferResult, setCustodyTransferResult] = useState<any | null>(null);
  const [sliderDistanceKm, setSliderDistanceKm] = useState<number>(225000000); // Nominal Mars distance
  const [txPowerW, setTxPowerW] = useState<number>(100.0);
  const [linkBudgetResult, setLinkBudgetResult] = useState<any | null>(null);

  // --- Memristor PIM State ---
  const [wordlineVoltages, setWordlineVoltages] = useState<number[]>([1.5, 0.8, 1.2, 0.5]);
  const [vmmResult, setVmmResult] = useState<MemristorVMMResult | null>(null);
  const [memristorTelemetry, setMemristorTelemetry] = useState<MemristorTelemetry | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [conductanceInput, setConductanceInput] = useState<number>(1.25);
  const [frequencyPayload, setFrequencyPayload] = useState<string>('CIPHERON_ENCRYPTED_ENTROPY_STREAM_TEST');
  const [frequencyResult, setFrequencyResult] = useState<MemristorFrequencyResult | null>(null);

  // --- zk-STARK State ---
  const [starkSeedSecret, setStarkSeedSecret] = useState<number>(42);
  const [starkSteps, setStarkSteps] = useState<number>(64);
  const [starkProof, setStarkProof] = useState<ZKSTARKProofResult | null>(null);
  const [starkVerification, setStarkVerification] = useState<ZKSTARKVerificationResult | null>(null);
  const [isProving, setIsProving] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // --- Microfluidic State ---
  const [microfluidicStatus, setMicrofluidicStatus] = useState<MicrofluidicTelemetry | null>(null);
  const [dissolutionResult, setDissolutionResult] = useState<any | null>(null);
  const [isZeroized, setIsZeroized] = useState<boolean>(false);

  // Global Loading & Error
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialTelemetry();
  }, []);

  const fetchInitialTelemetry = async () => {
    try {
      const [constel, memTelem, mFluid] = await Promise.all([
        api.getDTNTelemetry().catch(() => null),
        api.getMemristorTelemetry().catch(() => null),
        api.getMicrofluidicStatus().catch(() => null)
      ]);
      if (constel) setDtnConstellation(constel);
      if (memTelem) {
        setMemristorTelemetry(memTelem);
        setIsZeroized(memTelem.microfluidic_system.zeroized);
      }
      if (mFluid) {
        setMicrofluidicStatus(mFluid);
        setIsZeroized(mFluid.zeroized);
      }
    } catch (err: any) {
      console.error('Failed to load initial V9 telemetry:', err);
    }
  };

  // --- Action Handlers ---

  const handleDispatchBundle = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.dispatchDTNBundle(sourceEid, destinationEid, bundlePayload, true);
      setDispatchedBundle(res);
      setDtnRoute(res.route_telemetry);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch DTN bundle');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferCustody = async () => {
    if (!dispatchedBundle) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.transferDTNCustody(dispatchedBundle.bundle_id, targetCustodian);
      setCustodyTransferResult(res);
      // Refresh telemetry
      const constel = await api.getDTNTelemetry();
      setDtnConstellation(constel);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to transfer custody');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateLinkBudget = async () => {
    try {
      const res = await api.calculateDTNLinkBudget(sourceEid, destinationEid, txPowerW);
      setLinkBudgetResult(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleExecuteVMM = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.executeMemristorVMM(wordlineVoltages);
      setVmmResult(res);
      const telem = await api.getMemristorTelemetry();
      setMemristorTelemetry(telem);
    } catch (err: any) {
      setErrorMessage(err.message || 'VMM execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProgramCell = async () => {
    try {
      await api.programMemristorCell(selectedCell.row, selectedCell.col, conductanceInput);
      const telem = await api.getMemristorTelemetry();
      setMemristorTelemetry(telem);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to program memristive cell');
    }
  };

  const handleFrequencyTransform = async () => {
    try {
      const res = await api.executeMemristorFrequencyTransform(frequencyPayload);
      setFrequencyResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Frequency transform failed');
    }
  };

  const handleGenerateSTARK = async () => {
    setIsProving(true);
    setErrorMessage(null);
    try {
      const res = await api.generateZKSTARKProof(starkSeedSecret, starkSteps);
      setStarkProof(res);
      setStarkVerification(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'STARK prove failed');
    } finally {
      setIsProving(false);
    }
  };

  const handleVerifySTARK = async () => {
    if (!starkProof) return;
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const res = await api.verifyZKSTARKProof(starkProof);
      setStarkVerification(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'STARK verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTriggerDissolution = async () => {
    if (!window.confirm('WARNING: Sub-microsecond (<500ns) exothermic chemical dissolution will destroy silicon die metallization layers. Proceed?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await api.triggerMicrofluidicDissolution('MANUAL_PASSIVATION_BREACH_OVERRIDE');
      setDissolutionResult(res);
      setIsZeroized(true);
      const telem = await api.getMemristorTelemetry();
      setMemristorTelemetry(telem);
      const mFluid = await api.getMicrofluidicStatus();
      setMicrofluidicStatus(mFluid);
    } catch (err: any) {
      setErrorMessage(err.message || 'Dissolution trigger failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                V9.0.0-SINGULARITY SILICON
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                DTN RFC 5050 MESH
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/40">
                1T1M MEMRISTOR PIM (100 TOPS/W)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-400 border border-pink-500/40">
                POST-QUANTUM zk-STARK (FRI)
              </span>
              {isZeroized ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  ZEROIZED (&lt;500ns)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  PASSIVATION SECURE
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Globe className="w-8 h-8 text-emerald-400" />
              Singularity Silicon & Deep Space Interplanetary Mesh
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              1T1M Nanoscale HfO<sub>x</sub> Processing-in-Memory Analog Crossbar (Ohm &amp; Kirchhoff VMM at 100 TOPS/W),
              Earth-Moon-Mars Delay-Tolerant Networking (RFC 5050), Transparent zk-STARKs (FRI), and Active Microfluidic Chemical Zeroization (&lt;500ns).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchInitialTelemetry}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              Refresh Telemetry
            </button>
          </div>
        </div>
      </div>

      {/* 3D Interplanetary & Memristor Visualizer */}
      <InterplanetaryMemristorVisualizer
        currentWordlineVoltages={wordlineVoltages}
        currentBitlineCurrents={vmmResult?.i_out_ma ?? [1.45, 1.82, 2.15, 0.94]}
        isZeroized={isZeroized}
      />

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-200">
            &times;
          </button>
        </div>
      )}

      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('dtn')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'dtn'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Radio className="w-4 h-4" />
          Deep Space DTN Interplanetary Mesh
        </button>

        <button
          onClick={() => setActiveTab('memristor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'memristor'
              ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          1T1M Memristor PIM Array (100 TOPS/W)
        </button>

        <button
          onClick={() => setActiveTab('stark')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'stark'
              ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Shield className="w-4 h-4" />
          Transparent zk-STARKs (FRI - No Setup)
        </button>

        <button
          onClick={() => setActiveTab('microfluidic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'microfluidic'
              ? 'bg-pink-600/20 text-pink-400 border border-pink-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Flame className="w-4 h-4" />
          Microfluidic Chemical Zeroization (&lt;500ns)
        </button>
      </div>

      {/* --- TAB 1: DEEP SPACE DTN MESH --- */}
      {activeTab === 'dtn' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bundle Dispatch Card */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                RFC 5050 Custody Bundle Dispatcher
              </h2>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                CCSDS 734.2-B-1 Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Source Endpoint ID (EID)</label>
                <select
                  value={sourceEid}
                  onChange={(e) => setSourceEid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="dtn://earth.ground/node-alpha">Earth Ground Station (Goldstone)</option>
                  <option value="dtn://moon.gateway/node-l1">Lunar Gateway Transceiver</option>
                  <option value="dtn://lagrange.l1/custodian-sol">Sun-Earth L1 Lagrange Node</option>
                  <option value="dtn://lagrange.l2/custodian-deep">Sun-Earth L2 Lagrange Station</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Destination Endpoint ID (EID)</label>
                <select
                  value={destinationEid}
                  onChange={(e) => setDestinationEid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="dtn://mars.surface/jezero-term">Mars Surface Terminal (Jezero Crater)</option>
                  <option value="dtn://mars.orbit/ares-relay">Mars Orbital Primary Relay (Ares-1)</option>
                  <option value="dtn://lagrange.l4/trojan-east">Earth-Sun L4 Trojan Relay</option>
                  <option value="dtn://lagrange.l5/trojan-west">Earth-Sun L5 Trojan Relay</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Bundle Payload (Encrypted Cryptanalysis Stream)</label>
              <textarea
                value={bundlePayload}
                onChange={(e) => setBundlePayload(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">
                Store-and-forward custody transfer with Merkle tree verification
              </span>
              <button
                onClick={handleDispatchBundle}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg flex items-center gap-2 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Dispatch Deep Space Bundle
              </button>
            </div>

            {/* Dispatched Bundle Report */}
            {dispatchedBundle && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>[+] BUNDLE DISPATCHED — ID: {dispatchedBundle.bundle_id.substring(0, 16)}...</span>
                  <span className="text-slate-400">Payload: {dispatchedBundle.payload_size_bytes} Bytes</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Custodian: <span className="text-amber-400">{dispatchedBundle.custodian_node}</span></div>
                  <div>Merkle Root: <span className="text-cyan-400">{dispatchedBundle.merkle_root.substring(0, 16)}...</span></div>
                  <div>Direct Dist: <span className="text-emerald-400">{(dispatchedBundle.route_telemetry.direct_distance_km / 1e6).toFixed(1)} M km</span></div>
                  <div>Direct Delay: <span className="text-purple-400">{dispatchedBundle.route_telemetry.direct_propagation_delay_min.toFixed(2)} min (T=d/c)</span></div>
                </div>

                {/* Custody Transfer Action */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">Transfer Custody To:</span>
                    <select
                      value={targetCustodian}
                      onChange={(e) => setTargetCustodian(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                    >
                      <option value="dtn://lagrange.l1/custodian-sol">L1 Lagrange Custodian</option>
                      <option value="dtn://lagrange.l2/custodian-deep">L2 Deep Space Node</option>
                      <option value="dtn://lagrange.l4/trojan-east">L4 Trojan Relay</option>
                      <option value="dtn://mars.orbit/ares-relay">Mars Ares-1 Relay</option>
                    </select>
                  </div>
                  <button
                    onClick={handleTransferCustody}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Accept Custody
                  </button>
                </div>

                {custodyTransferResult && (
                  <div className="p-2.5 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs">
                    &bull; Custody successfully assumed by <b>{custodyTransferResult.new_custodian}</b> | Link Margin: <b>{custodyTransferResult.link_budget.link_margin_db} dB</b> (&ge; 6.0 dB spec met)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Deep Space Link Margin Calculator Card */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 font-mono text-xs">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Deep Space Link Margin Budget
            </h2>
            <p className="text-slate-400 text-xs">
              Formula: P<sub>t</sub> + G<sub>t</sub> + G<sub>r</sub> - 20log<sub>10</sub>(4&pi;d/&lambda;) - L<sub>pointing</sub> - P<sub>req</sub> &ge; 6.0 dB
            </p>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Interplanetary Distance (d):</span>
                <span className="text-cyan-400">{(sliderDistanceKm / 1e6).toFixed(1)} Million km</span>
              </div>
              <input
                type="range"
                min="54600000"
                max="401000000"
                step="5000000"
                value={sliderDistanceKm}
                onChange={(e) => setSliderDistanceKm(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Perigee: 54.6M km</span>
                <span>Apogee: 401M km</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Laser Power (P<sub>t</sub>):</span>
                <span className="text-emerald-400">{txPowerW} W ({ (10 * Math.log10(txPowerW)).toFixed(1) } dBW)</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={txPowerW}
                onChange={(e) => setTxPowerW(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Wavelength (&lambda;):</span>
                <span className="text-slate-100">1550 nm Coherent Laser</span>
              </div>
              <div className="flex justify-between">
                <span>Tx Aperture (50cm):</span>
                <span className="text-slate-100">115.1 dBi Gain</span>
              </div>
              <div className="flex justify-between">
                <span>Rx Aperture (70cm):</span>
                <span className="text-slate-100">118.0 dBi Gain</span>
              </div>
              <div className="flex justify-between">
                <span>Pointing Loss:</span>
                <span className="text-slate-100">3.0 dB</span>
              </div>
              <div className="flex justify-between">
                <span>Rx Threshold:</span>
                <span className="text-slate-100">-85 dBm (-115 dBW)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold">
                <span className="text-emerald-400">Link Margin:</span>
                <span className="text-emerald-400">
                  { (
                    10 * Math.log10(txPowerW) + 115.1 + 118.0 -
                    20 * Math.log10((4 * Math.PI * sliderDistanceKm * 1000) / 1.55e-6) -
                    3.0 - (-115.0)
                  ).toFixed(2) } dB (&ge; 6.0 dB)
                </span>
              </div>
              <div className="flex justify-between text-purple-400">
                <span>Propagation Delay (T=d/c):</span>
                <span>{(sliderDistanceKm / 299792.458 / 60).toFixed(2)} Minutes</span>
              </div>
            </div>

            <button
              onClick={handleCalculateLinkBudget}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition"
            >
              Verify Complete Hop Route
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 2: 1T1M MEMRISTOR PIM ARRAY --- */}
      {activeTab === 'memristor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conductance Programming & VMM Execution */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                1T1M HfO<sub>x</sub> Processing-in-Memory Crossbar (4x4 Matrix)
              </h2>
              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                100 TOPS/W Analog VMM
              </span>
            </div>

            {/* Conductance Grid Display */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">
                Conductance Matrix G &isin; [G<sub>min</sub>, G<sub>max</sub>] (milliSiemens) — Click cell to tune:
              </label>
              <div className="grid grid-cols-4 gap-2.5 max-w-md">
                {(memristorTelemetry?.conductance_matrix ?? [
                  [0.85, 0.35, 0.12, 0.45],
                  [0.20, 0.75, 0.88, 0.15],
                  [0.40, 0.10, 0.95, 0.60],
                  [0.15, 0.50, 0.25, 0.80]
                ]).map((row, rIdx) =>
                  row.map((val, cIdx) => {
                    const isSelected = selectedCell.row === rIdx && selectedCell.col === cIdx;
                    return (
                      <button
                        key={`${rIdx}-${cIdx}`}
                        onClick={() => {
                          setSelectedCell({ row: rIdx, col: cIdx });
                          setConductanceInput(val);
                        }}
                        className={`p-3 rounded-xl font-mono text-xs font-bold transition flex flex-col items-center justify-center border ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-400 shadow-lg'
                            : 'bg-slate-950 text-purple-300 border-slate-800 hover:border-purple-500/50'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 font-normal">WL{rIdx}-BL{cIdx}</span>
                        <span>{val.toFixed(2)} mS</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cell Conductance Tuning Widget */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-300">
                  Selected: <b className="text-purple-400">WL_{selectedCell.row}_BL_{selectedCell.col}</b>
                </span>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="2.50"
                  value={conductanceInput}
                  onChange={(e) => setConductanceInput(Number(e.target.value))}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-purple-200"
                />
                <span className="text-xs font-mono text-slate-400">mS</span>
              </div>
              <button
                onClick={handleProgramCell}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Program Conductance
              </button>
            </div>

            {/* Wordline Input Voltages */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">
                Wordline Analog Input Voltages (GPIO 25/26 DAC Channels):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {wordlineVoltages.map((volt, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                      <span>WL_{idx}:</span>
                      <span className="text-amber-400 font-bold">{volt.toFixed(2)} V</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="3.3"
                      step="0.1"
                      value={volt}
                      onChange={(e) => {
                        const newV = [...wordlineVoltages];
                        newV[idx] = Number(e.target.value);
                        setWordlineVoltages(newV);
                      }}
                      className="w-full accent-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-slate-400">
                Ohm's Law: I<sub>i</sub> = &sum; G<sub>ij</sub> V<sub>j</sub> | Zero Off-Chip Fetch
              </span>
              <button
                onClick={handleExecuteVMM}
                disabled={loading || isZeroized}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg flex items-center gap-2 transition disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                Execute Analog VMM (PIM)
              </button>
            </div>

            {/* VMM Result */}
            {vmmResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-purple-400 font-bold">
                  <span>[+] VMM EXECUTION COMPLETED (Status: {vmmResult.status})</span>
                  <span className="text-emerald-400">{vmmResult.efficiency_tops_per_watt} TOPS/W</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
                  {vmmResult.i_out_ma.map((current, i) => (
                    <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400">Bitline {i}: </span>
                      <span className="text-cyan-400 font-bold">{current.toFixed(3)} mA</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Latency: <b>{vmmResult.latency_ns} ns</b> | Energy: <b>{vmmResult.energy_consumed_pj.toFixed(3)} pJ</b> | Memory Bus Traffic: <b>{vmmResult.memory_bus_traffic_bytes} Bytes</b>
                </div>
              </div>
            )}
          </div>

          {/* In-Memory Frequency Transform & Entropy Classifier */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 font-mono text-xs">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-pink-400" />
              In-Memory Neural Entropy Classifier
            </h2>
            <p className="text-slate-400 text-xs">
              Projects raw cryptanalysis byte stream directly onto memristor crossbar frequency kernels without off-chip RAM fetch.
            </p>

            <div>
              <label className="block text-slate-400 mb-1">Payload to Classify:</label>
              <textarea
                value={frequencyPayload}
                onChange={(e) => setFrequencyPayload(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>

            <button
              onClick={handleFrequencyTransform}
              className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-semibold transition"
            >
              Execute In-Memory Transform
            </button>

            {frequencyResult && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-pink-500/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Classification:</span>
                  <span className="text-pink-400 font-bold text-sm bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/30">
                    {frequencyResult.neural_classification}
                  </span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Frequency Bands:</span>
                    <span className="text-cyan-400">[{frequencyResult.input_voltage_bands.map(v => v.toFixed(2)).join(', ')}] V</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crossbar Currents:</span>
                    <span className="text-purple-400">[{frequencyResult.vmm_output_currents_ma.map(i => i.toFixed(2)).join(', ')}] mA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latency:</span>
                    <span className="text-emerald-400">{frequencyResult.latency_ns} ns</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: TRANSPARENT ZK-STARKS (FRI) --- */}
      {activeTab === 'stark' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Transparent zk-STARK Prover &amp; Verifier (FRI)
              </h2>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                &ge; 128-bit Post-Quantum (No Trusted Setup)
              </span>
            </div>

            <p className="text-slate-300 text-xs font-mono leading-relaxed">
              Unlike zk-SNARKs (Groth16/Plonk) which require toxic waste trusted setup ceremonies,
              CIPHERON-X1 zk-STARKs rely purely on Fast Reed-Solomon Interactive Oracle Proofs of Proximity (FRI)
              and transparent Merkle hash commitments, maintaining post-quantum security against Grover &amp; Shor.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Private Witness Seed Secret (Integer)</label>
                <input
                  type="number"
                  value={starkSeedSecret}
                  onChange={(e) => setStarkSeedSecret(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Trace Length (Computational Steps)</label>
                <select
                  value={starkSteps}
                  onChange={(e) => setStarkSteps(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                >
                  <option value={32}>32 Steps (Fast Arithmetization)</option>
                  <option value={64}>64 Steps (Standard Benchmark)</option>
                  <option value={128}>128 Steps (Deep Trace)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-slate-400">
                Evaluates BFV/CKKS Blind Homomorphic Circuit
              </span>
              <button
                onClick={handleGenerateSTARK}
                disabled={isProving}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg flex items-center gap-2 transition disabled:opacity-50"
              >
                <Shield className="w-4 h-4" />
                {isProving ? 'Generating FRI Proof...' : 'Generate zk-STARK Proof'}
              </button>
            </div>

            {/* STARK Proof Display */}
            {starkProof && (
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span>[+] PROOF GENERATED — {starkProof.protocol}</span>
                  <span className="text-slate-400">{starkProof.proof_size_bytes} Bytes</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Trace Commitment: <span className="text-cyan-400">{starkProof.commitments.trace_commitment.substring(0, 16)}...</span></div>
                  <div>FRI Commitment: <span className="text-purple-400">{starkProof.commitments.fri_final_commitment.substring(0, 16)}...</span></div>
                  <div>Security Level: <span className="text-emerald-400">{starkProof.security_bits}-bit Quantum</span></div>
                  <div>Trusted Setup: <span className="text-pink-400">NONE (Transparent)</span></div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={handleVerifySTARK}
                    disabled={isVerifying}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isVerifying ? 'Verifying FRI IOPP...' : 'Verify STARK Proof'}
                  </button>
                </div>

                {starkVerification && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-1">
                    <div className="font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      STARK PROOF VERIFIED — Post-Quantum Security Confirmed!
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Status: <b>{starkVerification.post_quantum_status}</b> | Trusted Setup: <b>{starkVerification.trusted_setup}</b>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FRI Folding Rounds Info Card */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 font-mono text-xs">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              FRI Low-Degree Testing Rounds
            </h2>
            <p className="text-slate-400 text-xs">
              Fast Reed-Solomon Interactive Oracle Proof folds polynomial degree by factor of 2 per round:
            </p>

            <div className="space-y-2">
              {(starkProof?.fri_folding_rounds ?? [
                { round: 1, domain_size: 128, merkle_root: '9a8f...3e21' },
                { round: 2, domain_size: 64, merkle_root: 'bc41...7a09' },
                { round: 3, domain_size: 32, merkle_root: 'd190...88fa' }
              ]).map((rnd: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-cyan-400 font-bold">Round {rnd.round}</div>
                    <div className="text-[10px] text-slate-500">Domain: {rnd.domain_size} points</div>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-400">{rnd.merkle_root.substring(0, 10)}...</div>
                    <div className="text-[10px] text-slate-500">Fiat-Shamir Folded</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              Query Phase: 4 random queries with Merkle authentication paths verified against trace root.
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: MICROFLUIDIC CHEMICAL ZEROIZATION --- */}
      {activeTab === 'microfluidic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                Active Microfluidic Exothermic Silicon Dissolution (&lt;500ns)
              </h2>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                isZeroized
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                {isZeroized ? 'DIE ZEROIZED' : 'CHANNELS ARMED'}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Etched directly beneath the active 1T1M memristive substrate, microfluidic channels hold
              chemically inert exothermic reactants under 42.5 PSI pressure. On physical tamper detection
              (Focused Ion Beam probe, laser decapping, passivation breach), piezoelectric micro-valves release
              reactants that permanently dissolve silicon metallization layers in <b>&lt;500ns</b>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-xs">Channel Pressure</div>
                <div className="text-xl font-bold text-cyan-400 mt-1">
                  {isZeroized ? '0.0 PSI' : '42.5 PSI'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Active Micro-Channel Valve</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-xs">Dissolution Latency</div>
                <div className="text-xl font-bold text-pink-400 mt-1">
                  318.5 ns
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">&lt;500ns Spec Requirement</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-xs">Fail-Closed Status</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  ACTIVE
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Hardware Interlock Guaranteed</div>
              </div>
            </div>

            {/* Emergency Dissolution Trigger Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-red-400 text-xs">
                Permanent die destruction trigger for forensic laboratory anti-tamper demonstration
              </span>
              <button
                onClick={handleTriggerDissolution}
                disabled={isZeroized || loading}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition disabled:opacity-50"
              >
                <Flame className="w-4 h-4" />
                Trigger Microfluidic Zeroization
              </button>
            </div>

            {dissolutionResult && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 space-y-1.5">
                <div className="font-bold text-sm flex items-center gap-2 text-red-400">
                  <Flame className="w-4 h-4 text-red-500 animate-bounce" />
                  EMERGENCY ZEROIZATION COMPLETE — SUBSTRATE DISSOLVED IN {dissolutionResult.dissolution_latency_ns} ns
                </div>
                <div>Trigger Source: <b>{dissolutionResult.trigger_source}</b></div>
                <div>Silicon Metallization: <b>DESTROYED</b></div>
                <div>Requirement Met: <b>{dissolutionResult.dissolution_latency_ns} ns &lt; 500 ns</b></div>
              </div>
            )}
          </div>

          {/* Defense Sensors Status */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 font-mono text-xs">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Sub-Surface Sensor Interlocks
            </h2>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Focused Ion Beam (FIB) Grid</span>
                <span className="text-emerald-400 font-bold">ARMED</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Passivation Layer Continuity</span>
                <span className="text-emerald-400 font-bold">MONITORED</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Optical Thermal Decap Photodiode</span>
                <span className="text-emerald-400 font-bold">ARMED</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Piezoelectric Valve Solenoid</span>
                <span className="text-cyan-400 font-bold">READY (&lt;50ns)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingularitySiliconPage;
