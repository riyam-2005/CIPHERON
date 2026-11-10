import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { WASMPlugin } from '../types';
import { Box, Play, ShieldCheck, Zap, HardDrive, Clock, CheckCircle } from 'lucide-react';

export const WasmSandboxPage: React.FC = () => {
  const [plugins, setPlugins] = useState<WASMPlugin[]>([]);
  const [selectedPluginId, setSelectedPluginId] = useState<string>('plugin_rot47_wasm');
  const [testPayload, setTestPayload] = useState<string>('Hello World! CIPHERON-X1');
  const [execResult, setExecResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.listPlugins().then(setPlugins).catch(() => {});
  }, []);

  const handleRunPlugin = async () => {
    if (!testPayload.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.executePlugin(selectedPluginId, testPayload);
      setExecResult(res);
      // Refresh invocation stats
      api.listPlugins().then(setPlugins).catch(() => {});
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
            <Box className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-mono text-base font-bold text-white tracking-wide">
              WEBASSEMBLY (WASM) SANDBOXED PLUGIN RUNTIME
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Section 4.1 Strict Wasmtime execution guarantees: 16 MB memory ceiling, 100ms CPU budget, zero system calls.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded bg-emerald-500/10 text-[#00E676] border border-emerald-500/30 flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Stateless WASM Sandbox Active</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Plugins List (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#232B3E] pb-2 font-mono text-xs text-slate-400">
            <span className="font-bold text-white">REGISTERED SANDBOXED PLUGINS ({plugins.length})</span>
          </div>

          <div className="space-y-2.5">
            {plugins.map((p) => {
              const isSelected = selectedPluginId === p.plugin_id;
              return (
                <div
                  key={p.plugin_id}
                  onClick={() => setSelectedPluginId(p.plugin_id)}
                  className={`p-3.5 rounded-lg border cursor-pointer font-mono text-xs transition-all ${
                    isSelected
                      ? 'bg-[#1F2739] border-[#00E5FF] shadow-lg shadow-[#00E5FF]/10 ring-1 ring-[#00E5FF]'
                      : 'bg-[#0B0F17] border-[#232B3E] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-[10px] text-slate-500">{p.total_invocations} runs</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">{p.description}</p>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                    <span>Memory: {p.max_memory_mb} MB Cap</span>
                    <span>&bull;</span>
                    <span>Timeout: {p.timeout_ms} ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution Runner & Console (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-xl space-y-4">
          <div className="font-mono text-xs font-bold text-white border-b border-[#232B3E] pb-2">
            SANDBOX EXECUTION RUNNER
          </div>

          <div className="space-y-2 font-mono text-xs">
            <label className="text-slate-400">TEST PAYLOAD BUFFER:</label>
            <textarea
              aria-label="WASM test payload input"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              rows={4}
              className="w-full bg-[#0B0F17] text-slate-100 font-mono text-xs p-3 rounded-lg border border-[#232B3E] focus:border-[#00E5FF] focus:outline-none"
            />
          </div>

          <button
            onClick={handleRunPlugin}
            disabled={isLoading || !testPayload.trim()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-bold text-xs tracking-wider transition-all"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>DISPATCH TO WASM SANDBOX</span>
          </button>

          {/* Execution Metrics & Output */}
          {execResult && (
            <div className="pt-3 border-t border-[#232B3E] space-y-3 font-mono text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#0B0F17] p-2.5 rounded border border-[#232B3E]">
                  <span className="text-slate-500 text-[10px] block">Execution Time</span>
                  <span className="text-emerald-400 font-bold">{execResult.execution_time_ms} ms</span>
                </div>
                <div className="bg-[#0B0F17] p-2.5 rounded border border-[#232B3E]">
                  <span className="text-slate-500 text-[10px] block">Fuel Metering</span>
                  <span className="text-[#00E5FF] font-bold">{execResult.fuel_consumed || 0} units</span>
                </div>
                <div className="bg-[#0B0F17] p-2.5 rounded border border-[#232B3E]">
                  <span className="text-slate-500 text-[10px] block">Sandbox Memory</span>
                  <span className="text-purple-400 font-bold">{execResult.memory_used_kb || 0} KB</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">OUTPUT RESULT:</span>
                <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E] text-white select-all break-all">
                  {execResult.output || execResult.error}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
