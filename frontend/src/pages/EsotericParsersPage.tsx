import React, { useState } from 'react';
import { api } from '../services/api';
import {
  JWTInspectionResult,
  ProtobufInspectionResult,
  CBORInspectionResult,
  Base85Result
} from '../types';
import { Layers, ShieldAlert, Key, Binary, Play, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';

type SubTab = 'jwt' | 'protobuf' | 'cbor' | 'base85' | 'braille';

export const EsotericParsersPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('jwt');
  const [inputVal, setInputVal] = useState<string>(
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIFNlY3VyaXR5IiwiYWRtaW4iOnRydWUsImV4cCI6MTk5OTk5OTk5OX0.'
  );

  const [jwtResult, setJwtResult] = useState<JWTInspectionResult | null>(null);
  const [protoResult, setProtoResult] = useState<ProtobufInspectionResult | null>(null);
  const [cborResult, setCborResult] = useState<CBORInspectionResult | null>(null);
  const [b85Result, setB85Result] = useState<Base85Result | null>(null);
  const [brailleResult, setBrailleResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const presets: Record<SubTab, { label: string; text: string }> = {
    jwt: {
      label: 'Vulnerable JWT (alg: none)',
      text: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIFNlY3VyaXR5IiwiYWRtaW4iOnRydWUsImV4cCI6MTk5OTk5OTk5OX0.'
    },
    protobuf: {
      label: 'Sample Protobuf Hex',
      text: '089601120568656c6c6f1d00002041'
    },
    cbor: {
      label: 'Sample CBOR Map Hex',
      text: 'a2616101616265776f726c64'
    },
    base85: {
      label: 'Ascii85 Stream',
      text: '<~87cURD]hD=:e4#Q:JL~>'
    },
    braille: {
      label: 'Unicode Braille',
      text: '⠓⠑⠇⠇⠕⠀⠉⠊⠏⠓⠑⠗⠕⠝'
    }
  };

  const handleSwitchTab = (tab: SubTab) => {
    setActiveSubTab(tab);
    setInputVal(presets[tab].text);
  };

  const handleParse = async () => {
    if (!inputVal.trim()) return;
    setIsLoading(true);

    try {
      if (activeSubTab === 'jwt') {
        const res = await api.inspectJwt(inputVal);
        setJwtResult(res);
      } else if (activeSubTab === 'protobuf') {
        const res = await api.decodeProtobuf(inputVal);
        setProtoResult(res);
      } else if (activeSubTab === 'cbor') {
        const res = await api.decodeCbor(inputVal);
        setCborResult(res);
      } else if (activeSubTab === 'base85') {
        const res = await api.decodeBase85(inputVal);
        setB85Result(res);
      } else if (activeSubTab === 'braille') {
        const res = await api.decodeBraille(inputVal);
        setBrailleResult(res.braille_decoded);
      }
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
            <Layers className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-mono text-base font-bold text-white tracking-wide">
              ESOTERIC FORMATS & SERIALIZATION DECODERS
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Section 3.2 Structured inspectors for JWT, Protocol Buffers wire formats, CBOR, Base85, and Braille.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center space-x-1 bg-[#0B0F17] p-1 rounded-lg border border-[#232B3E]">
          {[
            { id: 'jwt', label: 'JWT' },
            { id: 'protobuf', label: 'Protobuf' },
            { id: 'cbor', label: 'CBOR' },
            { id: 'base85', label: 'Base85' },
            { id: 'braille', label: 'Braille' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => handleSwitchTab(t.id as SubTab)}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold transition-all ${
                activeSubTab === t.id
                  ? 'bg-[#00E5FF] text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <textarea
          aria-label="Esoteric input text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          rows={3}
          className="w-full bg-[#0B0F17] text-slate-100 font-mono text-xs p-3.5 rounded-lg border border-[#232B3E] focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-all"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={handleParse}
            disabled={isLoading || !inputVal.trim()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-mono font-bold text-xs tracking-wider transition-all"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>INSPECT & PARSE FORMAT</span>
          </button>

          <span className="text-xs font-mono text-slate-500">
            Selected: {activeSubTab.toUpperCase()} Parser
          </span>
        </div>
      </div>

      {/* Results Rendering */}

      {/* 1. JWT Results */}
      {activeSubTab === 'jwt' && jwtResult && (
        <div className="space-y-4">
          {jwtResult.vulnerabilities && jwtResult.vulnerabilities.length > 0 && (
            <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-4 flex items-start space-x-3 text-red-300 font-mono text-xs">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-red-400">JWT VULNERABILITY DETECTED</div>
                {jwtResult.vulnerabilities.map((v, i) => (
                  <p key={i}>{v}</p>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Header */}
            <div className="glass-panel p-4 rounded-xl space-y-2 font-mono text-xs">
              <span className="text-[#00E5FF] font-bold block border-b border-[#232B3E] pb-1">
                HEADER (ALGORITHM & TOKEN TYPE)
              </span>
              <pre className="bg-[#0B0F17] p-3 rounded text-slate-200 overflow-x-auto">
                {JSON.stringify(jwtResult.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="glass-panel p-4 rounded-xl space-y-2 font-mono text-xs">
              <span className="text-[#00E676] font-bold block border-b border-[#232B3E] pb-1">
                PAYLOAD (CLAIMS & DATA)
              </span>
              <pre className="bg-[#0B0F17] p-3 rounded text-slate-200 overflow-x-auto">
                {JSON.stringify(jwtResult.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 2. Protobuf Results */}
      {activeSubTab === 'protobuf' && protoResult && (
        <div className="glass-panel p-5 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#232B3E] pb-2 text-white">
            <span className="font-bold">PARSED WIRE FIELDS ({protoResult.fields_parsed})</span>
            <span className="text-slate-400">{protoResult.total_bytes} bytes consumed</span>
          </div>

          <div className="space-y-2">
            {protoResult.fields.map((f, i) => (
              <div key={i} className="p-3 rounded-lg bg-[#0B0F17] border border-[#232B3E] flex items-center justify-between">
                <div>
                  <span className="text-[#00E5FF] font-bold">Field #{f.field}: </span>
                  <span className="text-slate-400">[{f.wire_type}]</span>
                </div>
                <div className="text-slate-200 font-bold">
                  {f.value !== undefined ? String(f.value) : f.hex ? `0x${f.hex}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CBOR Results */}
      {activeSubTab === 'cbor' && cborResult && (
        <div className="glass-panel p-5 rounded-xl space-y-3 font-mono text-xs">
          <span className="text-[#00E5FF] font-bold block border-b border-[#232B3E] pb-2">
            CBOR DECODED STRUCTURE
          </span>
          <pre className="bg-[#0B0F17] p-4 rounded-lg text-slate-200 overflow-x-auto">
            {JSON.stringify(cborResult.parsed_cbor, null, 2)}
          </pre>
        </div>
      )}

      {/* 4. Base85 Results */}
      {activeSubTab === 'base85' && b85Result && (
        <div className="glass-panel p-5 rounded-xl space-y-3 font-mono text-xs">
          <span className="text-amber-400 font-bold block border-b border-[#232B3E] pb-2">
            BASE85 DECODED PLAINTEXT
          </span>
          <div className="bg-[#0B0F17] p-4 rounded-lg text-white select-all">
            {b85Result.best_candidate}
          </div>
        </div>
      )}

      {/* 5. Braille Results */}
      {activeSubTab === 'braille' && brailleResult && (
        <div className="glass-panel p-5 rounded-xl space-y-3 font-mono text-xs">
          <span className="text-[#00E676] font-bold block border-b border-[#232B3E] pb-2">
            UNICODE BRAILLE TRANSLATED TEXT
          </span>
          <div className="bg-[#0B0F17] p-4 rounded-lg text-white select-all">
            {brailleResult}
          </div>
        </div>
      )}
    </div>
  );
};
