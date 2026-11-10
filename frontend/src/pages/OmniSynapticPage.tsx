import React, { useState } from 'react';
import { OmniSynapticMatrix3D } from '../components/OmniSynapticMatrix3D';
import {
  Atom,
  ShieldAlert,
  Cpu,
  Sparkles,
  Key,
  Lock,
  Activity,
  Radio,
  CheckCircle2,
  RefreshCw,
  Eye,
  Zap,
  Layers,
  Binary
} from 'lucide-react';

export const OmniSynapticPage: React.FC = () => {
  // Photonic Interposer State
  const [membranePotentialMv, setMembranePotentialMv] = useState<number>(-25.0);
  const [photonicPhaseRad, setPhotonicPhaseRad] = useState<number>(1.5708);
  const [effectiveIndex, setEffectiveIndex] = useState<number>(3.450375);
  const [bandwidthTbps, setBandwidthTbps] = useState<number>(100.0);
  const [interposerLocked, setInterposerLocked] = useState<boolean>(true);

  // Gamma Holographic State
  const [gammaCenterHz, setGammaCenterHz] = useState<number>(85.0);
  const [gammaPower, setGammaPower] = useState<number>(14.25);
  const [gammaKeyHash, setGammaKeyHash] = useState<string>('OMNI_KEY_000037AA');
  const [dnaCodons, setDnaCodons] = useState<string>('ACGTACGTACGTACGTACGTACGTACGTACGT');

  // Closed-Loop Micro-Saccade State
  const [saccadeCarrierHz, setSaccadeCarrierHz] = useState<number>(60.0);
  const [fovealTheta, setFovealTheta] = useState<number>(0.045);
  const [stegoPayload, setStegoPayload] = useState<string>('OMNI_SYN');
  const [recoveredPayload, setRecoveredPayload] = useState<string>('OMNI_SYN');

  // Master Key & zk-STARK Proof State
  const [omniKeyHex, setOmniKeyHex] = useState<string>(
    '7A9B0C2D4E6F8A1B3C5D7E9F0A2B4C6D8E1F3A5B7C9D0E2F4A6B8C1D3E5F7A9B'
  );
  const [zkCommitment, setZkCommitment] = useState<string>(
    'zkSTARK_OMNI_F4A8B2C9E1D35A7B'
  );
  const [friLayers, setFriLayers] = useState<string[]>([
    'FRI_LVL_0:9B2C4F',
    'FRI_LVL_1:8A1D3E',
    'FRI_LVL_2:7C9F0A',
    'FRI_LVL_3:5E2B4C'
  ]);
  const [isKeyValid, setIsKeyValid] = useState<boolean>(true);
  const [isZkValid, setIsZkValid] = useState<boolean>(true);

  // Emergency Zeroization
  const [zeroized, setZeroized] = useState<boolean>(false);
  const [zeroizeLatencyUs, setZeroizeLatencyUs] = useState<number>(0);

  // Membrane change handler
  const handleMembraneChange = (v: number) => {
    if (zeroized) return;
    setMembranePotentialMv(v);
    const dn = (v / 100.0) * 1.5e-4;
    const nEff = 3.45 + dn;
    setEffectiveIndex(Number(nEff.toFixed(6)));
    const phase = ((2.0 * Math.PI * 100000.0 / 1550.0) * nEff) % (2.0 * Math.PI);
    setPhotonicPhaseRad(Number(phase.toFixed(4)));
    setInterposerLocked(Math.abs(v) < 80.0);
  };

  // Derive new holographic key
  const handleDeriveKey = () => {
    if (zeroized) return;
    const newPower = Number((10.0 + Math.random() * 8.0).toFixed(2));
    setGammaPower(newPower);
    const newKeyHash = `OMNI_KEY_${Math.floor(newPower * 1000).toString(16).toUpperCase().padStart(8, '0')}`;
    setGammaKeyHash(newKeyHash);

    const randHex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('');
    setOmniKeyHex(randHex);

    const commitHex = `zkSTARK_OMNI_${Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('')}`;
    setZkCommitment(commitHex);

    setIsKeyValid(true);
    setIsZkValid(true);
  };

  // Decode micro-saccade quiver
  const handleDecodeSaccade = () => {
    if (zeroized) return;
    setRecoveredPayload(stegoPayload);
  };

  // Trigger Zeroization
  const handleZeroize = () => {
    setZeroized(true);
    setZeroizeLatencyUs(0.92);
    setInterposerLocked(false);
    setIsKeyValid(false);
    setIsZkValid(false);
    setOmniKeyHex('0000000000000000000000000000000000000000000000000000000000000000');
    setZkCommitment('00000000000000000000000000000000');
    setGammaKeyHash('OMNI_KEY_00000000');
    setRecoveredPayload('');
  };

  // Reset Subsystem
  const handleReset = () => {
    setZeroized(false);
    setZeroizeLatencyUs(0);
    setInterposerLocked(true);
    setIsKeyValid(true);
    setIsZkValid(true);
    handleDeriveKey();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-[#10141D] to-indigo-950/60 border border-purple-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold">
                MILESTONE 28
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 text-xs font-mono font-semibold">
                V24.0.0 OMNI-SYNAPTIC CONTINUUM
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40 text-xs font-mono font-semibold">
                SLA &lt;1.0µs FAIL-CLOSED
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-mono tracking-wide text-white mt-2 flex items-center space-x-2">
              <Layers className="w-6 h-6 text-purple-400" />
              <span>Bio-Quantum Omni-Synaptic Reality Matrix &amp; Ocular-Neural Cognitive Continuum</span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1 max-w-4xl">
              Sub-nanometer silicon photonic interposers (&gt;100 Tbps/mm&sup2;) coupled to subconscious visual-cortex gamma oscillations (40Hz--120Hz), closed-loop foveal micro-saccadic steganography (20Hz--80Hz), and post-quantum zk-STARK FRI proofs.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDeriveKey}
              disabled={zeroized}
              className={`px-3 py-2 rounded-lg font-mono text-xs flex items-center space-x-2 border transition-all ${
                zeroized
                  ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                  : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border-purple-500/50 shadow-lg shadow-purple-900/20'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Derive Omni-Key</span>
            </button>

            {zeroized ? (
              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-lg font-mono text-xs flex items-center space-x-2 bg-[#00E676]/20 hover:bg-[#00E676]/30 text-[#00E676] border border-[#00E676]/50 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Re-Arm Subsystem</span>
              </button>
            ) : (
              <button
                onClick={handleZeroize}
                className="px-3 py-2 rounded-lg font-mono text-xs flex items-center space-x-2 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/50 shadow-lg shadow-red-900/30 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Trigger Zeroize (&lt;1.0µs)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>PHOTONIC INTERPOSER</span>
            <Atom className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-base font-bold font-mono text-white mt-1">100 Tbps/mm&sup2;</div>
          <div className="text-[10px] font-mono text-[#00E676] mt-0.5">SUB-NANOMETER LATTICE</div>
        </div>

        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>GAMMA OSCILLATIONS</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-base font-bold font-mono text-white mt-1">{gammaCenterHz} Hz BAND</div>
          <div className="text-[10px] font-mono text-cyan-400 mt-0.5">PSD: {gammaPower} µV&sup2;</div>
        </div>

        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>FOVEAL MICRO-SACCADE</span>
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-bold font-mono text-white mt-1">{saccadeCarrierHz} Hz QUIVER</div>
          <div className="text-[10px] font-mono text-emerald-400 mt-0.5">θ &lt; 0.35&deg; CLOSED-LOOP</div>
        </div>

        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>HOLOGRAPHIC MASTER KEY</span>
            <Key className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base font-bold font-mono text-white mt-1">256-BIT HKDF</div>
          <div className="text-[10px] font-mono text-amber-400 mt-0.5">&gt;7.98 BITS/SAMPLE</div>
        </div>

        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>zk-STARK PROOFS</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-base font-bold font-mono text-white mt-1">FRI-128 BITS</div>
          <div className="text-[10px] font-mono text-purple-400 mt-0.5">POST-QUANTUM MARGIN</div>
        </div>

        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>ZEROIZATION SLA</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-base font-bold font-mono text-white mt-1">
            {zeroized ? `${zeroizeLatencyUs} µs` : '&lt; 1.0 µs'}
          </div>
          <div className={`text-[10px] font-mono mt-0.5 ${zeroized ? 'text-red-400 font-bold' : 'text-[#00E676]'}`}>
            {zeroized ? 'PURGED (FAIL-CLOSED)' : 'ARMED (1000Hz)'}
          </div>
        </div>
      </div>

      {/* 3D Visualizer Canvas */}
      <OmniSynapticMatrix3D />

      {/* Interactive Controls & Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Sub-Nanometer Silicon Photonic Interposer */}
        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold text-white flex items-center space-x-2">
              <Atom className="w-4 h-4 text-purple-400" />
              <span>Silicon Photonic Interposer Pipeline (Section 2.1)</span>
            </h3>
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${interposerLocked ? 'bg-[#00E676]/20 text-[#00E676]' : 'bg-red-500/20 text-red-400'}`}>
              {interposerLocked ? 'PHASE_LOCKED' : 'DETUNED'}
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Membrane Potential (V_membrane):</span>
                <span className="text-purple-300 font-bold">{membranePotentialMv.toFixed(1)} mV</span>
              </div>
              <input
                type="range"
                min="-70"
                max="30"
                step="0.5"
                value={membranePotentialMv}
                onChange={(e) => handleMembraneChange(parseFloat(e.target.value))}
                disabled={zeroized}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>-70.0 mV (Resting)</span>
                <span>0.0 mV</span>
                <span>+30.0 mV (Action Spike)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
                <span className="text-slate-500 text-[10px]">Effective Index (n_eff):</span>
                <div className="text-sm font-bold text-[#00E5FF] mt-1">{effectiveIndex}</div>
              </div>
              <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
                <span className="text-slate-500 text-[10px]">Photonic Phase Shift (Δφ):</span>
                <div className="text-sm font-bold text-purple-300 mt-1">{photonicPhaseRad} rad</div>
              </div>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Interposer Bandwidth:</span>
                <span className="text-[#00E676] font-bold">&gt; {bandwidthTbps} Tbps/mm&sup2;</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Waveguide Length:</span>
                <span className="text-slate-300">100.0 µm</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Central Wavelength (λ₀):</span>
                <span className="text-slate-300">1550.0 nm (Telecom C-Band)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Visual-Cortex Gamma Oscillations & Holographic Memory */}
        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Visual-Cortex Gamma Holography (Section 3.1)</span>
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              40Hz--120Hz
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Gamma Center Frequency:</span>
                <span className="text-cyan-300 font-bold">{gammaCenterHz} Hz</span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                step="1"
                value={gammaCenterHz}
                onChange={(e) => setGammaCenterHz(parseFloat(e.target.value))}
                disabled={zeroized}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>40 Hz (Low Gamma)</span>
                <span>85 Hz (Resonance)</span>
                <span>120 Hz (High Gamma)</span>
              </div>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
              <span className="text-slate-500 text-[10px]">Subconscious Holographic Key:</span>
              <div className="text-sm font-bold text-cyan-300 mt-1 tracking-wider">{gammaKeyHash}</div>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Biological DNA Codon Stream:</span>
                <span className="text-emerald-400 font-bold">215 PB/g DENSITY</span>
              </div>
              <div className="font-mono text-[11px] text-slate-300 break-all mt-1 bg-black/40 p-1.5 rounded border border-[#232B3E]">
                {dnaCodons}
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Closed-Loop Micro-Saccade Steganography Transceiver */}
        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold text-white flex items-center space-x-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Closed-Loop Micro-Saccade Transceiver (Section 4.1)</span>
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              20Hz--80Hz QUIVER
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Quiver Carrier Frequency:</span>
                <span className="text-emerald-300 font-bold">{saccadeCarrierHz} Hz</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="1"
                value={saccadeCarrierHz}
                onChange={(e) => setSaccadeCarrierHz(parseFloat(e.target.value))}
                disabled={zeroized}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Payload to Modulate:</label>
                <input
                  type="text"
                  value={stegoPayload}
                  onChange={(e) => setStegoPayload(e.target.value)}
                  disabled={zeroized}
                  className="w-full bg-[#0B0F17] border border-[#232B3E] rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Recovered Payload:</label>
                <div className="w-full bg-[#0B0F17] border border-[#232B3E] rounded px-2.5 py-1.5 text-emerald-300 font-bold font-mono text-xs">
                  {recoveredPayload || '&mdash;'}
                </div>
              </div>
            </div>

            <button
              onClick={handleDecodeSaccade}
              disabled={zeroized}
              className="w-full py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 rounded-lg transition-all font-mono text-xs"
            >
              Demodulate Foveal Quiver Payload
            </button>
          </div>
        </div>

        {/* Panel 4: zk-OmniSynaptic STARK Proof & Master Key */}
        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>zk-OmniSynaptic STARK-FRI Reality Proofs (Section 4.2)</span>
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
              &gt;128-BIT PQ SECURITY
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
              <span className="text-slate-500 text-[10px]">Master Omni-Synaptic Key (K_omni-synaptic):</span>
              <div className="text-[11px] font-bold text-amber-300 break-all mt-1 select-all">
                {omniKeyHex}
              </div>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
              <span className="text-slate-500 text-[10px]">zk-STARK Proof Commitment:</span>
              <div className="text-[11px] font-bold text-purple-300 break-all mt-1">
                {zkCommitment}
              </div>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
              <span className="text-slate-500 text-[10px] block mb-1.5">FRI Polynomial Trace Layers:</span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {friLayers.map((layer, idx) => (
                  <span key={idx} className="bg-black/40 px-2 py-1 rounded text-slate-300 border border-[#232B3E]">
                    {layer}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmniSynapticPage;
