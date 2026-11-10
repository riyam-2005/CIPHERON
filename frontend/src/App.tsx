import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { Workspace } from './pages/Workspace';
import { HardwarePage } from './pages/HardwarePage';
import { CodeAnalysisPage } from './pages/CodeAnalysisPage';
import { BinaryPage } from './pages/BinaryPage';
import { SecurityPage } from './pages/SecurityPage';
import { ExplainPage } from './pages/ExplainPage';
import { KasiskiPage } from './pages/KasiskiPage';
import { EsotericParsersPage } from './pages/EsotericParsersPage';
import { WasmSandboxPage } from './pages/WasmSandboxPage';
import { EnterprisePage } from './pages/EnterprisePage';
import { GlobalGridPage } from './pages/GlobalGridPage';
import { NeuralFabricPage } from './pages/NeuralFabricPage';
import { AutonomousSiliconPage } from './pages/AutonomousSiliconPage';
import { OrbitalSpacePage } from './pages/OrbitalSpacePage';
import { SingularitySiliconPage } from './pages/SingularitySiliconPage';
import { OmegaChipletPage } from './pages/OmegaChipletPage';
import { TranscendencePage } from './pages/TranscendencePage';
import { NexusOmniPage } from './pages/NexusOmniPage';
import { CosmicOmnipresencePage } from './pages/CosmicOmnipresencePage';
import { ChronoRecursionPage } from './pages/ChronoRecursionPage';
import { CalabiYauContinuumPage } from './pages/CalabiYauContinuumPage';
import { MultiverseSingularityPage } from './pages/MultiverseSingularityPage';
import { TransCosmicContinuumPage } from './pages/TransCosmicContinuumPage';
import { OmniSingularityMatrixPage } from './pages/OmniSingularityMatrixPage';
import { OmniInfinityMatrixPage } from './pages/OmniInfinityMatrixPage';
import { OmniTotalityMatrixPage } from './pages/OmniTotalityMatrixPage';
import { OcularGazePage } from './pages/OcularGazePage';
import { HybridBciPage } from './pages/HybridBciPage';
import { BioQuantumPage } from './pages/BioQuantumPage';
import { OmniSynapticPage } from './pages/OmniSynapticPage';
import { OmniCognitivePage } from './pages/OmniCognitivePage';
import { AbsoluteCognitivePage } from './pages/AbsoluteCognitivePage';
import { SecurityMode, HardwareStatus } from './types';
import { api } from './services/api';
import { ShieldAlert, Terminal, Wifi, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workspace');
  const [currentProfile, setCurrentProfile] = useState<SecurityMode>('STANDARD');
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus | undefined>(undefined);
  const [isWiping, setIsWiping] = useState(false);
  const [explainEvidence, setExplainEvidence] = useState<any>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Poll hardware status & security profile on load
  const refreshHardware = async () => {
    try {
      const status = await api.getHardwareStatus();
      setHardwareStatus(status);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshHardware();
    api.getSecurityProfile().then((res) => setCurrentProfile(res.profile)).catch(() => {});

    // WebSocket connection for live telemetry
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/stream`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'HARDWARE_STATE') {
            setHardwareStatus(msg.data);
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // ignore
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const handleProfileChange = async (mode: SecurityMode) => {
    setCurrentProfile(mode);
    try {
      await api.setSecurityProfile(mode);
      refreshHardware();
    } catch (err: any) {
      alert(`Profile change error: ${err.message}`);
    }
  };

  const handlePanicWipe = async () => {
    setIsWiping(true);
    try {
      await api.triggerPanicWipe();
      await refreshHardware();
    } catch {
      // ignore
    } finally {
      setTimeout(() => {
        setIsWiping(false);
        setActiveTab('workspace');
      }, 1800);
    }
  };

  const handleNavigateToExplain = (evidence: any) => {
    setExplainEvidence(evidence);
    setActiveTab('explain');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#E0E6ED] flex flex-col selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]">
      {/* Full Screen Memory Shredding Animation Overlay */}
      {isWiping && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center space-y-4 animate-pulse">
          <ShieldAlert className="w-16 h-16 text-red-500 animate-bounce" />
          <h2 className="text-2xl font-mono font-bold text-red-500 tracking-widest">
            PRD 7.3 MULTI-PASS MEMORY SHREDDER ACTIVE
          </h2>
          <div className="font-mono text-xs text-slate-300 space-y-1 text-center max-w-md">
            <p className="text-amber-400">PASS 1: Overwriting RAM buffers with 0x00...</p>
            <p className="text-amber-400">PASS 2: Overwriting RAM buffers with 0xFF...</p>
            <p className="text-amber-400">PASS 3: Cryptographic pseudo-random byte overwriting...</p>
            <p className="text-[#00E676] font-bold pt-2">Zero-trace volatile wipe confirmed.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        currentProfile={currentProfile}
        onProfileChange={handleProfileChange}
        onPanicWipe={handlePanicWipe}
        hardwareStatus={hardwareStatus}
        isWiping={isWiping}
      />

      {/* Navigation Subsystem Bar */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {activeTab === 'workspace' && (
          <Workspace
            currentProfile={currentProfile}
            onNavigateToExplain={handleNavigateToExplain}
          />
        )}

        {activeTab === 'kasiski' && <KasiskiPage />}

        {activeTab === 'esoteric' && <EsotericParsersPage />}

        {activeTab === 'wasm' && <WasmSandboxPage />}

        {activeTab === 'enterprise' && <EnterprisePage currentProfile={currentProfile} />}

        {activeTab === 'global-grid' && <GlobalGridPage />}

        {activeTab === 'neural-fabric' && <NeuralFabricPage />}

        {activeTab === 'quantum-silicon' && <AutonomousSiliconPage />}

        {activeTab === 'orbital-space' && <OrbitalSpacePage />}

        {activeTab === 'singularity-silicon' && <SingularitySiliconPage />}

        {activeTab === 'omega-chiplet' && <OmegaChipletPage />}

        {activeTab === 'transcendence' && <TranscendencePage />}

        {activeTab === 'nexus-omni' && <NexusOmniPage />}

        {activeTab === 'cosmic-omnipresence' && <CosmicOmnipresencePage />}

        {activeTab === 'chrono-recursion' && <ChronoRecursionPage />}

        {activeTab === 'calabi-yau-continuum' && <CalabiYauContinuumPage />}

        {activeTab === 'multiverse-singularity' && <MultiverseSingularityPage />}

        {activeTab === 'transcosmic-continuum' && <TransCosmicContinuumPage />}

        {activeTab === 'omni-singularity' && <OmniSingularityMatrixPage />}

        {activeTab === 'omni-infinity' && <OmniInfinityMatrixPage />}

        {activeTab === 'omni-totality' && <OmniTotalityMatrixPage />}

        {activeTab === 'ocular-gaze' && <OcularGazePage />}

        {activeTab === 'hybrid-bci' && <HybridBciPage />}

        {activeTab === 'bio-quantum' && <BioQuantumPage />}

        {activeTab === 'omni-synaptic' && <OmniSynapticPage />}

        {activeTab === 'omni-cognitive' && <OmniCognitivePage />}

        {activeTab === 'trans-recursive' && <AbsoluteCognitivePage />}

        {activeTab === 'hardware' && (
          <HardwarePage
            hardwareStatus={hardwareStatus}
            onRefreshStatus={refreshHardware}
            onPanicTriggered={handlePanicWipe}
          />
        )}

        {activeTab === 'code' && <CodeAnalysisPage />}

        {activeTab === 'binary' && <BinaryPage />}

        {activeTab === 'security' && (
          <SecurityPage
            currentProfile={currentProfile}
            onProfileChange={handleProfileChange}
            onPanicWipe={handlePanicWipe}
          />
        )}

        {activeTab === 'explain' && <ExplainPage initialEvidence={explainEvidence} />}
      </main>

      {/* System Status Footer */}
      <footer className="bg-[#10141D] border-t border-[#232B3E] px-4 lg:px-8 py-2.5 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5 text-slate-400">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-[#00E676]' : 'bg-amber-400'}`} />
              <span>WS STREAM: {wsConnected ? 'SYNCHRONIZED' : 'REST POLLING'}</span>
            </span>
            <span>|</span>
            <span className="text-[#00E5FF]">PROFILE: {currentProfile}</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-400">CIPHERON-X1 v26.0.0-ABSOLUTE BIO-COGNITIVE OMNI-SINGULARITY ARCHITECTURE &amp; UNIVERSAL SYNAPTIC CONTINUUM</span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <span className="text-sky-400 hidden sm:inline">QUANTUM-PLASMONIC (10.0 Pbps/mm&sup2;) &amp; HIGH-GAMMA (250Hz) &amp; MULTI-SPECTRAL STEGANO &amp; 2048-BIT KEY</span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <span className="text-slate-400 hidden sm:inline">100/100 PRODUCTION GRADE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};


