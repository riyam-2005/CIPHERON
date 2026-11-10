import React from 'react';
import { StatisticalMetrics } from '../types';
import { BarChart2, Hash, Layers, ShieldCheck, AlertCircle } from 'lucide-react';

interface MetricsBarProps {
  metrics?: StatisticalMetrics;
  executionTimeMs?: number;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics, executionTimeMs }) => {
  if (!metrics) return null;

  // Entropy assessment
  const getEntropyLabel = (h: number) => {
    if (h === 0) return 'Zero';
    if (h < 2.0) return 'Very Low (Repetitive)';
    if (h < 4.8) return 'Natural Language / Structured';
    if (h < 6.5) return 'Encoded (Base64 / Hex)';
    return 'High (Compressed / Encrypted / Random)';
  };

  // IC assessment
  const getIcLabel = (ic: number) => {
    if (ic === 0) return 'N/A';
    if (Math.abs(ic - 0.0667) < 0.01) return 'English (~0.0667)';
    if (ic < 0.045) return 'Polyalphabetic / Random (~0.038)';
    return 'Monoalphabetic (~0.06+)';
  };

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#00E5FF]">
          <BarChart2 className="w-4 h-4" />
          <span className="font-bold uppercase tracking-wider">Statistical Heuristics & Entropy Metrics</span>
        </div>
        {executionTimeMs !== undefined && (
          <span className="text-[11px] font-mono text-slate-400 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#232B3E]">
            DETECTION LATENCY: <span className="text-[#00E5FF] font-semibold">{executionTimeMs.toFixed(1)} ms</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Shannon Entropy */}
        <div className="bg-[#0B0F17] p-2.5 rounded-lg border border-[#232B3E]">
          <div className="text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Shannon Entropy (H)</span>
            <span className="text-[#00E5FF] font-bold">{metrics.shannon_entropy.toFixed(3)}</span>
          </div>
          <div className="w-full bg-[#161B26] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 via-amber-400 to-cyan-400 h-full"
              style={{ width: `${Math.min(100, (metrics.shannon_entropy / 8.0) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 truncate" title={getEntropyLabel(metrics.shannon_entropy)}>
            {getEntropyLabel(metrics.shannon_entropy)}
          </p>
        </div>

        {/* Index of Coincidence */}
        <div className="bg-[#0B0F17] p-2.5 rounded-lg border border-[#232B3E]">
          <div className="text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Index of Coinc. (IC)</span>
            <span className="text-amber-400 font-bold">{metrics.index_of_coincidence.toFixed(4)}</span>
          </div>
          <div className="w-full bg-[#161B26] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full"
              style={{ width: `${Math.min(100, (metrics.index_of_coincidence / 0.08) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 truncate" title={getIcLabel(metrics.index_of_coincidence)}>
            {getIcLabel(metrics.index_of_coincidence)}
          </p>
        </div>

        {/* Printable ASCII % */}
        <div className="bg-[#0B0F17] p-2.5 rounded-lg border border-[#232B3E]">
          <div className="text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Printable ASCII</span>
            <span className="text-[#00E676] font-bold">{(metrics.printable_ratio * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-[#161B26] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#00E676] h-full"
              style={{ width: `${metrics.printable_ratio * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {metrics.printable_ratio > 0.95 ? 'Text Clean' : 'Binary Noise / Escaped'}
          </p>
        </div>

        {/* Chi-squared */}
        <div className="bg-[#0B0F17] p-2.5 rounded-lg border border-[#232B3E]">
          <div className="text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Chi-Squared (&chi;&sup2;)</span>
            <span className="text-purple-400 font-bold">
              {metrics.chi_squared_english > 900 ? '>900' : metrics.chi_squared_english.toFixed(1)}
            </span>
          </div>
          <div className="w-full bg-[#161B26] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-purple-400 h-full"
              style={{ width: `${Math.max(5, Math.min(100, 100 - (metrics.chi_squared_english / 300) * 100))}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1 truncate">
            {metrics.chi_squared_english < 35 ? 'Natural English Fit' : 'Shifted / Non-English'}
          </p>
        </div>

        {/* Payload Size */}
        <div className="bg-[#0B0F17] p-2.5 rounded-lg border border-[#232B3E]">
          <div className="text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Payload Size</span>
            <span className="text-white font-bold">{metrics.length} bytes</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-2">
            {metrics.has_null_bytes ? (
              <span className="text-[10px] font-mono text-red-400 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Null Bytes</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Sanitized</span>
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-500">|</span>
            <span className="text-[10px] font-mono text-slate-400">
              {metrics.is_pure_ascii ? 'ASCII-7' : 'Extended / UTF-8'}
            </span>
          </div>
        </div>
      </div>

      {/* Detected Alphabets / Charsets Tags */}
      {metrics.detected_charsets.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center space-x-1">
            <Layers className="w-3 h-3 text-[#00E5FF]" />
            <span>Matched Character Sets:</span>
          </span>
          {metrics.detected_charsets.map((cs) => (
            <span
              key={cs}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161B26] text-[#00E5FF] border border-[#00E5FF]/30"
            >
              {cs}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
