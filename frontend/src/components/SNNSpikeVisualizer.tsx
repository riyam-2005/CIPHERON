import React, { useEffect, useRef } from 'react';
import { SNNInferenceResult } from '../types';
import { Zap, Activity, BatteryCharging, Gauge } from 'lucide-react';

interface SNNSpikeVisualizerProps {
  data: SNNInferenceResult | null;
}

export const SNNSpikeVisualizer: React.FC<SNNSpikeVisualizerProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Draw horizontal grid lines for 32 neurons
    const numNeurons = 32;
    const rowHeight = height / numNeurons;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < numNeurons; i++) {
      const y = i * rowHeight;
      ctx.beginPath();
      ctx.moveTo(35, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Y-axis Neuron labels
    ctx.fillStyle = '#64748b';
    ctx.font = '8px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i < numNeurons; i += 4) {
      const y = i * rowHeight + rowHeight / 2 + 3;
      ctx.fillText(`N${i.toString().padStart(2, '0')}`, 28, y);
    }

    if (!data || !data.raster_sample || data.raster_sample.length === 0) {
      ctx.fillStyle = '#475569';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Awaiting live bitstream spike events...', width / 2, height / 2);
      return;
    }

    // Determine max timestep in raster
    const maxT = Math.max(...data.raster_sample.map(s => s.timestep), 1);
    const plotStartX = 40;
    const plotWidth = width - plotStartX - 10;

    // Draw spikes as glowing dots
    data.raster_sample.forEach((spike) => {
      const x = plotStartX + (spike.timestep / Math.max(maxT, 1)) * plotWidth;
      const y = spike.neuron_id * rowHeight + rowHeight / 2;

      // Glow
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.fill();

      // Core spike
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    });

  }, [data]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Top Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Neuromorphic LIF Raster Telemetry
            </h3>
            <p className="text-xs text-slate-400">
              32-Neuron Leaky Integrate-and-Fire Event Model (ULP / Xtensa LX7)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-emerald-400">
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>{data ? `${data.power_consumption_mw} mW` : '0.120 mW'}</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-cyan-300">
            <Gauge className="w-3.5 h-3.5" />
            <span>Entropy: {data ? `${data.estimated_entropy.toFixed(3)} / 8.0` : '-- / 8.0'}</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-amber-300">
            <Activity className="w-3.5 h-3.5" />
            <span>Spikes: {data ? data.total_spikes_emitted : 0}</span>
          </div>
        </div>
      </div>

      {/* Raster Canvas */}
      <div className="relative w-full rounded-lg overflow-hidden border border-slate-800">
        <canvas
          ref={canvasRef}
          width={720}
          height={240}
          className="w-full h-[220px] block"
        />
        <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-500 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800">
          t → Timestep (stream offset)
        </div>
      </div>

      {/* 32-Neuron Fire Activity Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400">
          <span>Neuron Firing Distribution (N00 - N31)</span>
          <span>Threshold: {data ? `${data.threshold_voltage}V` : '0.35V'} | Decay β: {data ? data.decay_factor_beta : 0.85}</span>
        </div>
        <div className="grid grid-cols-16 sm:grid-cols-32 gap-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
          {Array.from({ length: 32 }).map((_, idx) => {
            const count = data?.neuron_spike_counts?.[idx] || 0;
            const maxSpikes = data ? Math.max(...data.neuron_spike_counts, 1) : 1;
            const intensity = count > 0 ? Math.min((count / maxSpikes) * 100, 100) : 5;
            return (
              <div
                key={idx}
                className="group relative flex flex-col items-center"
              >
                <div
                  className={`w-full h-8 rounded-sm transition-all duration-300 ${
                    count > 0 ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-slate-800'
                  }`}
                  style={{ opacity: count > 0 ? 0.3 + (intensity / 100) * 0.7 : 0.2 }}
                />
                <div className="hidden group-hover:block absolute bottom-9 z-20 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-cyan-300 shadow-lg whitespace-nowrap">
                  N{idx}: {count} spikes
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
