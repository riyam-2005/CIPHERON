import React, { useState } from 'react';
import { api } from '../services/api';
import { CodeAnalysisResult } from '../types';
import { Code2, Play, AlertTriangle, ShieldCheck, CheckCircle2, FileCode, Layers, Cpu } from 'lucide-react';

export const CodeAnalysisPage: React.FC = () => {
  const [codeSnippet, setCodeSnippet] = useState<string>(`import os
import hashlib

def generate_session_token(seed_bytes):
    # Hash seed using SHA-256
    digest = hashlib.sha256(seed_bytes).hexdigest()
    return digest[:32]

class CipherSession:
    def __init__(self, key):
        self.key = key
        self.active = True
`);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CodeAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!codeSnippet.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.inspectCode(codeSnippet);
      setResult(res);
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
            <Code2 className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-mono text-base font-bold text-white tracking-wide">
              SOURCE CODE INTELLIGENCE & STATIC AST
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            FR-7.2 Static AST inspection, complexity metrics, and obfuscation detection. Zero dynamic host execution.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded bg-emerald-500/10 text-[#00E676] border border-emerald-500/30 flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>V1 Sandboxed Static Policy</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Box (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#232B3E] pb-2">
            <span className="text-xs font-mono text-slate-400">SOURCE CODE INPUT:</span>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setCodeSnippet(`function decryptPayload(raw) {
    var decoded = atob(raw);
    eval(decoded); // High Obfuscation Risk
}`)
                }
                className="text-[10px] font-mono text-slate-400 hover:text-amber-400"
              >
                Sample Obfuscated JS
              </button>
            </div>
          </div>

          <textarea
            aria-label="Source code snippet input"
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            rows={14}
            className="w-full bg-[#0B0F17] text-slate-100 font-mono text-xs p-3.5 rounded-lg border border-[#232B3E] focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-all resize-none"
            placeholder="Paste source code (Python, JS, TS, C, Rust, Go, etc.) for static AST inspection..."
          />

          <button
            onClick={handleAnalyze}
            disabled={isLoading || !codeSnippet.trim()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-bold text-xs tracking-wider transition-all"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>PARSE AST & INSPECT</span>
          </button>
        </div>

        {/* Inspection Results (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result && (
            <>
              {/* Summary Card */}
              <div className="glass-panel p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#232B3E] pb-2">
                  <span className="font-mono text-xs font-bold text-white flex items-center space-x-1.5">
                    <FileCode className="w-4 h-4 text-[#00E5FF]" />
                    <span>LANGUAGE: {result.language || 'UNKNOWN'}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      result.syntax_valid
                        ? 'bg-[#00E676]/20 text-[#00E676]'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {result.syntax_valid ? 'SYNTAX VALID' : 'SYNTAX ERROR'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
                    <span className="text-slate-500 block text-[10px]">Cyclomatic Complexity</span>
                    <span className="text-white text-base font-bold">{result.cyclomatic_complexity}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {result.cyclomatic_complexity <= 5 ? 'Low (Simple)' : 'Moderate/Complex'}
                    </span>
                  </div>

                  <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
                    <span className="text-slate-500 block text-[10px]">Obfuscation Risk</span>
                    <span
                      className={`text-base font-bold ${
                        result.obfuscation_risk >= 50
                          ? 'text-red-400'
                          : result.obfuscation_risk >= 20
                          ? 'text-amber-400'
                          : 'text-[#00E676]'
                      }`}
                    >
                      {result.obfuscation_risk.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {result.obfuscation_risk >= 50 ? 'Suspicious Eval/Entropy' : 'Clean Semantics'}
                    </span>
                  </div>
                </div>

                {/* Functions & Classes */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="text-slate-400 text-[11px]">DECLARATIONS IDENTIFIED:</div>
                  <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E] space-y-1.5 max-h-36 overflow-y-auto">
                    {result.functions.map((f, i) => (
                      <div key={i} className="text-[#00E5FF] text-[11px] flex items-center space-x-1.5">
                        <span className="text-slate-500">def</span>
                        <span>{f}()</span>
                      </div>
                    ))}
                    {result.classes.map((c, i) => (
                      <div key={i} className="text-purple-400 text-[11px] flex items-center space-x-1.5">
                        <span className="text-slate-500">class</span>
                        <span>{c}</span>
                      </div>
                    ))}
                    {result.functions.length === 0 && result.classes.length === 0 && (
                      <span className="text-slate-500 text-[11px]">No top-level function/class definitions</span>
                    )}
                  </div>
                </div>

                {/* Security Warning Flags */}
                {result.security_warnings.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-mono text-red-400 font-bold flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Security & Obfuscation Flags:</span>
                    </span>
                    <div className="space-y-1">
                      {result.security_warnings.map((w, i) => (
                        <div
                          key={i}
                          className="bg-red-500/10 border border-red-500/30 text-red-300 p-2 rounded text-[11px] font-mono"
                        >
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
