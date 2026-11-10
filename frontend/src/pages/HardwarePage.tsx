import React from 'react';
import { HardwareStatus } from '../types';
import { VirtualESP32 } from '../hardware/VirtualESP32';
import { Cpu, ShieldCheck, Zap, HardDrive, Wifi } from 'lucide-react';

interface HardwarePageProps {
  hardwareStatus?: HardwareStatus;
  onRefreshStatus?: () => void;
  onPanicTriggered?: () => void;
}

export const HardwarePage: React.FC<HardwarePageProps> = ({
  hardwareStatus,
  onRefreshStatus,
  onPanicTriggered
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-mono text-base font-bold text-white tracking-wide">
              ESP32 EMBEDDED CONTROLLER LAB
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Simulated / Physical Hardware Subsystem adhering to ESP-IDF v5.x Specifications
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="flex items-center space-x-1 px-3 py-1.5 rounded bg-[#0B0F17] text-[#00E676] border border-[#232B3E]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Boot v2 Verified</span>
          </span>
          <span className="flex items-center space-x-1 px-3 py-1.5 rounded bg-[#0B0F17] text-[#00E5FF] border border-[#232B3E]">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Flash Encrypted (XTS-AES)</span>
          </span>
        </div>
      </div>

      {/* Photorealistic Virtual ESP32 Enclosure & Console */}
      <VirtualESP32
        hardwareStatus={hardwareStatus}
        onRefreshStatus={onRefreshStatus}
        onPanicTriggered={onPanicTriggered}
      />
    </div>
  );
};
