import React, { useState, useEffect } from 'react';
import {
  Orbit,
  Cpu,
  ShieldAlert,
  GitBranch,
  Play,
  RotateCw,
  Zap,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal
} from 'lucide-react';
import OrbitalPhotonicVisualizer from '../components/OrbitalPhotonicVisualizer';
import { api } from '../services/api';
import {
  FSOLinkBudget,
  OrbitalConstellationTelemetry,
  PhotonicMZIResult,
  PhotonicMeshResult,
  TopologicalBraidResult,
  ASTMutationResult
} from '../types';

export const OrbitalSpacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ORBITAL' | 'PHOTONIC' | 'TOPOLOGICAL' | 'MUTATOR'>('ORBITAL');
  const [loading, setLoading] = useState(false);

  // 1. Orbital FSO Link Budget State
  const [fsoDistanceKm, setFsoDistanceKm] = useState(1000.0);
  const [fsoTxPowerDbm, setFsoTxPowerDbm] = useState(30.0);
  const [fsoLinkResult, setFsoLinkResult] = useState<FSOLinkBudget | null>(null);
  const [constellation, setConstellation] = useState<OrbitalConstellationTelemetry | null>(null);

  // 2. Photonic TPU State
  const [thetaRad, setThetaRad] = useState(1.5708); // pi / 2
  const [phiRad, setPhiRad] = useState(0.7854);     // pi / 4
  const [mziResult, setMziResult] = useState<PhotonicMZIResult | null>(null);
  const [meshResult, setMeshResult] = useState<PhotonicMeshResult | null>(null);

  // 3. Topological Braiding State
  const [generatorI, setGeneratorI] = useState(1);
  const [strands, setStrands] = useState(4);
  const [braidResult, setBraidResult] = useState<TopologicalBraidResult | null>(null);

  // 4. AST Protocol Mutator State
  const [ciphertextHex, setCiphertextHex] = useState('0e0a1616196a0b1c0b1a');
  const [seedCode, setSeedCode] = useState('output = input_byte ^ 0x5A');
  const [generations, setGenerations] = useState(5);
  const [targetHint, setTargetHint] = useState('CIPHERON');
  const [mutationResult, setMutationResult] = useState<ASTMutationResult | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [cTelem, fsoBudget, mziInit, braidInit] = await Promise.all([
        api.getOrbitalConstellation(),
        api.calculateFSOLinkBudget({ distance_km: 1000.0 }),
        api.executePhotonicMZITransform(1.5708, 0.7854, 1.0, 0.0),
        api.verifyTopologicalBraid(1, 4)
      ]);
      setConstellation(cTelem);
      setFsoLinkResult(fsoBudget);
      setMziResult(mziInit);
      setBraidResult(braidInit);
    } catch (err) {
      console.error('Failed to load initial V8 data', err);
    }
  };

  const handleCalculateFSOLink = async () => {
    setLoading(true);
    try {
      const res = await api.calculateFSOLinkBudget({
        distance_km: fsoDistanceKm,
        tx_power_dbm: fsoTxPowerDbm
      });
      setFsoLinkResult(res);
    } catch (err) {
      console.error('FSO link calculation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteMZITransform = async () => {
    setLoading(true);
    try {
      const [mzi, mesh] = await Promise.all([
        api.executePhotonicMZITransform(thetaRad, phiRad, 1.0, 0.0),
        api.simulatePhotonicTensorMesh(4, [1.0, 0.5, -0.5, 0.2])
      ]);
      setMziResult(mzi);
      setMeshResult(mesh);
    } catch (err) {
      console.error('Photonic TPU transform failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBraid = async () => {
    setLoading(true);
    try {
      const res = await api.verifyTopologicalBraid(generatorI, strands);
      setBraidResult(res);
    } catch (err) {
      console.error('Topological braid verification failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvolveAST = async () => {
    setLoading(true);
    try {
      const res = await api.evolveASTProtocol({
        ciphertext_hex: ciphertextHex,
        seed_code: seedCode,
        generations,
        population_size: 6,
        target_hint: targetHint || undefined
      });
      setMutationResult(res);
    } catch (err) {
      console.error('AST protocol evolution failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
              <Orbit className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Autonomous Space Mesh & Photonic Resilience
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  V8.0.0
                </span>
              </div>
              <p className="text-sm text-slate-400">
                LEO Satellite 100Gbps FSO Mesh • Mach-Zehnder Photonic TPU (&lt;0.1pJ/op) • Anyon Topological Braiding • Autonomous AST Mutator
              </p>
            </div>
          </div>
        </div>

        {/* Global Metric Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-sky-950/70 border border-sky-500/40 text-sky-300">
            FSO ORBIT: 8 CUBE-SATS
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-purple-950/70 border border-purple-500/40 text-purple-300">
            P-TPU: 780ps / 0.082pJ
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
            TOPOLOGICAL: INVARIANT
          </div>
        </div>
      </div>

      {/* 3D WebGL Master Visualizer Component */}
      <OrbitalPhotonicVisualizer
        mode={activeTab === 'PHOTONIC' ? 'PHOTONIC_MZI_WAVEGUIDE' : 'ORBITAL_CONSTELLATION'}
        theta={thetaRad}
        phi={phiRad}
        fsoThroughputGbps={100}
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={() => setActiveTab('ORBITAL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs transition-all ${
            activeTab === 'ORBITAL'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          LEO FSO Satellite Constellation
        </button>

        <button
          onClick={() => setActiveTab('PHOTONIC')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs transition-all ${
            activeTab === 'PHOTONIC'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Silicon Photonic TPU (MZI Mesh)
        </button>

        <button
          onClick={() => setActiveTab('TOPOLOGICAL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs transition-all ${
            activeTab === 'TOPOLOGICAL'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Topological Quantum Anyons
        </button>

        <button
          onClick={() => setActiveTab('MUTATOR')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs transition-all ${
            activeTab === 'MUTATOR'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Autonomous AST Protocol Mutator
        </button>
      </div>

      {/* TAB 1: ORBITAL SATELLITE CONSTELLATION & FSO LINK BUDGET */}
      {activeTab === 'ORBITAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Link Margin Calculator */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sky-400 font-mono text-sm font-bold">
              <Zap className="w-4 h-4" />
              Free-Space Optical Link Margin Math (Section 2.1)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates coherent 1550nm laser link budget: <br />
              <code className="text-sky-300">Link Margin = P_t + G_t + G_r - L_p - L_a - P_req</code>
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400">Slant Distance (km): {fsoDistanceKm} km</label>
                <input
                  type="range"
                  min="300"
                  max="4000"
                  step="50"
                  value={fsoDistanceKm}
                  onChange={(e) => setFsoDistanceKm(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 mt-1"
                />
              </div>

              <div>
                <label className="text-slate-400">Laser Transmitter Power: {fsoTxPowerDbm} dBm (1W)</label>
                <input
                  type="range"
                  min="20"
                  max="45"
                  step="1"
                  value={fsoTxPowerDbm}
                  onChange={(e) => setFsoTxPowerDbm(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 mt-1"
                />
              </div>

              <button
                onClick={handleCalculateFSOLink}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Recalculate FSO Link Margin
              </button>
            </div>

            {fsoLinkResult && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/30 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Path Loss (L_p):</span>
                  <span className="text-sky-300 font-bold">{fsoLinkResult.path_loss_db} dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Received Optical Power:</span>
                  <span className="text-emerald-300 font-bold">{fsoLinkResult.received_power_dbm} dBm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Link Margin:</span>
                  <span className="text-amber-300 font-bold">+{fsoLinkResult.link_margin_db} dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Propagation Delay:</span>
                  <span className="text-purple-300 font-bold">{fsoLinkResult.propagation_latency_ms} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FSO Throughput:</span>
                  <span className="text-sky-400 font-bold">{fsoLinkResult.bandwidth_gbps} Gbps</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{fsoLinkResult.status}</span>
                </div>
              </div>
            )}
          </div>

          {/* Active Constellation Telemetry */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-mono text-sm font-bold">
                <Orbit className="w-4 h-4" />
                Active LEO Satellite Nodes (Constellation Telemetry)
              </div>
              <span className="text-xs font-mono text-slate-400">
                Global Sub-50ms Latency: <strong className="text-sky-300">38.4 ms</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {constellation?.satellites.map((sat) => (
                <div
                  key={sat.satellite_id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 transition-colors space-y-1.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sky-300 font-bold">{sat.satellite_id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {sat.laser_transceiver_status}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex justify-between">
                    <span>Altitude: {sat.orbit_altitude_km} km</span>
                    <span>Period: {sat.orbital_period_min} min</span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex justify-between">
                    <span>Sub-Sat: {sat.sub_satellite_latitude}°, {sat.sub_satellite_longitude}°</span>
                    <span className="text-purple-300">FSO Peers: 2</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SILICON PHOTONIC TPU & MZI MESH */}
      {activeTab === 'PHOTONIC' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MZI Phase Drivers */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-sm font-bold">
              <Cpu className="w-4 h-4" />
              MZI Electro-Optic Phase Drivers (Section 3.1 & 6.1)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drives phase shifters (<code className="text-purple-300">GPIO 25, 26</code>) to compute 2x2 optical unitary matrices at light-speed with &lt;0.1 pJ/op energy draw.
            </p>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-400">Phase Shift Theta (θ): {(thetaRad / Math.PI).toFixed(2)}π</label>
                <input
                  type="range"
                  min="0"
                  max="6.2832"
                  step="0.05"
                  value={thetaRad}
                  onChange={(e) => setThetaRad(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 mt-1"
                />
              </div>

              <div>
                <label className="text-slate-400">Phase Shift Phi (φ): {(phiRad / Math.PI).toFixed(2)}π</label>
                <input
                  type="range"
                  min="0"
                  max="6.2832"
                  step="0.05"
                  value={phiRad}
                  onChange={(e) => setPhiRad(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 mt-1"
                />
              </div>

              <button
                onClick={handleExecuteMZITransform}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Fire MZI Unitary Transformation
              </button>
            </div>

            {mziResult && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Energy Per Op:</span>
                  <span className="text-purple-300 font-bold">{mziResult.energy_dissipation_pj} pJ/op</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Propagation Delay:</span>
                  <span className="text-sky-300 font-bold">{mziResult.propagation_latency_ps} ps (&lt;1ns)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Optical Power:</span>
                  <span className="text-emerald-300 font-bold">{mziResult.total_power_conserved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transmission Efficiency:</span>
                  <span className="text-amber-300 font-bold">{mziResult.efficiency_rating}</span>
                </div>
              </div>
            )}
          </div>

          {/* Unitary Transfer Matrix & Multi-Cell Mesh */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-sm font-bold">
              <Layers className="w-4 h-4" />
              Clemens-Reck MZI Triangular Optical Mesh (4x4 Tensor Unit)
            </div>

            {mziResult && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs space-y-2">
                <div className="text-slate-400 font-bold">2x2 Unitary Transfer Matrix [U_MZI]:</div>
                <div className="grid grid-cols-2 gap-2 text-purple-300 p-2 bg-slate-900/50 rounded-lg">
                  <div>[{mziResult.output_amplitudes[0].real} + {mziResult.output_amplitudes[0].imag}i]</div>
                  <div>[{mziResult.output_amplitudes[1].real} + {mziResult.output_amplitudes[1].imag}i]</div>
                </div>
                <div className="flex items-center gap-4 text-slate-400 pt-2">
                  <span>Intensities: I₁={mziResult.optical_intensities[0]}, I₂={mziResult.optical_intensities[1]}</span>
                </div>
              </div>
            )}

            {meshResult && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-400 font-bold">
                  <span>Multi-Cell Optical Mesh Output ({meshResult.mesh_dimension}):</span>
                  <span className="text-emerald-400">{meshResult.computation_speed}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sky-300 p-2 bg-slate-900/50 rounded-lg">
                  {meshResult.output_vector.map((val, idx) => (
                    <div key={idx} className="text-center">Y[{idx}] = {val}</div>
                  ))}
                </div>
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>MZI Elements: {meshResult.mzi_element_count} cells</span>
                  <span>Total Mesh Energy: {meshResult.total_energy_pj} pJ</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TOPOLOGICAL BRAIDING & QUANTUM ANYONS */}
      {activeTab === 'TOPOLOGICAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold">
              <ShieldAlert className="w-4 h-4" />
              Non-Abelian Anyon Braid Operators (Section 4.1)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verifies the fundamental Yang-Baxter braid equation: <br />
              <code className="text-emerald-300">B_i * B_(i+1) * B_i == B_(i+1) * B_i * B_(i+1)</code>
            </p>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-400">Generator Index (i): {generatorI}</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={generatorI}
                  onChange={(e) => setGeneratorI(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <label className="text-slate-400">Total Strands: {strands}</label>
                <input
                  type="number"
                  min="3"
                  max="12"
                  value={strands}
                  onChange={(e) => setStrands(parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1"
                />
              </div>

              <button
                onClick={handleVerifyBraid}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Verify Braid Group Invariance
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Topological Quantum Resistance Verification
            </div>

            {braidResult && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">LHS Braid Word:</span>
                    <span className="text-emerald-300 font-bold">{braidResult.lhs_braid_word}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RHS Braid Word:</span>
                    <span className="text-emerald-300 font-bold">{braidResult.rhs_braid_word}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">LHS Strand Permutation:</span>
                    <span className="text-sky-300 font-bold">[{braidResult.lhs_permutation.join(', ')}]</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RHS Strand Permutation:</span>
                    <span className="text-sky-300 font-bold">[{braidResult.rhs_permutation.join(', ')}]</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Yang-Baxter Relation Verified:</span>
                    <span className="text-emerald-400 font-bold">{braidResult.relation_holds ? 'YES (TRUE)' : 'FALSE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quantum Decoherence Resistance:</span>
                    <span className="text-purple-300 font-bold">{braidResult.decoherence_resistance_score * 100}% (IMMUNE)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Topological Protection:</span>
                    <span className="text-amber-300 font-bold">{braidResult.quantum_fault_tolerance}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AUTONOMOUS AST PROTOCOL MUTATOR */}
      {activeTab === 'MUTATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-bold">
              <Terminal className="w-4 h-4" />
              Autonomous AST Grammar Mutation
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically mutates AST syntax trees and candidate byte solvers for unknown ciphers.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400">Target Ciphertext (Hex):</label>
                <input
                  type="text"
                  value={ciphertextHex}
                  onChange={(e) => setCiphertextHex(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 mt-1"
                />
              </div>

              <div>
                <label className="text-slate-400">Seed Grammar Code:</label>
                <input
                  type="text"
                  value={seedCode}
                  onChange={(e) => setSeedCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sky-300 mt-1"
                />
              </div>

              <div>
                <label className="text-slate-400">Target Plaintext Hint (optional):</label>
                <input
                  type="text"
                  value={targetHint}
                  onChange={(e) => setTargetHint(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1"
                />
              </div>

              <div>
                <label className="text-slate-400">Generations: {generations}</label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={generations}
                  onChange={(e) => setGenerations(parseInt(e.target.value))}
                  className="w-full accent-amber-400 mt-1"
                />
              </div>

              <button
                onClick={handleEvolveAST}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Evolve AST Protocol Solvers
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-bold">
              <GitBranch className="w-4 h-4" />
              Evolved Grammar & Compilation Candidate
            </div>

            {mutationResult ? (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Best Evolved AST Solver:</span>
                    <span className="text-amber-300 font-bold">{mutationResult.best_evolved_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fitness Score:</span>
                    <span className="text-emerald-400 font-bold">{(mutationResult.best_fitness_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sample Decrypted Text:</span>
                    <span className="text-sky-300 font-bold">"{mutationResult.sample_decrypted_preview}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Pipeline:</span>
                    <span className="text-purple-300 font-bold">{mutationResult.compilation_target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Evolution Status:</span>
                    <span className="text-amber-400 font-bold">{mutationResult.autonomous_status}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-slate-400 font-bold">Generational Fitness Progress:</span>
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {mutationResult.generation_history.map((h) => (
                      <div key={h.generation} className="p-2 rounded bg-slate-900 text-center">
                        <div className="text-[10px] text-slate-400">Gen {h.generation}</div>
                        <div className="text-xs text-amber-300 font-bold">{(h.best_fitness * 100).toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-slate-500 font-mono text-xs">
                Launch AST Evolution to begin genetic synthesis of candidate cipher solvers.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrbitalSpacePage;
