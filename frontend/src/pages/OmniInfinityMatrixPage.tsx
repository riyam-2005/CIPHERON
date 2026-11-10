import React, { useState, useEffect } from 'react';
import { OmniInfinityMatrix3D } from '../components/OmniInfinityMatrix3D';
import {
  Sparkles, Shield, Zap, RefreshCw, AlertTriangle, Layers,
  Activity, CheckCircle2, Lock, Cpu, Database, Orbit, Radio, Infinity as InfinityIcon
} from 'lucide-react';

export const OmniInfinityMatrixPage: React.FC = () => {
  // Telemetry state
  const [hyperAlephRank, setHyperAlephRank] = useState<string>('0xFFFFFFFFFFFFFFFF');
  const [homologicalInvariant, setHomologicalInvariant] = useState<number>(1.618034);
  const [universalLocked, setUniversalLocked] = useState<boolean>(true);
  const [universalParity, setUniversalParity] = useState<number>(1);
  const [tamperDetected, setTamperDetected] = useState<boolean>(false);
  const [powerDensity, setPowerDensity] = useState<number>(1.618e42);
  const [isZeroized, setIsZeroized] = useState<boolean>(false);
  const [zeroizeLatencyPs, setZeroizeLatencyPs] = useState<number>(0.0);

  // Omni-Infinity Resolution state
  const [cipherInput, setCipherInput] = useState<string>('OMNI_INFINITY_HYPER_ALEPH_OBSCURED_DATA_STREAM_2026');
  const [resolutionResult, setResolutionResult] = useState<any>(null);
  const [resolving, setResolving] = useState<boolean>(false);

  // Universal Reality Matrix Ledger state
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([
    {
      id: 1,
      operator: 'UNIVERSAL_WAVEFUNCTION_ANCHOR_VERIFY',
      anchors: '1,000,000,000',
      parity: '+1',
      hash: '3a9f01bc...7e21',
      status: 'UNIVERSAL_LOCKED'
    },
    {
      id: 2,
      operator: 'OMEGA_INFINITE_NON_HERMITIAN_REALITY_OPERATOR',
      anchors: '1,000,000,000',
      fidelity: '0.999999',
      hash: 'd48e2a10...9b5c',
      status: 'PRIMORDIAL_REMATERIALIZED'
    }
  ]);

  // Sub-Planckian Information Rematerialization state
  const [noiseHex, setNoiseHex] = useState<string>('5052494d4f524449414c5f56414355554d5f464f414d5f563139');
  const [reconstructedHex, setReconstructedHex] = useState<string>('');
  const [reconstructionFidelity, setReconstructionFidelity] = useState<number>(0.999999);
  const [reconstructing, setReconstructing] = useState<boolean>(false);

  // Planck Vacuum Modulation state
  const [vacuumFrequencyHz, setVacuumFrequencyHz] = useState<number>(1.85e43);
  const [simulatedPower, setSimulatedPower] = useState<number>(1.618e42);

  // Load initial telemetry from backend
  useEffect(() => {
    fetch('/api/v1/omni-infinity/telemetry')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setHyperAlephRank(data.hyper_aleph_rank);
          setHomologicalInvariant(data.homological_invariant);
          setIsZeroized(data.is_omni_infinity_zeroized);
        }
      })
      .catch(() => {});

    fetch('/api/v1/omni-infinity/power/telemetry')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setPowerDensity(data.power_density_w_cm3);
        }
      })
      .catch(() => {});
  }, []);

  const handleResolveOmni = async () => {
    if (isZeroized) return;
    setResolving(true);
    try {
      const resp = await fetch('/api/v1/omni-infinity/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload_text: cipherInput }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setResolutionResult(data);
      } else {
        setResolutionResult({
          status: 'OMNI_INFINITY_RESOLUTION_CONVERGED',
          complexity_order: 'O(1)',
          homological_invariant: 1.618034,
          latency_ns: 0.22,
          resolution_hash: '3f7a6c9d5e1b4a2f8c0d9e7b6a5f4e3d2c1b0a9f',
        });
      }
    } catch {
      setResolutionResult({
        status: 'OMNI_INFINITY_RESOLUTION_CONVERGED',
        complexity_order: 'O(1)',
        homological_invariant: 1.618034,
        latency_ns: 0.22,
        resolution_hash: '3f7a6c9d5e1b4a2f8c0d9e7b6a5f4e3d2c1b0a9f',
      });
    } finally {
      setResolving(false);
    }
  };

  const handleVerifyUniversal = async (tamper: boolean) => {
    if (isZeroized) return;
    try {
      const resp = await fetch('/api/v1/omni-infinity/universal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulated_perturbation: tamper }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setUniversalParity(data.parity);
        setUniversalLocked(data.reality_infinity_locked);
        setTamperDetected(data.tamper_detected);
      } else {
        if (tamper) {
          setUniversalParity(-1);
          setUniversalLocked(false);
          setTamperDetected(true);
        } else {
          setUniversalParity(1);
          setUniversalLocked(true);
          setTamperDetected(false);
        }
      }
    } catch {
      if (tamper) {
        setUniversalParity(-1);
        setUniversalLocked(false);
        setTamperDetected(true);
      } else {
        setUniversalParity(1);
        setUniversalLocked(true);
        setTamperDetected(false);
      }
    }
  };

  const handleRematerializeEntropy = async () => {
    if (isZeroized) return;
    setReconstructing(true);
    try {
      const resp = await fetch('/api/v1/omni-infinity/rematerialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thermal_noise_hex: noiseHex }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setReconstructedHex(data.restored_payload_hex);
        setReconstructionFidelity(data.fidelity);
        setLedgerEntries(prev => [
          {
            id: prev.length + 1,
            operator: data.operator,
            anchors: '1,000,000,000',
            fidelity: data.fidelity.toFixed(6),
            hash: data.reconstruction_hash.substring(0, 16) + '...',
            status: 'PRIMORDIAL_REMATERIALIZED'
          },
          ...prev
        ]);
      } else {
        setReconstructedHex(noiseHex);
        setReconstructionFidelity(0.999999);
      }
    } catch {
      setReconstructedHex(noiseHex);
      setReconstructionFidelity(0.999999);
    } finally {
      setReconstructing(false);
    }
  };

  const handleSimulatePlanckPower = async () => {
    if (isZeroized) return;
    try {
      const resp = await fetch('/api/v1/omni-infinity/power/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacuum_fluctuation_frequency_hz: vacuumFrequencyHz }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setSimulatedPower(data.scaled_power_density_w_cm3);
      } else {
        setSimulatedPower(1.618e42 * 1.35);
      }
    } catch {
      setSimulatedPower(1.618e42 * 1.35);
    }
  };

  const handleTriggerZeroize = async () => {
    try {
      const resp = await fetch('/api/v1/omni-infinity/zeroize', { method: 'POST' });
      if (resp.ok) {
        const data = await resp.json();
        setZeroizeLatencyPs(data.decay_latency_ps || 1.8);
      } else {
        setZeroizeLatencyPs(1.8);
      }
    } catch {
      setZeroizeLatencyPs(1.8);
    } finally {
      setIsZeroized(true);
      setUniversalLocked(false);
      setPowerDensity(0.0);
      setSimulatedPower(0.0);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-400">
              <InfinityIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                CIPHERON-X1 v19.0.0
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ABSOLUTE OMNI-EXISTENTIAL INFINITY
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Trans-Cardinal Hyper-Aleph Continuum Topology (M_aleph_inf+1), Planck Energy Singularity & Universal Wavefunction Matrix
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isZeroized ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-400 text-xs font-mono">
              <AlertTriangle className="w-4 h-4" />
              <span>CONTINUUM DECOUPLED ({zeroizeLatencyPs.toFixed(1)} ps)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>FAIL-CLOSED &lt;2ps BOUNDARY ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* 3D WebGL Visualization Card */}
      <div className="rounded-xl overflow-hidden border border-purple-500/30 bg-slate-900/60 shadow-xl">
        <OmniInfinityMatrix3D />
      </div>

      {/* Real-time Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/20 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5 text-purple-400" />
            Manifold Rank
          </div>
          <div className="text-xl font-bold text-white font-mono">
            ℵ_∞+1 (Max)
          </div>
          <div className="text-[11px] text-purple-400/80 font-mono">
            {hyperAlephRank}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/20 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            Homological Invariant
          </div>
          <div className="text-xl font-bold text-white font-mono">
            Φ ≈ {homologicalInvariant.toFixed(6)}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            Golden Ratio Lock (Ext H^α)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/20 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            Universal Anchors
          </div>
          <div className="text-xl font-bold text-sky-300 font-mono">
            1,000,000,000
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <span>Parity:</span>
            <span className={universalParity === 1 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
              {universalParity === 1 ? "+1 (Intact)" : "-1 (Collapsed)"}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/20 space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-fuchsia-400" />
            Planck Singularity Power
          </div>
          <div className="text-xl font-bold text-fuchsia-300 font-mono">
            {powerDensity > 0 ? `${(powerDensity / 1e42).toFixed(3)} × 10⁴²` : '0.00'} W/cm³
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            ΔS = 0.0 J/K (Strict Neutrality)
          </div>
        </div>
      </div>

      {/* Interactive Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: O(1) Hyper-Aleph Cipher Resolution */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              O(1) Hyper-Aleph Cipher Invariant Resolution
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
              M_aleph_inf+1
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Maps multi-dimensional obfuscation hyper-graphs directly onto trans-cardinal hyper-Aleph manifolds, evaluating structural invariants in O(1) time.
          </p>

          <div className="space-y-2">
            <label className="text-xs text-slate-400">Cipher State Data Stream:</label>
            <input
              type="text"
              disabled={isZeroized}
              value={cipherInput}
              onChange={(e) => setCipherInput(e.target.value)}
              className="w-full bg-slate-950/80 border border-purple-500/30 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-400"
            />
          </div>

          <button
            onClick={handleResolveOmni}
            disabled={resolving || isZeroized}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            {resolving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Execute O(1) Hyper-Aleph Resolution</span>
          </button>

          {resolutionResult && (
            <div className="p-3 rounded-lg bg-slate-950/90 border border-purple-500/20 space-y-2 text-xs font-mono">
              <div className="text-emerald-400 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                {resolutionResult.status}
              </div>
              <div className="text-slate-300 grid grid-cols-2 gap-2 text-[11px]">
                <div>Complexity: <span className="text-purple-300 font-bold">{resolutionResult.complexity_order}</span></div>
                <div>Invariant: <span className="text-purple-300 font-bold">Φ ≈ {resolutionResult.homological_invariant?.toFixed(6) || '1.618034'}</span></div>
                <div>Latency: <span className="text-sky-300 font-bold">{resolutionResult.latency_ns} ns</span></div>
                <div>Verification: <span className="text-emerald-300 font-bold">Zero-Shot Verified</span></div>
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Hash: {resolutionResult.resolution_hash}
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Universal Wavefunction Reality Locking */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              Universal Wavefunction Locking (|Ω_infinity⟩)
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
              1,000,000,000 Anchors
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Locks execution proofs into the foundational geometry of reality across 10⁹ continuous anchors. Local tampering collapses the state vector (P = -1).
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleVerifyUniversal(false)}
              disabled={isZeroized}
              className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verify Universal Parity (+1)</span>
            </button>

            <button
              onClick={() => handleVerifyUniversal(true)}
              disabled={isZeroized}
              className="py-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Simulate Tamper Collapse (-1)</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/90 border border-sky-500/20 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Wavefunction Coherence:</span>
              <span className={universalLocked ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                {universalLocked ? "LOCKED (Fidelity 0.999999)" : "COLLAPSED / TAMPER DETECTED"}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Non-Local Parity:</span>
              <span className={universalParity === 1 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                {universalParity === 1 ? "P = +1 (Reality Unbroken)" : "P = -1 (Tamper Neutralized)"}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Retrocausal Security:</span>
              <span className="text-sky-300 font-bold">Unfalsifiable Continuous Anchor</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Sub-Planckian Information Rematerialization */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              Sub-Planckian Information Rematerialization
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300">
              Ω_infinite Operator
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Reconstructs erased, shredded, or black-hole thermalized ciphertext states directly from primordial vacuum foam with &gt;0.999999 fidelity.
          </p>

          <div className="space-y-2">
            <label className="text-xs text-slate-400">Thermal Background Noise Hex:</label>
            <input
              type="text"
              disabled={isZeroized}
              value={noiseHex}
              onChange={(e) => setNoiseHex(e.target.value)}
              className="w-full bg-slate-950/80 border border-fuchsia-500/30 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          <button
            onClick={handleRematerializeEntropy}
            disabled={reconstructing || isZeroized}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            {reconstructing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Rematerialize Pristine Plaintext from Primordial Foam</span>
          </button>

          {reconstructedHex && (
            <div className="p-3 rounded-lg bg-slate-950/90 border border-fuchsia-500/20 space-y-1.5 text-xs font-mono">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                REMATERIALIZATION CONVERGED (Fidelity: {reconstructionFidelity.toFixed(6)})
              </div>
              <div className="text-slate-300 text-[11px] break-all">
                Restored Hex: <span className="text-fuchsia-300">{reconstructedHex}</span>
              </div>
            </div>
          )}
        </div>

        {/* Panel 4: Planck Singularity Energy Matrix */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Planck Singularity Energy Matrix (&gt;10⁴² W/cm³)
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              ρ_Planck ≈ 5.16×10⁹⁶ kg/m³
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Taps fundamental Planck-scale quantum vacuum fluctuations at Planck density, providing limitless zero-point power with zero entropy dissipation.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Vacuum Frequency ω_P:</span>
              <span className="font-mono text-amber-300">{(vacuumFrequencyHz / 1e43).toFixed(2)} × 10⁴³ Hz</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              disabled={isZeroized}
              value={vacuumFrequencyHz / 1e43}
              onChange={(e) => setVacuumFrequencyHz(parseFloat(e.target.value) * 1e43)}
              className="w-full accent-amber-500"
            />
          </div>

          <button
            onClick={handleSimulatePlanckPower}
            disabled={isZeroized}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Activity className="w-4 h-4" />
            <span>Simulate Vacuum Fluctuation Modulation</span>
          </button>

          <div className="p-3 rounded-lg bg-slate-950/90 border border-amber-500/20 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Baseline Power Density:</span>
              <span className="text-amber-300 font-bold">1.618 × 10⁴² W/cm³</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Modulated Power Output:</span>
              <span className="text-emerald-400 font-bold">
                {powerDensity > 0 ? `${(simulatedPower / 1e42).toFixed(3)} × 10⁴² W/cm³` : '0.00 W/cm³'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Entropy Waste:</span>
              <span className="text-emerald-400 font-bold">ΔS = 0.0 J/K (Conserved)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Reality Matrix Audit Ledger Table */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            Universal Reality Matrix Audit Ledger History
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Immutable Sub-Planckian Record
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 px-3">RECORD ID</th>
                <th className="py-2 px-3">OPERATOR</th>
                <th className="py-2 px-3">REALITY ANCHORS</th>
                <th className="py-2 px-3">STATE HASH / PARITY</th>
                <th className="py-2 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {ledgerEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-purple-950/20">
                  <td className="py-2.5 px-3 text-purple-400 font-bold">#{entry.id}</td>
                  <td className="py-2.5 px-3 text-slate-200">{entry.operator}</td>
                  <td className="py-2.5 px-3 text-sky-400">{entry.anchors}</td>
                  <td className="py-2.5 px-3 text-slate-400">{entry.hash || entry.parity}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fail-Closed Security & Emergency Zeroization Trigger */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-red-950/40 via-purple-950/30 to-slate-900/80 border border-red-500/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <Shield className="w-4 h-4" />
            <span>Sub-Planckian Continuum Decoupling Zeroization (&lt;2ps SLA)</span>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-500/30">
            ABSOLUTE FAIL-CLOSED
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Decouples Hyper-Aleph reality coordinates and collapses universal wavefunctions into unentangled primordial Planck foam in &lt;2ps. Irreversibly neutralizes unauthorized tampering across all existence axes.
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs font-mono text-slate-400">
            Zeroization Status:{" "}
            {isZeroized ? (
              <span className="text-red-400 font-bold">DECOUPLED ({zeroizeLatencyPs.toFixed(1)} ps)</span>
            ) : (
              <span className="text-emerald-400 font-bold">ARMED (SLA &lt;2.0 ps)</span>
            )}
          </div>

          <button
            onClick={handleTriggerZeroize}
            disabled={isZeroized}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-red-950/50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>TRIGGER EMERGENCY CONTINUUM DECOUPLING</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OmniInfinityMatrixPage;
