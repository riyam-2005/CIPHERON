import React from 'react';
import { Microscope, Cpu, Code2, Binary, ShieldCheck, Sparkles, BarChart3, Layers, Box, Radio, Globe, Brain, Atom, Orbit, Zap, Share2, Wind, Globe2, History, Infinity, Eye } from 'lucide-react';

export type ActiveTab =
  | 'workspace'
  | 'kasiski'
  | 'esoteric'
  | 'wasm'
  | 'enterprise'
  | 'global-grid'
  | 'neural-fabric'
  | 'quantum-silicon'
  | 'orbital-space'
  | 'singularity-silicon'
  | 'omega-chiplet'
  | 'transcendence'
  | 'nexus-omni'
  | 'cosmic-omnipresence'
  | 'chrono-recursion'
  | 'calabi-yau-continuum'
  | 'multiverse-singularity'
  | 'transcosmic-continuum'
  | 'omni-singularity'
  | 'omni-infinity'
  | 'omni-totality'
  | 'ocular-gaze'
  | 'hybrid-bci'
  | 'bio-quantum'
  | 'omni-synaptic'
  | 'omni-cognitive'
  | 'trans-recursive'
  | 'hardware'
  | 'code'
  | 'binary'
  | 'security'
  | 'explain';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'workspace', label: 'Analysis Studio', icon: Microscope, badge: 'CORE' },
    { id: 'kasiski', label: 'Kasiski & IC Lab', icon: BarChart3, badge: 'V2.0' },
    { id: 'esoteric', label: 'Esoteric Formats', icon: Layers, badge: 'PARSERS' },
    { id: 'wasm', label: 'WASM Sandbox', icon: Box, badge: 'PLUGINS' },
    { id: 'enterprise', label: 'Swarm & PQC Hub', icon: Radio, badge: 'V4.0' },
    { id: 'global-grid', label: 'Global Grid & SMT', icon: Globe, badge: 'V5.0' },
    { id: 'neural-fabric', label: 'Neural Fabric & ZK', icon: Brain, badge: 'V6.0' },
    { id: 'quantum-silicon', label: 'Autonomous Silicon & QKD', icon: Atom, badge: 'V7.0' },
    { id: 'orbital-space', label: 'Orbital Space & Photonics', icon: Orbit, badge: 'V8.0' },
    { id: 'singularity-silicon', label: 'Singularity Silicon & DTN', icon: Zap, badge: 'V9.0' },
    { id: 'omega-chiplet', label: 'Omega 3D Chiplet & HDC', icon: Share2, badge: 'V10.0' },
    { id: 'transcendence', label: 'Transcendence QGNN & MOF', icon: Wind, badge: 'V11.0' },
    { id: 'nexus-omni', label: 'Nexus Omni-Synthesis', icon: Atom, badge: 'V12.0' },
    { id: 'cosmic-omnipresence', label: 'Cosmic Omnipresence', icon: Globe2, badge: 'V13.0' },
    { id: 'chrono-recursion', label: 'Chrono-Recursion & Inversion', icon: History, badge: 'V14.0' },
    { id: 'calabi-yau-continuum', label: 'Calabi-Yau Continuum', icon: Infinity, badge: 'V15.0' },
    { id: 'multiverse-singularity', label: 'Trans-Finite Multiverse', icon: Sparkles, badge: 'V16.0' },
    { id: 'transcosmic-continuum', label: 'Trans-Cosmic Continuum', icon: Orbit, badge: 'V17.0' },
    { id: 'omni-singularity', label: 'Ultimate Omni-Singularity', icon: Sparkles, badge: 'V18.0' },
    { id: 'omni-infinity', label: 'Omni-Existential Infinity', icon: Infinity, badge: 'V19.0' },
    { id: 'omni-totality', label: 'Omni-Existential Totality', icon: Sparkles, badge: 'V20.0' },
    { id: 'ocular-gaze', label: 'Ocular & Eye-Gaze Biometrics', icon: Eye, badge: 'V21.0' },
    { id: 'hybrid-bci', label: 'Hybrid BCI & Neural Intent', icon: Brain, badge: 'V22.0' },
    { id: 'bio-quantum', label: 'Bio-Quantum Neural Mesh', icon: Atom, badge: 'V23.0' },
    { id: 'omni-synaptic', label: 'Omni-Synaptic Matrix', icon: Layers, badge: 'V24.0' },
    { id: 'omni-cognitive', label: 'Omni-Cognitive Singularity', icon: Atom, badge: 'V25.0' },
    { id: 'trans-recursive', label: 'Absolute Omni-Cognitive', icon: Atom, badge: 'V26.0' },
    { id: 'hardware', label: 'ESP32 Hardware Lab', icon: Cpu, badge: 'OLED' },
    { id: 'code', label: 'Code Intelligence', icon: Code2, badge: 'AST' },
    { id: 'binary', label: 'Binary & Hashes', icon: Binary, badge: 'HEX' },
    { id: 'security', label: 'Security & Provenance', icon: ShieldCheck, badge: 'MERKLE' },
    { id: 'explain', label: 'Cryptanalysis Proofs', icon: Sparkles, badge: 'AI' }
  ];

  return (
    <nav className="bg-[#0B0F17] border-b border-[#232B3E] px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as ActiveTab)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#161B26] text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm shadow-[#00E5FF]/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B26]/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#00E5FF]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'bg-[#161B26] text-slate-500'}`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

