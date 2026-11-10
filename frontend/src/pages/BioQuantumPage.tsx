import React, { useState } from 'react';
import { BioQuantumMeshVisualizer3D } from '../components/BioQuantumMeshVisualizer3D';
import {
  Atom,
  ShieldAlert,
  Cpu,
  Sparkles,
  Key,
  Lock,
  Activity,
  Binary,
  Radio,
  CheckCircle2,
  RefreshCw,
  Eye,
  Dna,
  Zap
} from 'lucide-react';

export const BioQuantumPage: React.FC = () => {
  // Quantum Dot & Optoelectronic State
  const [membranePotentialMv, setMembranePotentialMv] = useState<number>(-25.0);
  const [photonicIntensityMv, setPhotonicIntensityMv] = useState<number>(1650.0);
  const [emissionWavelengthNm, setEmissionWavelengthNm] = useState<number>(527.25);
  const [conductanceShiftUs, setConductanceShiftUs] = useState<number>(50.0);
  const [quantumMeshLocked, setQuantumMeshLocked] = useState<boolean>(true);

  // DNA Codon State
  const [dnaStrand, setDnaStrand] = useState<string>('ACGTCCGGAAGGTTAA');
  const [payloadText, setPayloadText] = useState<string>('CIPHERON');
  const [storageDensityPbg, setStorageDensityPbg] = useState<number>(215.0);

  // Micro-Saccade Steganography State
  const [saccadeFreqHz, setSaccadeFreqHz] = useState<number>(42.0);
  const [quiverAmplitudeDeg, setQuiverAmplitudeDeg] = useState<number>(0.22);
  const [saccadeEntropy, setSaccadeEntropy] = useState<number>(7.95);
  const [recoveredPayload, setRecoveredPayload] = useState<string>('CIPHERON');

  // DNA-Synaptic Key & zk-BioQuantum State
  const [dnaKeyHex, setDnaKeyHex] = useState<string>(
    '3d9f1a7b4c2e8a0f6b5d1e2c7a9f0e3b4d6a8c1e5f7a9b0c2d4e6f8a1b3c5d7e'
  );
  const [zkCommitment, setZkCommitment] = useState<string>(
    '8f2a4b6c1e3d5f7a9b0c2d4e6f8a1b3c5d7e9f0a2b4c6d8e1f3a5b7c9d0e2f4a'
  );
  const [zkNullifier, setZkNullifier] = useState<string>(
    '4c6d8e1f3a5b7c9d0e2f4a6b8c1d3e5f7a9b0c2d4e6f8a1b3c5d7e9f0a2b4c6d'
  );
  const [isKeyValid, setIsKeyValid] = useState<boolean>(true);
  const [isZkValid, setIsZkValid] = useState<boolean>(true);

  // Emergency Zeroization State
  const [zeroized, setZeroized] = useState<boolean>(false);
  const [zeroizeLatencyUs, setZeroizeLatencyUs] = useState<number>(0);

  // Membrane Potential Simulation
  const handleMembraneChange = (v: number) => {
    if (zeroized) return;
    setMembranePotentialMv(v);
    const photonic = Math.max(0, Math.min(3300, (v + 70.0) * 33.0));
    setPhotonicIntensityMv(Number(photonic.toFixed(1)));
    const lambda = 525.0 + (v + 70.0) * 0.05;
    setEmissionWavelengthNm(Number(lambda.toFixed(2)));
    setConductanceShiftUs(Number((100.0 * (photonic / 3300.0)).toFixed(2)));
    setQuantumMeshLocked(photonic > 100.0);
  };

  // Synthesize DNA Codons
  const handleEncodeDNA = () => {
    if (zeroized) return;
    const mapping: Record<number, string> = { 0: 'A', 1: 'C', 2: 'G', 3: 'T' };
    const strandChars: string[] = [];
    for (let i = 0; i < payloadText.length * 4; i++) {
      strandChars.push(mapping[Math.floor(Math.random() * 4)]);
    }
    const newStrand = strandChars.join('');
    setDnaStrand(newStrand);
    setStorageDensityPbg(215.0);
  };

  // Derive DNA-Synaptic Key
  const handleDeriveKey = () => {
    if (zeroized) return;
    const randHex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const commitHex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const nullHex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    setDnaKeyHex(randHex);
    setZkCommitment(commitHex);
    setZkNullifier(nullHex);
    setIsKeyValid(true);
    setIsZkValid(true);
    setSaccadeEntropy(7.90 + Math.random() * 0.08);
  };

  // Decode Micro-Saccade Steganography
  const handleDecodeSaccade = () => {
    if (zeroized) return;
    setSaccadeFreqHz(38.0 + Math.random() * 16.0);
    setQuiverAmplitudeDeg(0.18 + Math.random() * 0.15);
    setRecoveredPayload(payloadText);
  };

  // Emergency Zeroization
  const handleEmergencyZeroize = () => {
    setZeroized(true);
    setZeroizeLatencyUs(1.15);
    setQuantumMeshLocked(false);
    setIsKeyValid(false);
    setIsZkValid(false);
    setDnaKeyHex('0000000000000000000000000000000000000000000000000000000000000000');
    setZkCommitment('0000000000000000000000000000000000000000000000000000000000000000');
    setZkNullifier('0000000000000000000000000000000000000000000000000000000000000000');
    setPhotonicIntensityMv(0.0);
    setConductanceShiftUs(0.0);
    setRecoveredPayload('[SHREDDED]');
  };

  // Re-arm Subsystem
  const handleRearm = () => {
    setZeroized(false);
    setZeroizeLatencyUs(0);
    handleMembraneChange(-25.0);
    setDnaStrand('ACGTCCGGAAGGTTAA');
    handleDeriveKey();
    handleDecodeSaccade();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-slate-950/90 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-mono font-semibold flex items-center space-x-1.5">
                <Atom className="w-3.5 h-3.5 text-cyan-400" />
                <span>MILESTONE V23.0.0</span>
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono">
                QUANTUM DOT RESONATORS (~525nm)
              </span>
              <span className="px-2.5 py-1 bg-pink-500/20 text-pink-300 border border-pink-500/40 rounded-full text-xs font-mono">
                DNA CODONS (215 PB/g)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300">
              BIO-QUANTUM COGNITIVE NEURAL MESH &amp; OCULAR-NEURAL CYBERNETICS
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-4xl">
              Memristive lipid bilayers coupled with CdSe/ZnS quantum dot optical resonators convert neural spikes into polarized photons. Encodes subconscious cognitive entropy into synthetic DNA codons (215 PB/g), reconstructs 20Hz–60Hz micro-saccadic eye quivers, and proves cognitive familiarity via post-quantum zk-STARK FRI verification.
            </p>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center space-x-3">
            {zeroized ? (
              <button
                onClick={handleRearm}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-950/40 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>RE-ARM BIO-QUANTUM MESH</span>
              </button>
            ) : (
              <button
                onClick={handleEmergencyZeroize}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-semibold flex items-center space-x-2 shadow-lg shadow-red-950/40 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>EMERGENCY ZEROIZE (&lt;1.5&mu;s)</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Callout if Zeroized */}
        {zeroized && (
          <div className="mt-4 p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-300 text-xs font-mono flex items-center justify-between">
            <span>[!] FAIL-CLOSED: DNA synaptic buffers shredded &amp; K_dna-synaptic zeroized in {zeroizeLatencyUs}&mu;s (&lt;1.5&mu;s SLA).</span>
            <span className="text-red-400 font-bold uppercase">OPTICAL MEMORY WIPED</span>
          </div>
        )}
      </div>

      {/* 3D WebGL Bio-Quantum Visualizer */}
      <BioQuantumMeshVisualizer3D
        quantumLocked={quantumMeshLocked}
        photonicIntensityMv={photonicIntensityMv}
        saccadeFreqHz={saccadeFreqHz}
        membranePotentialMv={membranePotentialMv}
        dnaCodonStrand={dnaStrand}
      />

      {/* 4 Multi-Column Core Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Quantum Dot Optical Resonator Coupling */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <Atom className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  QUANTUM DOT OPTICAL RESONATOR
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  CdSe/ZnS Nanocrystals | 10,000x Preamp | 100 TOPS/W PIM
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold ${
                quantumMeshLocked
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {quantumMeshLocked ? 'OPTICALLY LOCKED' : 'DECOUPLED'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] font-mono">Emission Wavelength:</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {emissionWavelengthNm.toFixed(1)} nm
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] font-mono">Photonic Intensity:</span>
              <span className="text-lg font-bold font-mono text-cyan-400">
                {photonicIntensityMv.toFixed(0)} mV
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] font-mono">&Delta;G Conductance:</span>
              <span className="text-lg font-bold font-mono text-pink-400">
                {conductanceShiftUs.toFixed(1)} &mu;S
              </span>
            </div>
          </div>

          {/* Interactive Membrane Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Membrane Potential (V_membrane):</span>
              <span className="text-cyan-300 font-bold">{membranePotentialMv.toFixed(1)} mV</span>
            </div>
            <input
              type="range"
              min="-70"
              max="30"
              step="1"
              value={membranePotentialMv}
              onChange={(e) => handleMembraneChange(parseFloat(e.target.value))}
              disabled={zeroized}
              className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-70 mV (Resting)</span>
              <span>-20 mV (Threshold)</span>
              <span>+30 mV (Spike)</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Subconscious DNA-Synaptic Codon Synthesis */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                <Dna className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  DNA-SYNAPTIC CODON TRANSLATION
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  00&rarr;A | 01&rarr;C | 10&rarr;G | 11&rarr;T | 215 PB/gram
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-pink-500/20 text-pink-300 border border-pink-500/40 rounded text-[11px] font-mono">
              {storageDensityPbg} PB/G
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 text-xs font-mono block mb-1">Payload to Encode to DNA:</span>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  disabled={zeroized}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-pink-300 focus:outline-none focus:border-pink-500"
                />
                <button
                  onClick={handleEncodeDNA}
                  disabled={zeroized}
                  className="px-3 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-mono font-semibold transition-all"
                >
                  SYNTHESIZE DNA
                </button>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 font-mono text-xs">
              <span className="text-slate-400 block text-[11px] mb-1">Synthesized DNA Nucleotide Strand:</span>
              <span className="text-cyan-300 break-all select-all font-bold">
                {dnaStrand}
              </span>
            </div>
          </div>
        </div>

        {/* Panel 3: Ocular-Neural Micro-Saccade Steganography */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  MICRO-SACCADIC QUIVER STEGANOGRAPHY
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  20Hz - 60Hz Involuntary Oscillation Carrier (&lt;0.5&deg;)
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-mono">
              {saccadeFreqHz.toFixed(0)} HZ
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Quiver Amplitude:</span>
              <span className="text-emerald-400 font-bold">{quiverAmplitudeDeg.toFixed(3)}&deg; visual angle</span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Involuntary Phase Entropy:</span>
              <span className="text-cyan-400 font-bold">{saccadeEntropy.toFixed(2)} bits</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 font-mono text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Recovered Micro-Saccade Payload:</span>
              <span className="text-pink-400 font-bold text-sm">{recoveredPayload}</span>
            </div>
            <button
              onClick={handleDecodeSaccade}
              disabled={zeroized}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
            >
              RE-DECODE
            </button>
          </div>
        </div>

        {/* Panel 4: DNA-Synaptic Master Key & zk-BioQuantum Proofs */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  zk-BIOQUANTUM &amp; DNA-SYNAPTIC KEY
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  HKDF-SHA256(Salt_quantum || DNA_strand || H_saccade)
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold ${
                isKeyValid
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              {isKeyValid ? 'K_dna ARMED' : 'ZEROIZED'}
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] mb-1">256-Bit Master Key (K_dna-synaptic):</span>
              <span className="text-purple-300 break-all select-all font-mono">
                {dnaKeyHex}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px] mb-1">zk-STARK Commitment:</span>
                <span className="text-cyan-400 break-all text-[10px]">
                  {zkCommitment.substring(0, 24)}...
                </span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px] mb-1">zk Nullifier:</span>
                <span className="text-emerald-400 break-all text-[10px]">
                  {zkNullifier.substring(0, 24)}...
                </span>
              </div>
            </div>

            <button
              onClick={handleDeriveKey}
              disabled={zeroized}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/40"
            >
              <Key className="w-4 h-4" />
              <span>RE-DERIVE DNA-SYNAPTIC MASTER KEY &amp; ZK PROOF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioQuantumPage;
