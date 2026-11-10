import React, { useEffect, useRef } from 'react';
import { SDRSpectrumResult } from '../types';

interface SDRWaterfallProps {
  spectrumData: SDRSpectrumResult | null;
  selectedFreq: number;
  onFreqChange?: (freq: number) => void;
}

export const SDRWaterfall: React.FC<SDRWaterfallProps> = ({
  spectrumData,
  selectedFreq,
  onFreqChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waterfallHistoryRef = useRef<number[][]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Power spectrum area: top 40%
    const spectrumHeight = Math.floor(height * 0.45);
    // Waterfall area: bottom 55%
    const waterfallHeight = height - spectrumHeight;

    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // Draw Spectrum Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let y = 10; y < spectrumHeight; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, spectrumHeight);
      ctx.stroke();
    }

    if (!spectrumData || !spectrumData.power_spectrum_dbm.length) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.fillText('Awaiting RTL-SDR I/Q Sample Stream...', 20, 40);
      return;
    }

    const bins = spectrumData.power_spectrum_dbm;
    const numBins = bins.length;
    const minDbm = -100;
    const maxDbm = 0;

    // 1. Plot FFT Line
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();

    for (let i = 0; i < numBins; i++) {
      const x = (i / (numBins - 1)) * width;
      const normalized = Math.max(0, Math.min(1, (bins[i] - minDbm) / (maxDbm - minDbm)));
      const y = spectrumHeight - (normalized * (spectrumHeight - 15));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(width, spectrumHeight);
    ctx.lineTo(0, spectrumHeight);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.fill();

    // Peak Marker
    const peakIdx = bins.indexOf(spectrumData.peak_power_dbm);
    if (peakIdx >= 0) {
      const peakX = (peakIdx / (numBins - 1)) * width;
      const peakY = spectrumHeight - (Math.max(0, Math.min(1, (spectrumData.peak_power_dbm - minDbm) / (maxDbm - minDbm))) * (spectrumHeight - 15));
      
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(peakX, peakY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f87171';
      ctx.font = '10px monospace';
      ctx.fillText(`${spectrumData.peak_freq_mhz.toFixed(2)} MHz`, peakX - 25, Math.max(peakY - 10, 15));
    }

    // 2. Update Waterfall History
    const history = waterfallHistoryRef.current;
    history.unshift(bins);
    if (history.length > 50) history.pop();

    // Render Waterfall Rows
    const rowHeight = Math.max(1, Math.floor(waterfallHeight / Math.max(history.length, 1)));
    for (let r = 0; r < history.length; r++) {
      const rowBins = history[r];
      const y = spectrumHeight + (r * rowHeight);
      const binWidth = width / rowBins.length;

      for (let c = 0; c < rowBins.length; c++) {
        const val = Math.max(0, Math.min(1, (rowBins[c] - minDbm) / (maxDbm - minDbm)));
        // Color gradient: deep blue -> cyan -> yellow -> red
        let rVal = 0, gVal = 0, bVal = 0;
        if (val < 0.3) {
          bVal = Math.floor(val * 3.3 * 255);
        } else if (val < 0.7) {
          const t = (val - 0.3) / 0.4;
          gVal = Math.floor(t * 255);
          bVal = Math.floor((1 - t) * 255);
        } else {
          const t = (val - 0.7) / 0.3;
          rVal = Math.floor(t * 255);
          gVal = Math.floor((1 - t * 0.5) * 255);
        }

        ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
        ctx.fillRect(c * binWidth, y, binWidth + 1, rowHeight + 1);
      }
    }

    // Frequency Axis Line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, spectrumHeight);
    ctx.lineTo(width, spectrumHeight);
    ctx.stroke();

  }, [spectrumData]);

  return (
    <div className="w-full bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold">RTL-SDR RF SPECTRUM WATERFALL</span>
          <span className="text-slate-400">CENTER: {selectedFreq.toFixed(2)} MHz</span>
          <span className="text-emerald-400">BW: 2.40 MHz</span>
        </div>
        {spectrumData && (
          <div className="flex items-center gap-3 text-slate-300">
            <span>PEAK: <strong className="text-amber-400">{spectrumData.peak_power_dbm} dBm</strong></span>
            <span>SNR: <strong className="text-cyan-400">{spectrumData.snr_db} dB</strong></span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={700}
          height={260}
          className="w-full h-64 block"
        />
        <div className="absolute bottom-2 right-2 bg-slate-900/90 text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/20">
          USB OTG 480Mbps STREAM
        </div>
      </div>
    </div>
  );
};

export default SDRWaterfall;
