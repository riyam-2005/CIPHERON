import React, { useState } from 'react';
import { PipelineDAG, PipelineNode } from '../types';
import { GitBranch, Clock, CheckCircle2, ChevronRight, AlertTriangle, ShieldCheck, Copy, Check } from 'lucide-react';

interface TransformationDAGProps {
  dag?: PipelineDAG;
  onSelectNode?: (node: PipelineNode) => void;
}

export const TransformationDAG: React.FC<TransformationDAGProps> = ({ dag, onSelectNode }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!dag || !dag.nodes || dag.nodes.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-xl text-center text-slate-500 font-mono text-xs">
        <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#00E5FF]" />
        <span>No pipeline execution graph generated yet. Enter input and run analysis.</span>
      </div>
    );
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="glass-panel p-5 rounded-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232B3E] pb-3">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="font-mono text-sm font-bold text-white tracking-wide">
            TRANSFORMATION PIPELINE DAG
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
            {dag.nodes.length} NODES EXPLORED
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Total Latency: <span className="text-[#00E5FF] font-semibold">{dag.total_execution_time_ms.toFixed(1)} ms</span></span>
          </span>
          <span className="bg-[#0B0F17] px-2 py-0.5 rounded border border-[#232B3E]">
            MAX DEPTH: <span className="text-amber-400 font-semibold">{dag.recursion_depth} / 10</span>
          </span>
          {dag.cycle_detected && (
            <span className="flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>CYCLE HALTED</span>
            </span>
          )}
        </div>
      </div>

      {/* DAG Node Pathway */}
      <div className="relative overflow-x-auto py-2">
        <div className="flex items-center space-x-3 min-w-max">
          {dag.nodes.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            const isRoot = index === 0;
            const isBest = dag.best_candidate && node.output_snippet.includes(dag.best_candidate.text.slice(0, 20));

            return (
              <React.Fragment key={node.id}>
                {index > 0 && (
                  <div className="flex items-center text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}

                <div
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    if (onSelectNode) onSelectNode(node);
                  }}
                  className={`cursor-pointer rounded-lg p-3 w-64 border transition-all relative ${
                    isSelected
                      ? 'bg-[#1F2739] border-[#00E5FF] shadow-lg shadow-[#00E5FF]/20 ring-1 ring-[#00E5FF]'
                      : isBest
                      ? 'bg-[#161B26] border-[#00E676]/60 shadow-md shadow-[#00E676]/10'
                      : 'bg-[#0B0F17] border-[#232B3E] hover:border-slate-600 hover:bg-[#161B26]'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-slate-400 font-semibold">
                      {isRoot ? 'STAGE 0 (INPUT)' : `DEPTH ${node.depth}`}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold ${
                        node.score >= 70
                          ? 'bg-[#00E676]/20 text-[#00E676]'
                          : node.score >= 40
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      SCORE: {node.score.toFixed(1)}
                    </span>
                  </div>

                  {/* Transformation Name */}
                  <div className="font-mono text-xs font-bold text-white truncate mb-1">
                    {node.transformation} {node.parameter ? `(${node.parameter})` : ''}
                  </div>

                  {/* Snippet */}
                  <div className="bg-[#0B0F17]/90 p-1.5 rounded font-mono text-[11px] text-slate-300 break-all h-12 overflow-hidden border border-[#232B3E]/60">
                    {node.output_snippet}
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
                    <span>{node.execution_time_ms.toFixed(1)} ms</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(node.id, node.output_snippet);
                      }}
                      className="text-slate-400 hover:text-white flex items-center space-x-1"
                      title="Copy output"
                    >
                      {copiedId === node.id ? (
                        <Check className="w-3 h-3 text-[#00E676]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === node.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Status Indicator Pill */}
                  {isBest && (
                    <div className="absolute -top-2 -right-2 bg-[#00E676] text-black font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-full shadow-md">
                      TOP HIT
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
