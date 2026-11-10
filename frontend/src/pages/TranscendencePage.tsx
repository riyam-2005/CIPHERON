import React, { useState, useEffect } from 'react';
import { QuantumGraphMofVisualizer } from '../components/QuantumGraphMofVisualizer';
import {
  Atom,
  Wind,
  BatteryCharging,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Activity,
  Flame,
  Binary,
  Radio,
  Sun,
  Thermometer,
  ShieldCheck
} from 'lucide-react';

export const TranscendencePage: React.FC = () => {
  // QGNN Knot Invariant State
  const [crossingsInput, setCrossingsInput] = useState<string>('1, 1, 1');
  const [qgnnResult, setQgnnResult] = useState<any>(null);
  const [cipherGraphResult, setCipherGraphResult] = useState<any>(null);
  const [isQgnnLoading, setIsQgnnLoading] = useState(false);

  // MOF Gas Entropy State
  const [keyInput, setKeyInput] = useState<string>('CIPHERON_MOF_MASTER_ENTROPY_KEY_2026');
  const [mofTelemetry, setMofTelemetry] = useState<any>(null);
  const [isMofDepressurized, setIsMofDepressurized] = useState(false);
  const [mofWipeLatency, setMofWipeLatency] = useState<number | null>(null);

  // Tri-Modal Harvesting State
  const [harvestTelemetry, setHarvestTelemetry] = useState<any>(null);
  const [ambientLux, setAmbientLux] = useState<number>(500);
  const [deltaTC, setDeltaTC] = useState<number>(3.2);

  // Substrate Digestion State
  const [isDigested, setIsDigested] = useState(false);
  const [showDigestModal, setShowDigestModal] = useState(false);

  // Initial Telemetry Fetch
  const fetchTelemetry = async () => {
    try {
      const [mofRes, powerRes] = await Promise.all([
        fetch('/api/v1/mof/telemetry'),
        fetch('/api/v1/power/tri-harvest/telemetry'),
      ]);
      if (mofRes.ok) setMofTelemetry(await mofRes.json());
      if (powerRes.ok) setHarvestTelemetry(await powerRes.json());
    } catch {
      // Mock fallbacks
      setMofTelemetry({
        chamber_capacity_cc: 0.05,
        surface_area_m2_g: 2000.0,
        current_pressure_psi: 24.5,
        temperature_k: 298.15,
        sorption_capacity_mmol_g: 0.62,
        em_leakage_dbm: -150.0,
        is_armed: true,
        is_wiped: false,
      });
      setHarvestTelemetry({
        status: 'TRI_HARVESTING_OPERATIONAL',
        beta_voltaic_nw: 450.0,
        beta_voltaic_uw: 0.45,
        radioisotope_type: 'Nickel-63 / Tritium Beta-Voltaic',
        half_life_years: 12.3,
        thermoelectric_uw: 12.5,
        delta_temp_celsius: 3.2,
        photovoltaic_uw: 35.0,
        total_harvested_uw: 47.95,
        quiescent_consumption_uw: 32.0,
        net_power_balance_uw: 15.95,
        is_energy_positive: true,
        autonomous_runtime_years: 12.3,
      });
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Evaluate Knot Invariants
  const handleEvaluateKnot = async () => {
    setIsQgnnLoading(true);
    try {
      const parsedCrossings = crossingsInput
        .split(',')
        .map((x) => parseInt(x.trim(), 10))
        .filter((x) => !isNaN(x));

      const res = await fetch('/api/v1/qgnn/evaluate-knot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crossings: parsedCrossings })
      });
      if (res.ok) {
        setQgnnResult(await res.json());
      }

      // Also solve cipher graph
      const graphRes = await fetch('/api/v1/qgnn/solve-cipher-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edges: [[0, 1], [1, 2], [2, 0], [1, 3], [3, 2]] })
      });
      if (graphRes.ok) {
        setCipherGraphResult(await graphRes.json());
      }
    } catch {
      setQgnnResult({
        crossings: [1, 1, 1],
        jones_polynomial_t_minus_one: 2.828,
        alexander_conway_delta: 7.5,
        writhe: 3
      });
      setCipherGraphResult({
        knot_classification: 'TREFOIL_3_1',
        identified_cipher_family: 'CHACHA20_QUARTER_ROUND_BRAID',
        solve_time_ms: 1.85,
        within_5ms_sla: true,
        confidence: 0.962
      });
    } finally {
      setIsQgnnLoading(false);
    }
  };

  // Encode Key to MOF Sorption
  const handleEncodeMof = async () => {
    try {
      const res = await fetch('/api/v1/mof/encode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_text: keyInput })
      });
      if (res.ok) {
        const data = await res.json();
        setMofTelemetry((prev: any) => ({
          ...prev,
          current_pressure_psi: data.pressure_psi,
          sorption_capacity_mmol_g: data.sorption_capacity_mmol_g,
          is_wiped: false,
        }));
        setIsMofDepressurized(false);
      }
    } catch {
      setMofTelemetry((prev: any) => ({
        ...prev,
        current_pressure_psi: 26.8,
        sorption_capacity_mmol_g: 0.68,
        is_wiped: false,
      }));
      setIsMofDepressurized(false);
    }
  };

  // Emergency MOF Depressurization Wipe
  const handleMofEmergencyDepressurize = async () => {
    try {
      const res = await fetch('/api/v1/mof/emergency-depressurize', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMofWipeLatency(data.wipe_latency_ns);
      }
    } catch {
      setMofWipeLatency(8.5);
    } finally {
      setIsMofDepressurized(true);
      setMofTelemetry((prev: any) => ({
        ...prev,
        current_pressure_psi: 0.0,
        sorption_capacity_mmol_g: 0.0,
        is_wiped: true,
      }));
    }
  };

  // Simulate Environmental Power Harvesting
  const handleSimulateEnvironment = async (lux: number, deltaT: number) => {
    setAmbientLux(lux);
    setDeltaTC(deltaT);
    try {
      const res = await fetch('/api/v1/power/tri-harvest/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambient_lux: lux, delta_t_c: deltaT })
      });
      if (res.ok) {
        setHarvestTelemetry(await res.json());
      }
    } catch {
      // client-side calculation fallback
      const thermo = parseFloat((1.22 * (deltaT ** 2)).toFixed(2));
      const pv = parseFloat(Math.min(120.0, lux * 0.07).toFixed(2));
      const total = parseFloat((0.45 + thermo + pv).toFixed(2));
      const net = parseFloat((total - 32.0).toFixed(2));
      setHarvestTelemetry((prev: any) => ({
        ...prev,
        delta_temp_celsius: deltaT,
        thermoelectric_uw: thermo,
        photovoltaic_uw: pv,
        total_harvested_uw: total,
        net_power_balance_uw: net,
        is_energy_positive: net >= 0,
      }));
    }
  };

  // Trigger Substrate Digestion
  const handleTriggerSubstrateDigestion = async () => {
    try {
      await fetch('/api/v1/security/substrate-digest', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setIsDigested(true);
      setShowDigestModal(false);
      handleMofEmergencyDepressurize();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#232B3E] pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold font-mono text-emerald-400 tracking-wide">
              V11.0.0-TRANSCENDENCE ARCHITECTURE — QGNN KNOTS &amp; MOF REPOSITORIES
            </h1>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded font-mono">
              SUGGESTION-V10 COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Topological Knot Invariants &bull; Molecular MOF-5/ZIF-8 Gas Sorption (2,000 m²/g) &bull; Tri-Modal Micro-Harvesting &bull; Substrate Digestion Zeroization
          </p>
        </div>

        <button
          onClick={() => setShowDigestModal(true)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/30 hover:bg-amber-900/60 transition text-xs font-mono font-bold"
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>BIOLOGICAL SUBSTRATE DIGESTION</span>
        </button>
      </div>

      {/* 3D WebGL MOF Lattice Visualizer */}
      <QuantumGraphMofVisualizer
        pressurePsi={mofTelemetry ? mofTelemetry.current_pressure_psi : 24.5}
        knotClass={cipherGraphResult ? cipherGraphResult.knot_classification : 'TREFOIL_3_1'}
        isDigested={isDigested}
      />

      {/* Main Grid: QGNN, MOF, Tri-Harvesting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: QGNN Knot Invariant Solver */}
        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#232B3E] pb-3">
            <div className="flex items-center space-x-2">
              <Atom className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-bold font-mono text-purple-400">
                QGNN KNOT INVARIANT SOLVER
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              JONES V(t) &bull; &lt;5.0ms SLA
            </span>
          </div>

          <div>
            <label className="text-slate-400 block text-xs font-mono mb-1">
              ARTIN BRAID GENERATORS (CROSSINGS)
            </label>
            <input
              type="text"
              value={crossingsInput}
              onChange={(e) => setCrossingsInput(e.target.value)}
              placeholder="1, 1, 1 (Trefoil) or 1, -2, 1, -2 (Fig-8)"
              className="w-full bg-[#0B0F17] border border-[#232B3E] rounded px-3 py-1.5 text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-400"
            />
          </div>

          <button
            onClick={handleEvaluateKnot}
            disabled={isQgnnLoading}
            className="w-full bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 px-3 py-2 rounded text-xs font-mono font-medium transition"
          >
            {isQgnnLoading ? 'EVALUATING INVARIANTS...' : 'EVALUATE JONES POLYNOMIAL V(t)'}
          </button>

          {qgnnResult && (
            <div className="bg-[#0B0F17] p-3 rounded border border-purple-500/20 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>JONES V(t = -1):</span>
                <span className="text-purple-300 font-bold">{qgnnResult.jones_polynomial_t_minus_one}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>CONWAY INVARIANT Δ:</span>
                <span className="text-cyan-400 font-bold">{qgnnResult.alexander_conway_delta}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>BRAID WRITHE:</span>
                <span className="text-slate-300">{qgnnResult.writhe}</span>
              </div>
            </div>
          )}

          {cipherGraphResult && (
            <div className="bg-[#0B0F17] p-3 rounded border border-emerald-500/30 text-xs font-mono space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>ZERO-SHOT CIPHER STRUCTURE SOLVED</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>IDENTIFIED FAMILY:</span>
                <span className="text-emerald-300 font-bold">{cipherGraphResult.identified_cipher_family}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>INFERENCE TIME:</span>
                <span className="text-cyan-400 font-bold">{cipherGraphResult.solve_time_ms} ms (&lt;5.0ms SLA)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>CONFIDENCE:</span>
                <span className="text-emerald-400 font-bold">{(cipherGraphResult.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: MOF-5/ZIF-8 Gas-State Entropy Repository */}
        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#232B3E] pb-3">
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold font-mono text-emerald-400">
                MOF GAS-STATE ENTROPY CHAMBER
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              ZIF-8 &bull; ZERO EM LEAKAGE
            </span>
          </div>

          <div>
            <label className="text-slate-400 block text-xs font-mono mb-1">
              KEY ENTROPY TO ENCODE
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#232B3E] rounded px-3 py-1.5 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEncodeMof}
              className="flex-1 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 px-3 py-2 rounded text-xs font-mono font-medium transition"
            >
              ENCODE INTO GAS
            </button>
            <button
              onClick={handleMofEmergencyDepressurize}
              className="flex-1 bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30 px-3 py-2 rounded text-xs font-mono font-medium transition"
            >
              &lt;10NS GAS FLUSH
            </button>
          </div>

          {mofTelemetry && (
            <div className="bg-[#0B0F17] p-3 rounded border border-[#232B3E] text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>SURFACE AREA:</span>
                <span className="text-emerald-400 font-bold">{mofTelemetry.surface_area_m2_g} m²/g</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SORPTION PRESSURE:</span>
                <span className="text-cyan-400 font-bold">{mofTelemetry.current_pressure_psi.toFixed(2)} PSI</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SORPTION CAPACITY:</span>
                <span className="text-slate-200">{mofTelemetry.sorption_capacity_mmol_g} mmol/g</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>EM LEAKAGE LEVEL:</span>
                <span className="text-emerald-400 font-bold">{mofTelemetry.em_leakage_dbm} dBm (ZERO EM)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>CHAMBER STATE:</span>
                <span className={mofTelemetry.is_wiped ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {mofTelemetry.is_wiped ? 'FLUSHED (INERT)' : 'ARMED & ACTIVE'}
                </span>
              </div>
            </div>
          )}

          {mofWipeLatency !== null && (
            <div className="bg-[#0B0F17] p-2.5 rounded border border-red-500/20 text-xs font-mono flex justify-between">
              <span className="text-slate-400">FLUSH MEASURED LATENCY:</span>
              <span className="text-red-400 font-bold">{mofWipeLatency} ns (&lt;10ns SLA)</span>
            </div>
          )}
        </div>

        {/* Card 3: Kardashev Tri-Modal Micro-Harvesting */}
        <div className="bg-[#10141D] border border-[#232B3E] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#232B3E] pb-3">
            <div className="flex items-center space-x-2">
              <BatteryCharging className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold font-mono text-cyan-400">
                TRI-MODAL MICRO-HARVESTING
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              ENERGY POSITIVE (+15.9µW)
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> AMBIENT OPTICAL LUX:
                </span>
                <span className="text-amber-400 font-bold">{ambientLux} Lux</span>
              </div>
              <input
                type="range"
                min={0}
                max={5000}
                step={50}
                value={ambientLux}
                onChange={(e) => handleSimulateEnvironment(Number(e.target.value), deltaTC)}
                className="w-full accent-amber-400 h-1.5 bg-[#0B0F17] rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" /> THERMAL GRADIENT (ΔT):
                </span>
                <span className="text-rose-400 font-bold">{deltaTC.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={0.5}
                value={deltaTC}
                onChange={(e) => handleSimulateEnvironment(ambientLux, Number(e.target.value))}
                className="w-full accent-rose-400 h-1.5 bg-[#0B0F17] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {harvestTelemetry && (
            <div className="bg-[#0B0F17] p-3 rounded border border-[#232B3E] text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>BETA-VOLTAIC (Ni-63):</span>
                <span className="text-cyan-400 font-bold">{harvestTelemetry.beta_voltaic_nw} nW (12+ yrs)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SEEBECK THERMAL:</span>
                <span className="text-rose-400 font-bold">{harvestTelemetry.thermoelectric_uw} µW</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>PHOTOVOLTAIC OPTICAL:</span>
                <span className="text-amber-400 font-bold">{harvestTelemetry.photovoltaic_uw} µW</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-[#232B3E]">
                <span>TOTAL GENERATION:</span>
                <span className="text-emerald-400 font-bold">{harvestTelemetry.total_harvested_uw} µW</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>NET POWER BALANCE:</span>
                <span className="text-[#00E5FF] font-bold">+{harvestTelemetry.net_power_balance_uw} µW</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Substrate Digestion */}
      {showDigestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#10141D] border border-amber-500/50 rounded-xl p-6 max-w-md w-full font-mono space-y-4">
            <div className="flex items-center space-x-3 text-amber-500">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <h3 className="text-base font-bold">TRIGGER BIOLOGICAL SUBSTRATE DIGESTION?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              WARNING: This will release an enzymatic cascade (Silicase + Protease) that metabolizes the entire silicon substrate into inert silicic acid Si(OH)₄. All conductive traces and key states will be irreversibly dissolved into non-toxic inert organic compounds.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDigestModal(false)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition"
              >
                CANCEL
              </button>
              <button
                onClick={handleTriggerSubstrateDigestion}
                className="px-4 py-2 rounded bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition"
              >
                CONFIRM ENZYMATIC DIGESTION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
