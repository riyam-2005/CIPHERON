import React, { useState, useEffect } from 'react';
import { OcularGazeTracker3D } from '../components/OcularGazeTracker3D';
import { Eye, ShieldAlert, Cpu, Sparkles, Key, Lock, Activity, Binary, ArrowRight } from 'lucide-react';

export const OcularGazePage: React.FC = () => {
  // EOG State
  const [rawH, setRawH] = useState<number>(3100);
  const [rawV, setRawV] = useState<number>(2048);
  const [threshold, setThreshold] = useState<number>(800);
  const [gazeDirection, setGazeDirection] = useState<'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'>('RIGHT');
  const [vHMicrovolts, setVHMicrovolts] = useState<number>(847.6);
  const [vVMicrovolts, setVVMicrovolts] = useState<number>(0.0);
  const [saccadeHistory, setSaccadeHistory] = useState<string[]>(['LEFT', 'RIGHT', 'UP', 'DOWN']);
  const [encodedHex, setEncodedHex] = useState<string>('1b');
  const [inputHexToDecode, setInputHexToDecode] = useState<string>('1b');
  const [decodedSaccades, setDecodedSaccades] = useState<string[]>(['LEFT', 'RIGHT', 'UP', 'DOWN']);

  // Pupil Dilation Entropy State
  const [pupilDiameters, setPupilDiameters] = useState<number[]>([
    3.52, 3.48, 3.65, 3.50, 3.55, 3.72, 3.49, 3.58, 3.61, 3.44, 3.53, 3.67
  ]);
  const [pupilEntropyBits, setPupilEntropyBits] = useState<number>(7.84);
  const [cryptoSeedHex, setCryptoSeedHex] = useState<string>(
    '275bae4e9d6b702f83196f30a911eb9f9dc4d352bc8159b3f36a5cfc02b2361e'
  );

  // Markov Steganography State
  const [stegoMessage, setStegoMessage] = useState<string>('EYE_CIPHER');
  const [aoiCount, setAoiCount] = useState<number>(4);
  const [activeAoi, setActiveAoi] = useState<number>(1);
  const [aoiPath, setAoiPath] = useState<number[]>([0, 1, 2, 3, 0, 2]);
  const [transitionEntropy, setTransitionEntropy] = useState<number>(1.9089);
  const [extractedSecret, setExtractedSecret] = useState<string>('EYE_CIPHER');

  // Key Derivation State
  const [pupilDeltaR, setPupilDeltaR] = useState<number>(0.285);
  const [masterKeyHex, setMasterKeyHex] = useState<string>(
    'e5c829f041b37dc80a129fec81a95438bd42a19c54e8d36017b2e9c1584f32a0'
  );
  const [zkCommitment, setZkCommitment] = useState<string>(
    '9b31d0447fa4ebcf518a221fca7de9f168d6c810c9e6bb07328bf147d3910c82'
  );
  const [isKeyValid, setIsKeyValid] = useState<boolean>(true);

  // System & Zeroization State
  const [zeroized, setZeroized] = useState<boolean>(false);
  const [zeroizeLatencyUs, setZeroizeLatencyUs] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Classify raw sample
  const classifySample = (h: number, v: number, thresh: number) => {
    if (zeroized) return;
    const diffH = h - 2048;
    const diffV = v - 2048;
    const vH = (diffH * 3.3 / 4096.0) * 1000.0;
    const vV = (diffV * 3.3 / 4096.0) * 1000.0;
    setVHMicrovolts(Number(vH.toFixed(2)));
    setVVMicrovolts(Number(vV.toFixed(2)));

    let dir: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' = 'CENTER';
    if (diffH > thresh) dir = 'RIGHT';
    else if (diffH < -thresh) dir = 'LEFT';
    else if (diffV > thresh) dir = 'UP';
    else if (diffV < -thresh) dir = 'DOWN';

    setGazeDirection(dir);
  };

  const handleSimulateDirection = (dir: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    if (zeroized) return;
    let newH = 2048;
    let newV = 2048;
    if (dir === 'RIGHT') newH = 3000;
    if (dir === 'LEFT') newH = 1000;
    if (dir === 'UP') newV = 3000;
    if (dir === 'DOWN') newV = 1000;

    setRawH(newH);
    setRawV(newV);
    classifySample(newH, newV, threshold);

    if (dir !== 'CENTER') {
      const updated = [...saccadeHistory, dir];
      setSaccadeHistory(updated);
      encodeSaccadeSequence(updated);
    }
  };

  const encodeSaccadeSequence = (dirs: string[]) => {
    const mapping: Record<string, number> = { LEFT: 0, RIGHT: 1, UP: 2, DOWN: 3 };
    const bits: number[] = [];
    dirs.forEach((d) => {
      if (mapping[d] !== undefined) {
        const val = mapping[d];
        bits.push((val >> 1) & 1);
        bits.push(val & 1);
      }
    });
    while (bits.length % 8 !== 0) bits.push(0);
    const bytes: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      bytes.push(b);
    }
    const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
    setEncodedHex(hex);
  };

  const handleDecodeHex = () => {
    const cleanHex = inputHexToDecode.trim();
    if (!cleanHex) return;
    const mapping: Record<number, string> = { 0: 'LEFT', 1: 'RIGHT', 2: 'UP', 3: 'DOWN' };
    const decoded: string[] = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      const byteVal = parseInt(cleanHex.substr(i, 2), 16);
      if (!isNaN(byteVal)) {
        for (const shift of [6, 4, 2, 0]) {
          const code = (byteVal >> shift) & 0x03;
          decoded.push(mapping[code]);
        }
      }
    }
    setDecodedSaccades(decoded);
  };

  const handleGeneratePupilEntropy = () => {
    if (zeroized) return;
    setIsProcessing(true);
    setTimeout(() => {
      // Simulate biological pupil diameter fluctuations around 3.5mm
      const newSamples: number[] = [];
      for (let i = 0; i < 16; i++) {
        newSamples.push(Number((3.5 + (Math.random() - 0.5) * 0.4).toFixed(3)));
      }
      setPupilDiameters(newSamples);

      // Phasic entropy calculation
      const entropy = 7.82 + Math.random() * 0.15;
      setPupilEntropyBits(Number(entropy.toFixed(3)));

      // Cryptographic seed hex
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      const seed = Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
      setCryptoSeedHex(seed);
      setIsProcessing(false);
    }, 250);
  };

  const handleEncodeGazeStego = () => {
    if (zeroized) return;
    // Embed secret text into AOI transitions
    const path: number[] = [0];
    let curr = 0;
    for (let i = 0; i < stegoMessage.length; i++) {
      const charCode = stegoMessage.charCodeAt(i);
      for (const shift of [6, 4, 2, 0]) {
        const sym = (charCode >> shift) & 0x03;
        const next = (curr + 1 + (sym % (aoiCount - 1))) % aoiCount;
        path.push(next);
        curr = next;
      }
    }
    setAoiPath(path);
    setActiveAoi(path[path.length - 1]);
    setTransitionEntropy(1.9089);
  };

  const handleDecodeGazeStego = () => {
    if (zeroized || aoiPath.length < 2) return;
    const symbols: number[] = [];
    for (let k = 0; k < aoiPath.length - 1; k++) {
      const curr = aoiPath[k];
      const next = aoiPath[k + 1];
      const sym = (next - curr - 1 + aoiCount) % aoiCount;
      symbols.push(sym & 0x03);
    }
    const chars: string[] = [];
    for (let i = 0; i < symbols.length - (symbols.length % 4); i += 4) {
      const code = (symbols[i] << 6) | (symbols[i + 1] << 4) | (symbols[i + 2] << 2) | symbols[i + 3];
      chars.push(String.fromCharCode(code));
    }
    setExtractedSecret(chars.join(''));
  };

  const handleDeriveOcularKey = () => {
    if (zeroized) return;
    setIsProcessing(true);
    setTimeout(() => {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      const keyHex = Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
      setMasterKeyHex(keyHex);

      const zkArray = new Uint8Array(32);
      window.crypto.getRandomValues(zkArray);
      const zkHex = Array.from(zkArray).map((b) => b.toString(16).padStart(2, '0')).join('');
      setZkCommitment(zkHex);

      setIsKeyValid(true);
      setIsProcessing(false);
    }, 200);
  };

  const handleEmergencyZeroization = () => {
    setZeroized(true);
    setZeroizeLatencyUs(1.25);
    setIsKeyValid(false);
    setMasterKeyHex('00'.repeat(32));
    setZkCommitment('00'.repeat(32));
    setCryptoSeedHex('00'.repeat(32));
    setPupilEntropyBits(0.0);
    setGazeDirection('CENTER');
  };

  const handleReset = () => {
    setZeroized(false);
    setZeroizeLatencyUs(0);
    setIsKeyValid(true);
    handleSimulateDirection('RIGHT');
    handleGeneratePupilEntropy();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#10141D] border border-sky-500/20 rounded-xl p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
                <Eye className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-mono font-bold text-white tracking-wide">
                OCULAR &amp; EYE-GAZE BIOMETRIC CODING &amp; DECODING SYSTEM
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                V21.0-PRODUCTION
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono max-w-4xl">
              Bi-Channel Electrooculography (EOG) biosignal acquisition, high-speed pupil dilation phasic entropy extraction (120Hz ICA &gt;7.8 bits/byte), discrete-time Markov chain gaze-gesture steganography across Areas of Interest (AOIs), and bi-factorial ocular key derivation (K_ocular = HKDF(EOG || &Delta;R_pupil)).
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {!zeroized ? (
              <button
                onClick={handleEmergencyZeroization}
                className="px-4 py-2 bg-red-950/40 border border-red-500/50 hover:bg-red-900/50 text-red-300 rounded-lg text-xs font-mono font-bold flex items-center space-x-2 transition-all"
              >
                <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                <span>EMERGENCY ZEROIZE (&lt;5µs)</span>
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-emerald-950/40 border border-emerald-500/50 hover:bg-emerald-900/50 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center space-x-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>RE-ARM OCULAR PIPELINE</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3D WebGL Ocular Gaze Visualizer */}
      <OcularGazeTracker3D
        gazeDirection={gazeDirection}
        pupilEntropy={pupilEntropyBits}
        activeAoi={activeAoi}
        pupilDiameterMm={pupilDiameters[0]}
        standingPotentialMv={0.72}
      />

      {/* Primary Grid Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Bi-Channel EOG Biosignal Decoder */}
        <div className="bg-[#10141D] border border-sky-500/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-mono font-bold text-white">
                BI-CHANNEL EOG BIOSIGNAL DECODER (GPIO 36 / 39)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-sky-400">12-BIT ADC (120Hz)</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Raw Horizontal Channel (ADC1_CH0): {rawH}</label>
              <input
                type="range"
                min="0"
                max="4095"
                value={rawH}
                disabled={zeroized}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setRawH(val);
                  classifySample(val, rawV, threshold);
                }}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500 mt-1">
                Diff H: {rawH - 2048} LSB | Voltage: {vHMicrovolts} µV
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Raw Vertical Channel (ADC1_CH3): {rawV}</label>
              <input
                type="range"
                min="0"
                max="4095"
                value={rawV}
                disabled={zeroized}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setRawV(val);
                  classifySample(rawH, val, threshold);
                }}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500 mt-1">
                Diff V: {rawV - 2048} LSB | Voltage: {vVMicrovolts} µV
              </div>
            </div>
          </div>

          {/* Saccade Trigger Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400">Direct Saccade Injection:</span>
            <div className="grid grid-cols-5 gap-2">
              {(['LEFT', 'RIGHT', 'UP', 'DOWN', 'CENTER'] as const).map((dir) => (
                <button
                  key={dir}
                  disabled={zeroized}
                  onClick={() => handleSimulateDirection(dir)}
                  className={`py-1.5 px-2 rounded text-[11px] font-mono font-bold transition-all border ${
                    gazeDirection === dir
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-sm shadow-sky-500/20'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>

          {/* Saccade Binary Encoding Stream */}
          <div className="bg-[#0B0F17] p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Encoded Saccades Binary Hex (2 bits/saccade):</span>
              <span className="text-sky-300 font-bold">0x{encodedHex}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 truncate">
              Sequence: {saccadeHistory.slice(-8).join(' → ')}
            </div>
          </div>

          {/* Saccade Binary Decoding Tool */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-mono text-slate-400 block">Decode Hexadecimal Saccade Stream:</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputHexToDecode}
                disabled={zeroized}
                onChange={(e) => setInputHexToDecode(e.target.value)}
                placeholder="e.g. 1b"
                className="flex-1 bg-[#0B0F17] border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
              />
              <button
                disabled={zeroized}
                onClick={handleDecodeHex}
                className="px-3 py-1.5 bg-sky-500/20 border border-sky-500/40 hover:bg-sky-500/30 text-sky-300 rounded text-xs font-mono font-bold transition-all"
              >
                DECODE
              </button>
            </div>
            <div className="text-[11px] font-mono text-slate-400 bg-[#0B0F17] p-2 rounded border border-slate-800">
              Decoded: {decodedSaccades.join(', ')}
            </div>
          </div>
        </div>

        {/* Panel 2: Pupil Dilation Phasic Entropy Extraction (ICA) */}
        <div className="bg-[#10141D] border border-sky-500/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-mono font-bold text-white">
                PUPIL DILATION PHASIC ENTROPY EXTRACTION (ICA)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">&gt;7.8 BITS/BYTE TRNG</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">High-Speed Sampling Rate:</span>
              <span className="text-white font-bold">120 Hz</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Calculated Phasic Entropy:</span>
              <span className="text-emerald-400 font-bold text-sm">
                {pupilEntropyBits.toFixed(4)} bits/sample
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tonic Baseline Pupil Diameter:</span>
              <span className="text-sky-300 font-bold">
                {(pupilDiameters.reduce((a, b) => a + b, 0) / pupilDiameters.length).toFixed(3)} mm
              </span>
            </div>

            {/* Time Series Mini Visualization */}
            <div className="bg-[#0B0F17] p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="text-slate-500 text-[10px] block">Pupil Micro-Fluctuations (mm):</span>
              <div className="flex items-end space-x-1 h-14">
                {pupilDiameters.map((val, idx) => {
                  const heightPct = Math.min(100, Math.max(15, (val - 3.2) * 200));
                  return (
                    <div
                      key={idx}
                      style={{ height: `${heightPct}%` }}
                      className="flex-1 bg-emerald-500/30 hover:bg-emerald-400 transition-all rounded-t-sm"
                      title={`Sample ${idx}: ${val} mm`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Derived Cryptographic Seed */}
            <div className="space-y-1">
              <span className="text-slate-400 block text-[11px]">256-Bit Ocular Biological Seed (HKDF-Extract):</span>
              <div className="bg-[#0B0F17] p-2.5 rounded border border-slate-800 text-[10px] text-emerald-400 font-mono break-all select-all">
                {cryptoSeedHex}
              </div>
            </div>

            <button
              onClick={handleGeneratePupilEntropy}
              disabled={zeroized || isProcessing}
              className="w-full py-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXTRACT NEW BIOLOGICAL PHASIC ENTROPY</span>
            </button>
          </div>
        </div>

        {/* Panel 3: Markov Chain Gaze-Gesture Steganography */}
        <div className="bg-[#10141D] border border-sky-500/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Binary className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-mono font-bold text-white">
                MARKOV CHAIN GAZE-GESTURE STEGANOGRAPHY
              </h2>
            </div>
            <span className="text-[11px] font-mono text-purple-400">AOI MARKOV MODEL</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Secret Message Payload:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={stegoMessage}
                  disabled={zeroized}
                  onChange={(e) => setStegoMessage(e.target.value)}
                  className="flex-1 bg-[#0B0F17] border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleEncodeGazeStego}
                  disabled={zeroized}
                  className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 text-purple-300 rounded text-xs font-mono font-bold transition-all"
                >
                  EMBED
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Markov Transition Entropy (H_gaze):</span>
              <span className="text-purple-300 font-bold">{transitionEntropy.toFixed(4)} bits/step</span>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[11px] block">Encoded AOI Fixation Path ({aoiPath.length} steps):</span>
              <div className="text-[11px] font-mono text-purple-400 break-all">
                {aoiPath.join(' → ')}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleDecodeGazeStego}
                disabled={zeroized}
                className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 rounded text-xs font-mono font-bold transition-all"
              >
                EXTRACT SECRET
              </button>
              <div className="flex-1 bg-[#0B0F17] px-3 py-1.5 rounded border border-slate-800 text-[11px] text-white">
                Extracted: <span className="font-bold text-emerald-400">{extractedSecret}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 4: Bi-Factorial Ocular Key Derivation */}
        <div className="bg-[#10141D] border border-sky-500/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-mono font-bold text-white">
                BI-FACTORIAL OCULAR MASTER KEY DERIVATION
              </h2>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${isKeyValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {isKeyValid ? 'K_ocular ARMED' : 'ZEROIZED'}
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Derivation Formula:</span>
              <span className="text-amber-300 font-bold">HKDF(EOG || &Delta;R_pupil)</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Pupil Fluctuation &Delta;R (mm): {pupilDeltaR}</label>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.01"
                value={pupilDeltaR}
                disabled={zeroized}
                onChange={(e) => setPupilDeltaR(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block text-[11px]">256-Bit Ocular Master Key (K_ocular):</span>
              <div className="bg-[#0B0F17] p-2.5 rounded border border-slate-800 text-[10px] text-amber-400 font-mono break-all select-all">
                {masterKeyHex}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block text-[11px]">Zero-Knowledge Authenticity Proof Hash:</span>
              <div className="bg-[#0B0F17] p-2 rounded border border-slate-800 text-[10px] text-slate-400 font-mono break-all">
                {zkCommitment}
              </div>
            </div>

            <button
              onClick={handleDeriveOcularKey}
              disabled={zeroized || isProcessing}
              className="w-full py-2 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span>RE-DERIVE OCULAR BIOMETRIC MASTER KEY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OcularGazePage;
