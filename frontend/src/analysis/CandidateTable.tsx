import React, { useState } from 'react';
import { CandidatePlaintext } from '../types';
import { Award, Check, Copy, ShieldCheck, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface CandidateTableProps {
  candidates?: CandidatePlaintext[];
  bestCandidate?: CandidatePlaintext;
  onExplain?: (candidate: CandidatePlaintext) => void;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates = [],
  bestCandidate,
  onExplain
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Combine and sort candidates
  const list = [...candidates];
  if (bestCandidate && !list.some((c) => c.text === bestCandidate.text)) {
    list.unshift(bestCandidate);
  }
  list.sort((a, b) => b.score - a.score);

  if (list.length === 0) return null;

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="glass-panel p-5 rounded-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232B3E] pb-3">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="font-mono text-sm font-bold text-white tracking-wide">
            CANDIDATE PLAINTEXT RANKING
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
            MULTI-FACTOR SCORING
          </span>
        </div>
        <p className="text-[11px] font-mono text-slate-400">
          Evaluated via: <span className="text-slate-300">N-gram (35%) + Dictionary (35%) + Printable (15%) + IC (15%)</span>
        </p>
      </div>

      <div className="space-y-2.5">
        {list.slice(0, 10).map((cand, idx) => {
          const isTop = idx === 0;
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              className={`rounded-lg border transition-all ${
                isTop
                  ? 'bg-[#161B26] border-[#00E676]/60 shadow-lg shadow-[#00E676]/5'
                  : 'bg-[#0B0F17] border-[#232B3E] hover:border-slate-600'
              }`}
            >
              <div className="p-3.5 flex flex-wrap items-center justify-between gap-3">
                {/* Left: Rank & Status */}
                <div className="flex items-center space-x-3 min-w-[200px]">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold ${
                      isTop ? 'bg-[#00E676] text-black' : 'bg-[#232B3E] text-slate-400'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {cand.transformation}
                      </span>
                      {cand.parameter && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0B0F17] text-slate-400 border border-[#232B3E]">
                          {cand.parameter}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 mt-0.5">
                      {isTop ? (
                        <span className="text-[10px] font-mono font-bold text-[#00E676] flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Most Likely Candidate</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          Candidate Hypothesis
                        </span>
                      )}

                      {cand.verified_structure && (
                        <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 rounded border border-[#00E5FF]/30 flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{cand.verified_structure}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center: Plaintext Output Preview */}
                <div className="flex-1 min-w-[240px] max-w-xl">
                  <div className="bg-[#0B0F17] px-3 py-1.5 rounded border border-[#232B3E] font-mono text-xs text-[#E0E6ED] break-all select-all">
                    {cand.text}
                  </div>
                </div>

                {/* Right: Score & Actions */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div
                      className={`font-mono text-sm font-bold ${
                        cand.score >= 75
                          ? 'text-[#00E676]'
                          : cand.score >= 50
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {cand.score.toFixed(1)} <span className="text-[10px] text-slate-500">/ 100</span>
                    </div>
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="text-[10px] font-mono text-slate-400 hover:text-[#00E5FF] flex items-center space-x-1"
                    >
                      <span>Breakdown</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopy(idx, cand.text)}
                    className="p-2 rounded bg-[#0B0F17] hover:bg-[#1F2739] text-slate-300 hover:text-white border border-[#232B3E] transition-all"
                    title="Copy candidate text"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-[#00E676]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {onExplain && (
                    <button
                      onClick={() => onExplain(cand)}
                      className="p-2 rounded bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 transition-all"
                      title="Generate step-by-step mathematical proof"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Breakdown */}
              {isExpanded && cand.score_components && (
                <div className="border-t border-[#232B3E] p-3 bg-[#0B0F17]/60 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded bg-[#0B0F17] border border-[#232B3E]/60">
                    <span className="text-slate-500 block">N-gram (w1=0.35)</span>
                    <span className="text-white font-bold">{cand.score_components.ngram_score.toFixed(1)}%</span>
                  </div>
                  <div className="p-2 rounded bg-[#0B0F17] border border-[#232B3E]/60">
                    <span className="text-slate-500 block">Dict Match (w2=0.35)</span>
                    <span className="text-[#00E676] font-bold">{cand.score_components.dict_score.toFixed(1)}%</span>
                  </div>
                  <div className="p-2 rounded bg-[#0B0F17] border border-[#232B3E]/60">
                    <span className="text-slate-500 block">Printable (w3=0.15)</span>
                    <span className="text-white font-bold">{cand.score_components.printable_score.toFixed(1)}%</span>
                  </div>
                  <div className="p-2 rounded bg-[#0B0F17] border border-[#232B3E]/60">
                    <span className="text-slate-500 block">IC Proximity (w4=0.15)</span>
                    <span className="text-amber-400 font-bold">{cand.score_components.ic_score.toFixed(1)}%</span>
                  </div>
                  <div className="p-2 rounded bg-[#0B0F17] border border-[#232B3E]/60">
                    <span className="text-slate-500 block">Entropy Penalty</span>
                    <span className="text-red-400 font-bold">-{cand.score_components.entropy_penalty.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
