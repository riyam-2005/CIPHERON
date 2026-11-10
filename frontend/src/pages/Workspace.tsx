import React, { useState } from 'react';
import { api } from '../services/api';
import { DetectionResponse, PipelineDAG, CandidatePlaintext, SecurityMode } from '../types';
import { MetricsBar } from '../analysis/MetricsBar';
import { TransformationDAG } from '../analysis/TransformationDAG';
import { CandidateTable } from '../analysis/CandidateTable';
import {
  Sparkles, Play, Search, KeyRound, Binary, FileText,
  Upload, CheckCircle, AlertCircle, RefreshCw, Copy, Layers
} from 'lucide-react';

interface WorkspaceProps {
  currentProfile: SecurityMode;
  onNavigateToExplain?: (evidence: any) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ currentProfile, onNavigateToExplain }) => {
  const [inputContent, setInputContent] = useState<string>('SGVsbG8gQ0lQSEVST04tWDEx');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null);
  const [dagResult, setDagResult] = useState<PipelineDAG | null>(null);
  const [cipherCandidates, setCipherCandidates] = useState<CandidatePlaintext[]>([]);

  // Presets loadout
  const presets = [
    { label: 'Base64 Vector (PRD 8.2)', text: 'SGVsbG8gQ0lQSEVST04tWDEx' },
    { label: 'Hex Vector (PRD 8.2)', text: '4349504845524f4e' },
    { label: 'Binary Vector (PRD 8.2)', text: '01010100 01100101 01110011 01110100' },
    { label: 'ROT13 Vector (PRD 8.2)', text: 'Uryyb Jbeyq' },
    { label: 'Caesar Cipher (+3)', text: 'KHOOR' },
    { label: 'Morse Code', text: '.... . .-.. .-.. ---' },
    { label: 'Nested (Base64 + ROT13)', text: 'VVJZeWJKQkVZUT09' },
    { label: 'Single-byte XOR (Key 0x42)', text: '11070110071642040e0305' },
    { label: 'SHA-256 Hash', text: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputContent(content);
    };
    reader.readAsText(file);
  };

  const handleRunPipeline = async () => {
    if (!inputContent.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. Run Detection
      const det = await api.detectInput(inputContent);
      setDetectionResult(det);

      // 2. Run Pipeline DAG
      const dag = await api.runPipeline(inputContent);
      setDagResult(dag);
      setCipherCandidates([]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectOnly = async () => {
    if (!inputContent.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const det = await api.detectInput(inputContent);
      setDetectionResult(det);
    } catch (err: any) {
      setErrorMsg(err.message || 'Detection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaesarBrute = async () => {
    if (!inputContent.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.runCaesar(inputContent);
      setCipherCandidates(res.candidates);
    } catch (err: any) {
      setErrorMsg(err.message || 'Caesar failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleXorBrute = async () => {
    if (!inputContent.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.runXor(inputContent);
      setCipherCandidates(res.candidates);
    } catch (err: any) {
      setErrorMsg(err.message || 'XOR failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232B3E] pb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-mono text-sm font-bold text-white tracking-wide">
              INPUT INGESTION & DECODER STUDIO
            </h2>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 mr-1">PRESETS:</span>
            {presets.slice(0, 5).map((p) => (
              <button
                key={p.label}
                onClick={() => setInputContent(p.text)}
                className="px-2 py-1 rounded bg-[#0B0F17] hover:bg-[#161B26] text-slate-300 hover:text-[#00E5FF] border border-[#232B3E] text-[10px] font-mono transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea & File Drag-and-drop */}
        <div className="relative">
          <textarea
            aria-label="Raw Ciphertext, Encoding or Binary Data"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            rows={5}
            className="w-full bg-[#0B0F17] text-slate-100 font-mono text-xs p-3.5 rounded-lg border border-[#232B3E] focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-all resize-y"
            placeholder="Paste raw ciphertext, encoding, hex bytes, binary string or structured payload here..."
          />

          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#161B26] hover:bg-[#1F2739] text-slate-300 text-xs font-mono border border-[#232B3E] transition-all">
                <Upload className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Upload File</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.bin,.log,.csv,.json"
                />
              </label>

              <button
                onClick={() => setInputContent('')}
                className="text-xs font-mono text-slate-500 hover:text-slate-300 px-2 py-1"
              >
                Clear
              </button>
            </div>

            <span className="text-xs font-mono text-slate-500">
              Length: {inputContent.length} chars | Caps: {currentProfile === 'STANDARD' ? '10 MB' : currentProfile === 'SECURE' ? '2 MB' : '500 KB'}
            </span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleRunPipeline}
            disabled={isLoading || !inputContent.trim()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00E5FF] to-blue-600 hover:from-[#00E5FF]/90 hover:to-blue-600/90 text-black font-mono font-bold text-xs tracking-wider transition-all shadow-lg shadow-[#00E5FF]/20 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : <Play className="w-4 h-4 text-black fill-black" />}
            <span>RUN RECURSIVE PIPELINE</span>
          </button>

          <button
            onClick={handleDetectOnly}
            disabled={isLoading || !inputContent.trim()}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-[#161B26] hover:bg-[#1F2739] text-white border border-[#232B3E] hover:border-slate-500 font-mono text-xs font-medium transition-all"
          >
            <Search className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Detect Heuristics</span>
          </button>

          <button
            onClick={handleCaesarBrute}
            disabled={isLoading || !inputContent.trim()}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-[#161B26] hover:bg-[#1F2739] text-white border border-[#232B3E] hover:border-slate-500 font-mono text-xs font-medium transition-all"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Caesar Brute-Force</span>
          </button>

          <button
            onClick={handleXorBrute}
            disabled={isLoading || !inputContent.trim()}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-[#161B26] hover:bg-[#1F2739] text-white border border-[#232B3E] hover:border-slate-500 font-mono text-xs font-medium transition-all"
          >
            <Binary className="w-3.5 h-3.5 text-purple-400" />
            <span>XOR Single-Byte</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-lg flex items-center space-x-2 text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Statistical Metrics Bar */}
      {detectionResult && (
        <MetricsBar
          metrics={detectionResult.metrics}
          executionTimeMs={detectionResult.execution_time_ms}
        />
      )}

      {/* Detected Hypotheses Cards */}
      {detectionResult && detectionResult.hypotheses.length > 0 && (
        <div className="glass-panel p-5 rounded-xl space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#232B3E] pb-2">
            <Layers className="w-4 h-4 text-[#00E5FF]" />
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Heuristic Candidate Hypotheses ({detectionResult.hypotheses.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {detectionResult.hypotheses.map((hyp, i) => (
              <div
                key={i}
                className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E] hover:border-slate-600 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white truncate">{hyp.name}</span>
                  <span
                    className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                      hyp.confidence >= 90
                        ? 'bg-[#00E676]/20 text-[#00E676]'
                        : hyp.confidence >= 75
                        ? 'bg-amber-400/20 text-amber-400'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {hyp.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">{hyp.details}</div>
                <div className="text-[9px] font-mono text-slate-500 uppercase">{hyp.family}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transformation Pipeline DAG */}
      {dagResult && (
        <TransformationDAG
          dag={dagResult}
        />
      )}

      {/* Candidate Plaintext Ranking */}
      {(dagResult?.best_candidate || cipherCandidates.length > 0) && (
        <CandidateTable
          candidates={cipherCandidates}
          bestCandidate={dagResult?.best_candidate}
          onExplain={(cand) => {
            if (onNavigateToExplain) {
              onNavigateToExplain({
                detected_cipher_or_encoding: cand.transformation,
                shannon_entropy: detectionResult?.metrics.shannon_entropy || 4.2,
                index_of_coincidence: detectionResult?.metrics.index_of_coincidence || 0.065,
                candidate_text: cand.text,
                score: cand.score
              });
            }
          }}
        />
      )}
    </div>
  );
};
