import React, { useState } from 'react';
import { api } from '../services/api';
import { KasiskiResult, VigenereSolveResult, ColumnarTranspositionResult, MultilingualICResult } from '../types';
import { Search, KeyRound, Check, Play, BarChart2, Columns, Globe } from 'lucide-react';

export const KasiskiPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'kasiski' | 'columnar' | 'multilingual'>('kasiski');

  // Kasiski State
  const [ciphertext, setCiphertext] = useState<string>(
    'CIPHERON IS A UNIVERSAL HARDWARE ASSISTED CLASSICAL CIPHER AND ENCODING RESEARCH SYSTEM DESIGNED FOR CYBERSECURITY RESEARCHERS AND AUDITORS'
  );
  const [selectedKeyLen, setSelectedKeyLen] = useState<number>(3);
  const [kasiskiData, setKasiskiData] = useState<KasiskiResult | null>(null);
  const [solveData, setSolveData] = useState<VigenereSolveResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Columnar State
  const [columnarCipher, setColumnarCipher] = useState<string>('FTAAFCLDNETLHSEHSLTAEEDEWOET');
  const [maxCols, setMaxCols] = useState<number>(6);
  const [columnarData, setColumnarData] = useState<ColumnarTranspositionResult | null>(null);
  const [isLoadingColumnar, setIsLoadingColumnar] = useState(false);

  // Multilingual IC State
  const [multiText, setMultiText] = useState<string>(
    'THE SYSTEM EVOLUTION PROPOSAL OUTLINES COMPREHENSIVE ROADMAP MILESTONES FOR ADVANCED STATISTICAL CRYPTANALYSIS.'
  );
  const [multilingualData, setMultilingualData] = useState<MultilingualICResult | null>(null);
  const [isLoadingMulti, setIsLoadingMulti] = useState(false);

  const sampleVigenere = () => {
    const plain = "CIPHERONISUNIVERSALHARDWAREASSISTEDCLASSICALCIPHERANDENCODINGRESEARCHSYSTEMDESIGNEDFORCYBERSECURITYRESEARCHERSANDAUDITORS";
    const k_shifts = [10, 4, 24]; // K, E, Y
    const enc = plain.split('').map((c, i) => {
      const shift = k_shifts[i % 3];
      return String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
    }).join('');
    setCiphertext(enc);
    setSelectedKeyLen(3);
  };

  const handleRunKasiski = async () => {
    if (!ciphertext.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.runKasiski(ciphertext);
      setKasiskiData(res);
      if (res.top_candidate_key_lengths && res.top_candidate_key_lengths.length > 0) {
        setSelectedKeyLen(res.top_candidate_key_lengths[0].key_length);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleSolveCosets = async () => {
    if (!ciphertext.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.solveVigenereCosets(ciphertext, selectedKeyLen);
      setSolveData(res);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleSolveColumnar = async () => {
    if (!columnarCipher.trim()) return;
    setIsLoadingColumnar(true);
    try {
      const res = await api.solveColumnar(columnarCipher, maxCols);
      setColumnarData(res);
    } catch {
      // ignore
    } finally {
      setIsLoadingColumnar(false);
    }
  };

  const handleAnalyzeMultiIC = async () => {
    if (!multiText.trim()) return;
    setIsLoadingMulti(true);
    try {
      const res = await api.analyzeMultilingualIC(multiText);
      setMultilingualData(res);
    } catch {
      // ignore
    } finally {
      setIsLoadingMulti(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex border-b border-[#232B3E] space-x-2">
        <button
          onClick={() => setActiveSubTab('kasiski')}
          className={`flex items-center space-x-2 px-4 py-2.5 font-mono text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'kasiski'
              ? 'border-[#00E5FF] text-[#00E5FF] bg-[#161B26]/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Kasiski & Vigenère Solver</span>
        </button>

        <button
          onClick={() => setActiveSubTab('columnar')}
          className={`flex items-center space-x-2 px-4 py-2.5 font-mono text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'columnar'
              ? 'border-[#00E5FF] text-[#00E5FF] bg-[#161B26]/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Columns className="w-4 h-4" />
          <span>Columnar Transposition (V3.0)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('multilingual')}
          className={`flex items-center space-x-2 px-4 py-2.5 font-mono text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'multilingual'
              ? 'border-[#00E5FF] text-[#00E5FF] bg-[#161B26]/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Multilingual IC Profiler (V3.0)</span>
        </button>
      </div>

      {/* --- TAB 1: KASISKI & VIGENERE SOLVER --- */}
      {activeSubTab === 'kasiski' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232B3E] pb-3">
              <div>
                <h3 className="font-mono text-sm font-bold text-white">
                  KASISKI EXAMINATION & FRIEDMAN IC SOLVER
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Finds repeated n-grams ($L \ge 3$), evaluates interval distances with GCD voting, and aligns coset frequencies via Chi-Square.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={sampleVigenere}
                  className="px-3 py-1.5 rounded bg-[#161B26] hover:bg-[#1F2739] text-slate-300 text-xs font-mono border border-[#232B3E]"
                >
                  Load Sample (Key: KEY)
                </button>
                <button
                  onClick={handleRunKasiski}
                  disabled={isLoading}
                  className="flex items-center space-x-1 px-3.5 py-1.5 rounded bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-bold text-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Analyze Key Length</span>
                </button>
              </div>
            </div>

            <textarea
              value={ciphertext}
              onChange={(e) => setCiphertext(e.target.value)}
              rows={4}
              placeholder="Paste polyalphabetic ciphertext..."
              className="w-full bg-[#0B0F17] border border-[#232B3E] rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          {/* Kasiski Results */}
          {kasiskiData && kasiskiData.success && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="glass-panel p-5 rounded-xl space-y-3">
                <span className="font-mono text-xs font-bold text-[#00E5FF]">STATISTICAL METRICS</span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-[#232B3E] pb-1">
                    <span className="text-slate-400">Total Letters:</span>
                    <span className="text-white font-bold">{kasiskiData.total_letters}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#232B3E] pb-1">
                    <span className="text-slate-400">Index of Coincidence (IC):</span>
                    <span className="text-[#00E5FF] font-bold">{kasiskiData.index_of_coincidence}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#232B3E] pb-1">
                    <span className="text-slate-400">Friedman Key Length Est:</span>
                    <span className="text-amber-400 font-bold">{kasiskiData.friedman_estimated_key_length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Repeated N-Grams:</span>
                    <span className="text-[#00E676] font-bold">{kasiskiData.repeated_ngrams_count}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#232B3E] space-y-2">
                  <label className="text-[11px] font-mono text-slate-400 block">Select Key Length to Solve:</label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedKeyLen}
                      onChange={(e) => setSelectedKeyLen(Number(e.target.value))}
                      className="bg-[#0B0F17] border border-[#232B3E] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                    >
                      {kasiskiData.top_candidate_key_lengths?.map((c) => (
                        <option key={c.key_length} value={c.key_length}>
                          Length {c.key_length} ({c.factor_votes} factor votes)
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleSolveCosets}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Solve Cosets</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Spacing & GCD voting table */}
              <div className="lg:col-span-2 glass-panel p-5 rounded-xl space-y-3">
                <span className="font-mono text-xs font-bold text-slate-200">REPEATED N-GRAM SPACING PATTERNS</span>
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left font-mono text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-[#232B3E] text-slate-500 text-[11px]">
                        <th className="py-2">N-Gram</th>
                        <th className="py-2">Occurrences</th>
                        <th className="py-2">Positions</th>
                        <th className="py-2">Interval Spacings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#232B3E]/40 text-[11px]">
                      {kasiskiData.sample_ngrams?.map((n, i) => (
                        <tr key={i} className="hover:bg-[#161B26]">
                          <td className="py-2 font-bold text-[#00E5FF]">{n.ngram}</td>
                          <td className="py-2">{n.occurrences}</td>
                          <td className="py-2 text-slate-400">{n.positions.join(', ')}</td>
                          <td className="py-2 text-amber-400 font-bold">{n.spacings.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Vigenere Recovered Plaintext */}
          {solveData && solveData.success && (
            <div className="glass-panel p-5 rounded-xl border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between border-b border-[#232B3E] pb-2">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#00E676]" />
                  <span className="font-mono text-sm font-bold text-white">
                    VIGENÈRE KEY RECOVERED: <span className="text-[#00E676]">{solveData.recovered_key}</span> (Length {solveData.key_length})
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-[#00E676] font-bold">
                  SCORE: {solveData.candidate_score?.toFixed(1)} / 100
                </span>
              </div>
              <div className="bg-[#0B0F17] p-4 rounded-lg border border-[#232B3E] font-mono text-xs text-slate-100 select-all break-all">
                {solveData.decrypted_plaintext}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: COLUMNAR TRANSPOSITION SOLVER --- */}
      {activeSubTab === 'columnar' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232B3E] pb-3">
              <div>
                <h3 className="font-mono text-sm font-bold text-white">
                  COLUMNAR TRANSPOSITION PERMUTATION SOLVER
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Evaluates column counts C (2 to 12) using log-bigram adjacency scoring: Score(C) = &Sigma; LogBigramScore(Col_j, Col_j+1).
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setColumnarCipher('FTAAFCLDNETLHSEHSLTAEEDEWOET')}
                  className="px-3 py-1.5 rounded bg-[#161B26] hover:bg-[#1F2739] text-slate-300 text-xs font-mono border border-[#232B3E]"
                >
                  Load Sample (4 Columns)
                </button>
                <button
                  onClick={handleSolveColumnar}
                  disabled={isLoadingColumnar}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-bold text-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Solve Columns</span>
                </button>
              </div>
            </div>

            <textarea
              value={columnarCipher}
              onChange={(e) => setColumnarCipher(e.target.value)}
              rows={3}
              placeholder="Paste transposition ciphertext..."
              className="w-full bg-[#0B0F17] border border-[#232B3E] rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00E5FF]"
            />

            <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
              <span>Max Columns to Search:</span>
              <input
                type="number"
                min={2}
                max={12}
                value={maxCols}
                onChange={(e) => setMaxCols(Number(e.target.value))}
                className="w-16 bg-[#0B0F17] border border-[#232B3E] rounded px-2 py-1 text-white font-mono"
              />
            </div>
          </div>

          {/* Columnar Results */}
          {columnarData && (
            <div className="space-y-4">
              <div className="glass-panel p-5 rounded-xl border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-[#232B3E] pb-2">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-[#00E676]" />
                    <span className="font-mono text-sm font-bold text-white">
                      BEST COLUMN COUNT: <span className="text-[#00E676]">{columnarData.best_columns}</span> | PERMUTATION ORDER: <span className="text-[#00E5FF]">[{columnarData.best_permutation?.join(', ')}]</span>
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-[#00E676] font-bold">
                    CONFIDENCE: {columnarData.confidence_score?.toFixed(1)} / 100
                  </span>
                </div>

                <div className="bg-[#0B0F17] p-4 rounded-lg border border-[#232B3E] font-mono text-xs text-slate-100 select-all break-all">
                  {columnarData.recovered_plaintext}
                </div>
              </div>

              {/* Column Candidates Table */}
              <div className="glass-panel p-5 rounded-xl space-y-3">
                <span className="font-mono text-xs font-bold text-slate-200">CANDIDATE COLUMN ORDER EVALUATIONS</span>
                <table className="w-full text-left font-mono text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-[#232B3E] text-slate-500 text-[11px]">
                      <th className="py-2">Columns</th>
                      <th className="py-2">Permutation Order</th>
                      <th className="py-2">Log-Bigram Score</th>
                      <th className="py-2">Decrypted Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232B3E]/40 text-[11px]">
                    {columnarData.tested_column_candidates?.map((c, i) => (
                      <tr key={i} className="hover:bg-[#161B26]">
                        <td className="py-2 font-bold text-[#00E5FF]">{c.columns}</td>
                        <td className="py-2 text-amber-400">[{c.permutation.join(', ')}]</td>
                        <td className="py-2 font-bold">{c.score}</td>
                        <td className="py-2 text-slate-300 font-mono max-w-md truncate">{c.plaintext_preview}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: MULTILINGUAL IC PROFILER --- */}
      {activeSubTab === 'multilingual' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232B3E] pb-3">
              <div>
                <h3 className="font-mono text-sm font-bold text-white">
                  MULTILINGUAL INDEX OF COINCIDENCE NORMALIZATION
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Compares observed text IC against standard language benchmarks: English (~0.0667), German (~0.0762), Spanish (~0.0770), Random (~0.0385).
                </p>
              </div>

              <button
                onClick={handleAnalyzeMultiIC}
                disabled={isLoadingMulti}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-bold text-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Profile Languages</span>
              </button>
            </div>

            <textarea
              value={multiText}
              onChange={(e) => setMultiText(e.target.value)}
              rows={3}
              placeholder="Paste text for multilingual IC profiling..."
              className="w-full bg-[#0B0F17] border border-[#232B3E] rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          {/* Multilingual IC Results */}
          {multilingualData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-5 rounded-xl space-y-3">
                <span className="font-mono text-xs font-bold text-[#00E5FF]">OBSERVED STATISTICAL METRICS</span>
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-[#0B0F17] rounded-lg border border-[#232B3E] flex items-center justify-between">
                    <span className="text-slate-400">Calculated IC:</span>
                    <span className="text-lg font-bold text-[#00E5FF]">{multilingualData.observed_ic.toFixed(4)}</span>
                  </div>
                  <div className="p-3 bg-[#0B0F17] rounded-lg border border-[#232B3E] flex items-center justify-between">
                    <span className="text-slate-400">Closest Profile:</span>
                    <span className="text-sm font-bold text-[#00E676]">{multilingualData.closest_profile}</span>
                  </div>
                  <div className={`p-3 rounded-lg border ${
                    multilingualData.is_polyalphabetic_or_random
                      ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                      : 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
                  }`}>
                    {multilingualData.is_polyalphabetic_or_random
                      ? 'WARNING: IC is close to uniform random noise (0.0385). High probability of polyalphabetic cipher or binary encryption.'
                      : 'Natural language distribution detected. Character frequencies align with natural European language text.'}
                  </div>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-xl space-y-3">
                <span className="font-mono text-xs font-bold text-slate-200">BENCHMARK ALIGNMENT TABLE</span>
                <table className="w-full text-left font-mono text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-[#232B3E] text-slate-500 text-[11px]">
                      <th className="py-2">Language</th>
                      <th className="py-2">Benchmark IC</th>
                      <th className="py-2">Delta</th>
                      <th className="py-2">Match Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232B3E]/40 text-[11px]">
                    {multilingualData.language_alignment?.map((l, i) => (
                      <tr key={i} className="hover:bg-[#161B26]">
                        <td className="py-2 font-bold text-white">{l.language}</td>
                        <td className="py-2 text-slate-400">{l.benchmark_ic.toFixed(4)}</td>
                        <td className="py-2 text-amber-400">{l.delta.toFixed(4)}</td>
                        <td className="py-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-[#161B26] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#00E5FF] h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, l.match_confidence))}%` }}
                              />
                            </div>
                            <span className="font-bold text-[10px] text-[#00E5FF]">{l.match_confidence}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
