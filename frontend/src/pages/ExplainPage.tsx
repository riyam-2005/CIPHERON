import React, { useState } from 'react';
import { api } from '../services/api';
import { AIExplanationResponse } from '../types';
import { Sparkles, ShieldCheck, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';

interface ExplainPageProps {
  initialEvidence?: any;
}

export const ExplainPage: React.FC<ExplainPageProps> = ({ initialEvidence }) => {
  const [evidence, setEvidence] = useState<any>(
    initialEvidence || {
      detected_cipher_or_encoding: 'Base64 + ROT13',
      shannon_entropy: 4.82,
      index_of_coincidence: 0.0662,
      candidate_text: 'HELLO WORLD',
      score: 95.5
    }
  );
  const [explanation, setExplanation] = useState<AIExplanationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateProof = async () => {
    setIsLoading(true);
    try {
      const res = await api.requestAIExplain(evidence);
      setExplanation(res);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-mono text-base font-bold text-white tracking-wide">
              EXPLAINABLE CRYPTANALYSIS PROOFS & REASONING
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            FR-8.1 - 8.2 Evidence-Driven Reasoning. Mathematical and linguistic verification without black-box guessing.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Deterministic-First Boundary</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Structured Evidence Payload (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#232B3E] pb-2 font-mono text-xs text-slate-400">
            <span className="font-bold text-white">STRUCTURED EVIDENCE INPUT</span>
            <span>JSON PAYLOAD</span>
          </div>

          <p className="text-[11px] text-slate-400 font-mono">
            Under PRD 8.2, raw unvalidated data is never passed to AI. Only verifiable mathematical metrics are provided:
          </p>

          <pre className="bg-[#0B0F17] p-3.5 rounded-lg border border-[#232B3E] font-mono text-xs text-[#00E5FF] overflow-x-auto">
            {JSON.stringify(evidence, null, 2)}
          </pre>

          <button
            onClick={handleGenerateProof}
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-bold text-xs tracking-wider transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>GENERATE EXPLAINABLE PROOF</span>
          </button>
        </div>

        {/* Generated Proof & Reasoning (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-xl space-y-4">
          <div className="border-b border-[#232B3E] pb-2 font-mono text-xs text-slate-400 font-bold text-white">
            MATHEMATICAL VERIFICATION STEPS
          </div>

          {explanation ? (
            <div className="space-y-4 font-mono text-xs">
              {/* Summary */}
              <div className="bg-[#0B0F17] p-3.5 rounded-lg border border-[#00E5FF]/30 text-slate-200">
                <span className="text-[#00E5FF] font-bold block mb-1">Executive Verdict:</span>
                {explanation.summary}
              </div>

              {/* Step by Step */}
              <div className="space-y-2">
                <span className="text-slate-400 font-bold block">Transformation Pipeline Proofs:</span>
                {explanation.step_by_step_reasoning.map((step, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#0B0F17] border border-[#232B3E] text-slate-300 flex items-start space-x-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#00E676] flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* Confidence & Advisory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-[#0B0F17] border border-emerald-500/30 text-emerald-300">
                  <span className="text-emerald-400 font-bold block mb-1">Statistical Confidence:</span>
                  {explanation.confidence_verdict}
                </div>

                <div className="p-3 rounded-lg bg-[#0B0F17] border border-[#232B3E] text-slate-400">
                  <span className="text-white font-bold block mb-1">Defensive Boundary:</span>
                  {explanation.security_advisory}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 font-mono text-xs space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-[#00E5FF] opacity-30" />
              <p>Click "Generate Explainable Proof" to produce the deterministic step-by-step reasoning breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
