import React, { useState } from 'react';
import { api } from '../services/api';
import { BinaryAnalysisResult, HashAnalysisResult } from '../types';
import { Binary, Search, ShieldAlert, BarChart3, FileQuestion, Hash } from 'lucide-react';

export const BinaryPage: React.FC = () => {
  const [binaryInput, setBinaryInput] = useState<string>(
    '89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52 00 00 00 10 00 00 00 10 08 06 00 00 00'
  );
  const [binResult, setBinResult] = useState<BinaryAnalysisResult | null>(null);
  const [hashResult, setHashResult] = useState<HashAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInspect = async () => {
    if (!binaryInput.trim()) return;
    setIsLoading(true);

    try {
      // 1. Check for Hash Structural Signature
      const hRes = await api.inspectHash(binaryInput);
      setHashResult(hRes);

      // 2. Perform Binary Inspection
      const bRes = await api.inspectBinary(binaryInput);
      setBinResult(bRes);
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
            <Binary className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-mono text-base font-bold text-white tracking-wide">
              BINARY INSPECTOR & HASH SIGNATURE DETECTOR
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            FR-6.1 - 6.4 Magic byte identification, hex formatting, frequency distribution, and hash integrity proofs.
          </p>
        </div>
      </div>

      {/* Input Box */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#232B3E] pb-2">
          <span className="text-xs font-mono text-slate-400">INPUT HEX BYTES OR HASH STRING:</span>
          <div className="flex space-x-2">
            <button
              onClick={() =>
                setBinaryInput('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
              }
              className="text-[10px] font-mono text-slate-400 hover:text-[#00E5FF]"
            >
              Load SHA-256 Vector
            </button>
            <button
              onClick={() =>
                setBinaryInput('89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52')
              }
              className="text-[10px] font-mono text-slate-400 hover:text-[#00E5FF]"
            >
              Load PNG Magic
            </button>
          </div>
        </div>

        <textarea
          aria-label="Hex bytes or cryptographic hash string input"
          value={binaryInput}
          onChange={(e) => setBinaryInput(e.target.value)}
          rows={3}
          className="w-full bg-[#0B0F17] text-slate-100 font-mono text-xs p-3.5 rounded-lg border border-[#232B3E] focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-all resize-y"
          placeholder="Paste hex bytes (e.g. 89 50 4E 47 ...) or hash checksum (e.g. SHA-256, MD5)..."
        />

        <button
          onClick={handleInspect}
          disabled={isLoading || !binaryInput.trim()}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-bold text-xs tracking-wider transition-all"
        >
          <Search className="w-4 h-4" />
          <span>INSPECT SIGNATURE & HEX</span>
        </button>
      </div>

      {/* FR-6.2 Hash Integrity Notice Banner */}
      {hashResult?.is_hash && (
        <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-xl p-4 flex items-start space-x-3 text-amber-300 font-mono text-xs">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-400 uppercase tracking-wide">
              FR-6.2 CRYPTOGRAPHIC HASH ONE-WAY INTEGRITY NOTICE
            </div>
            <p className="text-slate-200">{hashResult.integrity_notice}</p>
            <p className="text-[11px] text-slate-400 pt-1">
              Algorithms Identified: {hashResult.detected_algorithms.join(', ')} ({hashResult.bit_length} bits).
            </p>
          </div>
        </div>
      )}

      {/* Binary Inspection Results */}
      {binResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Signature Metadata (4 cols) */}
          <div className="lg:col-span-4 glass-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#232B3E] pb-2 font-mono text-xs font-bold text-white">
              <FileQuestion className="w-4 h-4 text-[#00E5FF]" />
              <span>FILE SIGNATURE METADATA</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
                <span className="text-slate-500 text-[10px] block">Identified File Type</span>
                <span className="text-white font-bold">{binResult.file_type}</span>
              </div>

              <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
                <span className="text-slate-500 text-[10px] block">MIME Type</span>
                <span className="text-[#00E5FF] font-bold">{binResult.mime_type}</span>
              </div>

              <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
                <span className="text-slate-500 text-[10px] block">Magic Hex Bytes (Prefix)</span>
                <span className="text-purple-400 font-bold">{binResult.magic_hex}</span>
              </div>

              <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E]">
                <span className="text-slate-500 text-[10px] block">Byte Length</span>
                <span className="text-white font-bold">{binResult.size_bytes} bytes</span>
              </div>
            </div>

            {/* Byte Frequency Histogram Mini Preview */}
            <div className="pt-2">
              <span className="text-[11px] font-mono text-slate-400 block mb-2 flex items-center space-x-1">
                <BarChart3 className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Byte Distribution (0x00 - 0xFF)</span>
              </span>
              <div className="h-20 bg-[#0B0F17] rounded-lg border border-[#232B3E] flex items-end p-1 gap-[1px] overflow-hidden">
                {binResult.byte_histogram.slice(0, 64).map((cnt, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-[#00E5FF]"
                    style={{ height: `${Math.min(100, (cnt / (Math.max(...binResult.byte_histogram) || 1)) * 100)}%` }}
                    title={`Byte 0x${i.toString(16).padStart(2, '0')}: count=${cnt}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Formatted Hex Viewer (8 cols) */}
          <div className="lg:col-span-8 glass-panel p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#232B3E] pb-2 font-mono text-xs text-slate-400">
              <span className="font-bold text-white">FORMATTED HEX DUMP</span>
              <span>16 BYTES PER LINE</span>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E] font-mono text-[11px] max-h-96 overflow-y-auto select-all">
              <div className="text-slate-600 border-b border-[#232B3E] pb-1 mb-1 grid grid-cols-12">
                <span className="col-span-2">OFFSET</span>
                <span className="col-span-7">00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F</span>
                <span className="col-span-3">ASCII</span>
              </div>
              {binResult.hex_dump.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 hover:bg-[#161B26] py-0.5">
                  <span className="col-span-2 text-slate-500">{row.offset}</span>
                  <span className="col-span-7 text-[#00E5FF]">{row.hex}</span>
                  <span className="col-span-3 text-slate-300 truncate">{row.ascii}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
