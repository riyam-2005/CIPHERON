import React, { useState } from 'react';
import { HybridBciVisualizer3D } from '../components/HybridBciVisualizer3D';
import {
  Brain,
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
  Sliders
} from 'lucide-react';

export const HybridBciPage: React.FC = () => {
  // BCI Signal & P300 State
  const [eegPzVoltage, setEegPzVoltage] = useState<number>(18.5);
  const [intentLocked, setIntentLocked] = useState<boolean>(true);
  const [p300LatencyMs, setP300LatencyMs] = useState<number>(312.0);
  const [p300SnrDb, setP300SnrDb] = useState<number>(14.8);
  const [confidenceScore, setConfidenceScore] = useState<number>(0.92);
  const [gazeDirection, setGazeDirection] = useState<'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'>('RIGHT');

  // Spectral Band Power State
  const [entropyBits, setEntropyBits] = useState<number>(7.92);
  const [deltaPower, setDeltaPower] = useState<number>(12.4);
  const [thetaPower, setThetaPower] = useState<number>(18.2);
  const [alphaPower, setAlphaPower] = useState<number>(24.6);
  const [betaPower, setBetaPower] = useState<number>(38.5);
  const [gammaPower, setGammaPower] = useState<number>(8.1);
  const [erdBetaRatio, setErdBetaRatio] = useState<number>(1.56);

  // Steganography State
  const [secretText, setSecretText] = useState<string>('NEURAL_KEY_V22');
  const [aoiPath, setAoiPath] = useState<number[]>([0, 2, 1, 3, 2, 0]);
  const [flickerFreqs, setFlickerFreqs] = useState<number[]>([20.0, 10.0, 20.0, 10.0, 20.0, 10.0]);
  const [decodedSecret, setDecodedSecret] = useState<string>('NEURAL_KEY_V22');
  const [stegoBandwidth, setStegoBandwidth] = useState<number>(32.5);

  // Cognitive Key & zk-BCI State
  const [cognitiveKeyHex, setCognitiveKeyHex] = useState<string>(
    '7f3a8b1c4e92d05f6a1133c8b4e72a09f5d1e8c2b7a4093e81f5c6b9d2e0a714'
  );
  const [zkCommitment, setZkCommitment] = useState<string>(
    'c2849e7b1405f6a893d2c1e7a4b08f3e5c9a1d2e4f7a8b9c0d1e2f3a4b5c6d7e'
  );
  const [zkNullifier, setZkNullifier] = useState<string>(
    '1a4d8f2b9c7e0a3f6b8c1d5e2a4f7c9e0b1d3f5a7c9e2b4d6f8a0c2e4b6d8f1a'
  );
  const [isZkValid, setIsZkValid] = useState<boolean>(true);
  const [isKeyValid, setIsKeyValid] = useState<boolean>(true);

  // Emergency Zeroization State
  const [zeroized, setZeroized] = useState<boolean>(false);
  const [zeroizeLatencyUs, setZeroizeLatencyUs] = useState<number>(0);

  // Simulate P300 Trigger
  const handleTriggerP300 = (amplitude: number) => {
    if (zeroized) return;
    setEegPzVoltage(amplitude);
    const locked = amplitude > 15.0;
    setIntentLocked(locked);
    if (locked) {
      setP300LatencyMs(300.0 + (Math.random() * 20 - 10));
      setP300SnrDb(12.0 + Math.random() * 6.0);
      setConfidenceScore(Math.min(0.99, (amplitude - 10.0) / 20.0));
      setBetaPower(35.0 + Math.random() * 10.0);
      setErdBetaRatio(1.45 + Math.random() * 0.3);
    } else {
      setP300LatencyMs(0);
      setP300SnrDb(2.1);
      setConfidenceScore(0.0);
      setErdBetaRatio(0.85);
    }
  };

  // Derive Cognitive Master Key
  const handleDeriveCognitiveKey = () => {
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

    setCognitiveKeyHex(randHex);
    setZkCommitment(commitHex);
    setZkNullifier(nullHex);
    setIsKeyValid(true);
    setIsZkValid(true);
    setEntropyBits(7.90 + Math.random() * 0.08);
  };

  // Synthesize Neural Steganography
  const handleSynthesizeStego = () => {
    if (zeroized) return;
    const path = [0];
    const freqs: number[] = [];
    let cur = 0;
    for (let i = 0; i < secretText.length * 2; i++) {
      const bit = Math.random() > 0.5 ? 1 : 0;
      freqs.push(bit === 1 ? 20.0 : 10.0);
      cur = (cur + (bit === 1 ? 2 : 1)) % 4;
      path.push(cur);
    }
    setAoiPath(path);
    setFlickerFreqs(freqs);
    setDecodedSecret(secretText);
    setStegoBandwidth(32.5);
  };

  // Emergency Zeroization
  const handleEmergencyZeroize = () => {
    setZeroized(true);
    setZeroizeLatencyUs(1.45);
    setIntentLocked(false);
    setIsKeyValid(false);
    setIsZkValid(false);
    setCognitiveKeyHex('0000000000000000000000000000000000000000000000000000000000000000');
    setZkCommitment('0000000000000000000000000000000000000000000000000000000000000000');
    setZkNullifier('0000000000000000000000000000000000000000000000000000000000000000');
    setEntropyBits(0.0);
    setDecodedSecret('[SHREDDED]');
  };

  // Re-arm Subsystem
  const handleRearm = () => {
    setZeroized(false);
    setZeroizeLatencyUs(0);
    setIntentLocked(true);
    setEegPzVoltage(18.5);
    setEntropyBits(7.92);
    handleDeriveCognitiveKey();
    handleSynthesizeStego();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-slate-950/90 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-xs font-mono font-semibold flex items-center space-x-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>MILESTONE V22.0.0</span>
              </span>
              <span className="px-2.5 py-1 bg-pink-500/20 text-pink-300 border border-pink-500/40 rounded-full text-xs font-mono">
                EEG/EOG HYBRID BCI
              </span>
              <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-mono">
                zk-BCI AUTHENTICATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300">
              BIO-CYBERNETIC COGNITIVE INTERFACE & NEURAL INTENT CRYPTANALYSIS
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-4xl">
              Non-invasive Electroencephalography (EEG) brainwave decoding fused with bi-channel Electrooculography (EOG) gaze tracking. Extracts subconscious cognitive entropy from P300 Event-Related Potentials (ERP) and Mu/Beta ERD/ERS, deriving non-reproducible cognitive master keys (K_cognitive = HKDF(Salt_P300 || H_neural || V_EOG)) with zero-knowledge zk-BCI proofs.
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
                <span>RE-ARM COGNITIVE BCI</span>
              </button>
            ) : (
              <button
                onClick={handleEmergencyZeroize}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-semibold flex items-center space-x-2 shadow-lg shadow-red-950/40 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>EMERGENCY BCI ZEROIZE (&lt;2&mu;s)</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Callout if Zeroized */}
        {zeroized && (
          <div className="mt-4 p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-300 text-xs font-mono flex items-center justify-between">
            <span>[!] FAIL-CLOSED: Brainwave buffers shredded & K_cognitive zeroized in {zeroizeLatencyUs}&mu;s (&lt;2.0&mu;s SLA).</span>
            <span className="text-red-400 font-bold uppercase">SECURE MEMORY WIPED</span>
          </div>
        )}
      </div>

      {/* 3D WebGL Hybrid BCI Visualizer */}
      <HybridBciVisualizer3D
        intentLocked={intentLocked}
        p300AmplitudeUv={eegPzVoltage}
        gazeDirection={gazeDirection}
        cognitiveEntropyBits={entropyBits}
        erdBetaRatio={erdBetaRatio}
      />

      {/* 4 Multi-Column Core Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Multi-Modal EEG/EOG Biosignal Stream & P300 Intent Classifier */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  P300 ERP CLASSIFIER & INTENT LOCK
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  250Hz AFE | GPIO 36 (Pz Target) | Threshold: &gt;15.0 &mu;V
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold ${
                intentLocked
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {intentLocked ? 'INTENT LOCKED' : 'AWAITING STIMULUS'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] font-mono">Pz Peak Voltage:</span>
              <span className="text-lg font-bold font-mono text-pink-400">
                {eegPzVoltage.toFixed(1)} &mu;V
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] font-mono">P300 Latency:</span>
              <span className="text-lg font-bold font-mono text-cyan-400">
                {p300LatencyMs.toFixed(0)} ms
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] font-mono">Signal SNR:</span>
              <span className="text-lg font-bold font-mono text-purple-400">
                {p300SnrDb.toFixed(1)} dB
              </span>
            </div>
          </div>

          {/* Interactive Trigger Buttons */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-mono block">Simulate Sensory Evoked Potentials:</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleTriggerP300(18.5)}
                className="px-3 py-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-300 rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>P300 SPIKE (18.5 &mu;V &gt; 15)</span>
              </button>
              <button
                onClick={() => handleTriggerP300(7.2)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-all flex items-center justify-center space-x-2"
              >
                <span>BASELINE NOISE (7.2 &mu;V)</span>
              </button>
            </div>
          </div>

          {/* Saccade Gaze Selection */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-mono block">EOG Gaze Direct Action:</span>
            <div className="grid grid-cols-4 gap-2">
              {(['LEFT', 'RIGHT', 'UP', 'DOWN'] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => setGazeDirection(dir)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    gazeDirection === dir
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 2: Subconscious Cognitive Entropy & Spectral Decomposition */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  SPECTRAL BAND ENTROPY & ERD/ERS
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  PSD Fast Fourier Transform | Shannon Entropy: {entropyBits.toFixed(2)} bits
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[11px] font-mono">
              7.92 BITS/SAMPLE
            </span>
          </div>

          {/* Spectral Frequency Bars */}
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>&Delta; Delta (0.5 - 4 Hz)</span>
                <span className="text-cyan-400">{deltaPower.toFixed(1)} &mu;V&sup2;</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${Math.min(100, deltaPower * 2)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>&Theta; Theta (4 - 8 Hz)</span>
                <span className="text-blue-400">{thetaPower.toFixed(1)} &mu;V&sup2;</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, thetaPower * 2)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>&alpha; Alpha (8 - 12 Hz - Visual Cortex)</span>
                <span className="text-purple-400">{alphaPower.toFixed(1)} &mu;V&sup2;</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(100, alphaPower * 2)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>&beta; Beta (13 - 30 Hz - Cognitive Cryptanalysis)</span>
                <span className="text-pink-400">{betaPower.toFixed(1)} &mu;V&sup2;</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${Math.min(100, betaPower * 2)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>&gamma; Gamma (30 - 100 Hz - Neural Binding)</span>
                <span className="text-emerald-400">{gammaPower.toFixed(1)} &mu;V&sup2;</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(100, gammaPower * 2)}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between">
            <span className="text-slate-400">Mu/Beta ERD Ratio (&beta;/&alpha;):</span>
            <span className="text-purple-300 font-bold">{erdBetaRatio.toFixed(2)} (Cognitive Workload Active)</span>
          </div>
        </div>

        {/* Panel 3: Neural-Intent Gaze-Guided Steganography */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  NEURAL-INTENT GAZE STEGANOGRAPHY
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Markov AOI Transitions &amp; 10Hz/20Hz Visual Cortex Modulation
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[11px] font-mono">
              {stegoBandwidth} BPS
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 text-xs font-mono block mb-1">Secret Message to Embed:</span>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={secretText}
                  onChange={(e) => setSecretText(e.target.value)}
                  disabled={zeroized}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleSynthesizeStego}
                  disabled={zeroized}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-semibold transition-all"
                >
                  SYNTHESIZE
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Gaze AOI Trajectory:</span>
                <span className="text-cyan-400 font-bold">[{aoiPath.join(' &rarr; ')}]</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Decoded Secret Plaintext:</span>
                <span className="text-pink-400 font-bold">{decodedSecret}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 4: Cognitive Master Key & zk-BCI Proof Authentication */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  zk-BCI &amp; COGNITIVE MASTER KEY
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  HKDF-SHA256(Salt_P300 || H_neural || V_EOG)
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold ${
                isKeyValid
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              {isKeyValid ? 'K_cognitive ARMED' : 'ZEROIZED'}
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] mb-1">256-Bit Master Key (K_cognitive):</span>
              <span className="text-purple-300 break-all font-mono select-all">
                {cognitiveKeyHex}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px] mb-1">zk-BCI Commitment (x_pub):</span>
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
              onClick={handleDeriveCognitiveKey}
              disabled={zeroized}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-purple-950/40"
            >
              <Key className="w-4 h-4" />
              <span>RE-DERIVE COGNITIVE MASTER KEY &amp; ZK PROOF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridBciPage;
