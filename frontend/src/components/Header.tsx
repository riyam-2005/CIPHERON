import React, { useState } from 'react';
import { Shield, ShieldAlert, Cpu, AlertTriangle, RefreshCw, Activity, Terminal } from 'lucide-react';
import { SecurityMode, HardwareStatus } from '../types';

interface HeaderProps {
  currentProfile: SecurityMode;
  onProfileChange: (mode: SecurityMode) => void;
  onPanicWipe: () => void;
  hardwareStatus?: HardwareStatus;
  isWiping?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  onProfileChange,
  onPanicWipe,
  hardwareStatus,
  isWiping
}) => {
  const [showPanicModal, setShowPanicModal] = useState(false);

  const getProfileBadge = () => {
    switch (currentProfile) {
      case 'FORTRESS':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-500/40',
          label: 'FORTRESS (500KB RAM-ONLY)'
        };
      case 'SECURE':
        return {
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          label: 'SECURE (2MB LOCALHOST)'
        };
      default:
        return {
          color: 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40',
          label: 'STANDARD (10MB FULL)'
        };
    }
  };

  const badge = getProfileBadge();

  return (
    <>
      <header className="bg-[#161B26]/90 border-b border-[#232B3E] px-4 lg:px-8 py-3 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-blue-600/30 border border-[#00E5FF]/40 shadow-lg shadow-[#00E5FF]/10">
              <Cpu className="w-6 h-6 text-[#00E5FF] animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00E676] rounded-full ring-2 ring-[#0B0F17]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-mono text-xl font-bold tracking-wider text-white">CIPHERON-X1</h1>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#232B3E] text-slate-300 border border-slate-700">
                  HW-v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Universal Code, Encoding & Classical Cipher Analysis Device</p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center flex-wrap gap-3">
            {/* ESP32 Status Pill */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-[#0B0F17] border border-[#232B3E] text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${hardwareStatus?.panic_triggered ? 'bg-red-500 animate-ping' : 'bg-[#00E676]'}`} />
              <span className="text-slate-300">ESP32 LINK:</span>
              <span className="text-[#00E5FF] font-semibold">{hardwareStatus ? 'AUTHENTICATED' : 'SIMULATOR'}</span>
            </div>

            {/* Profile Selector */}
            <div className="flex items-center space-x-1.5">
              <label htmlFor="security-profile-select" className="text-xs text-slate-400 font-mono hidden sm:inline">MODE:</label>
              <select
                id="security-profile-select"
                aria-label="Security Profile Selection"
                value={currentProfile}
                onChange={(e) => onProfileChange(e.target.value as SecurityMode)}
                className={`text-xs font-mono font-medium px-2.5 py-1.5 rounded-md border outline-none cursor-pointer transition-all ${badge.color}`}
              >
                <option value="STANDARD" className="bg-[#161B26] text-[#00E5FF]">STANDARD (10MB)</option>
                <option value="SECURE" className="bg-[#161B26] text-[#FFB300]">SECURE (2MB)</option>
                <option value="FORTRESS" className="bg-[#161B26] text-[#FF3D00]">FORTRESS (500KB)</option>
              </select>
            </div>

            {/* Emergency Panic Wipe Button */}
            <button
              onClick={() => setShowPanicModal(true)}
              disabled={isWiping}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/50 hover:border-red-400 text-xs font-mono font-bold tracking-wide transition-all shadow-sm hover:shadow-red-500/20"
              title="Shred volatile RAM and reset system state"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>PANIC WIPE</span>
            </button>
          </div>
        </div>
      </header>

      {/* Panic Wipe Confirmation Modal */}
      {showPanicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161B26] border-2 border-red-500 max-w-md w-full rounded-xl p-6 shadow-2xl shadow-red-500/30 space-y-4">
            <div className="flex items-center space-x-3 text-red-500">
              <ShieldAlert className="w-8 h-8 flex-shrink-0 animate-bounce" />
              <div>
                <h3 className="text-lg font-bold text-white font-mono">EMERGENCY PANIC SHREDDER</h3>
                <p className="text-xs text-red-400 font-mono">PRD 7.3 Cryptographic Memory Wipe</p>
              </div>
            </div>

            <div className="bg-[#0B0F17] p-3 rounded border border-red-500/30 text-xs font-mono text-slate-300 space-y-1">
              <p>• Overwrites volatile RAM: <span className="text-amber-400">0x00 &rarr; 0xFF &rarr; Random</span></p>
              <p>• Erases transient SQLite session tables and triggers VACUUM</p>
              <p>• Invalidates hardware WebSocket session tokens</p>
              <p>• Resets virtual & physical ESP32 OLED display</p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowPanicModal(false)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  setShowPanicModal(false);
                  onPanicWipe();
                }}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono tracking-wider flex items-center space-x-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>CONFIRM SHRED</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
