import React, { useState } from 'react';
import { HardwareStatus } from '../types';
import { api } from '../services/api';
import { Terminal, Volume2, VolumeX, ShieldAlert, Cpu, Sparkles, Send, RotateCcw, RotateCw, Radio, Activity, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface VirtualESP32Props {
  hardwareStatus?: HardwareStatus;
  onRefreshStatus?: () => void;
  onPanicTriggered?: () => void;
}

export const VirtualESP32: React.FC<VirtualESP32Props> = ({
  hardwareStatus,
  onRefreshStatus,
  onPanicTriggered
}) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [encoderPos, setEncoderPos] = useState<number>(0);
  const [encoderAngle, setEncoderAngle] = useState<number>(0);
  const [tamperMeshStatus, setTamperMeshStatus] = useState<'SECURE' | 'TAMPER_DETECTED'>('SECURE');
  const [activeTab, setActiveTab] = useState<'PINOUT' | 'DUAL_CORE'>('DUAL_CORE');
  const [packetLog, setPacketLog] = useState<string[]>([
    '[TX 0xAA 0x55] PKT_HEARTBEAT len=4 crc=0x18F4',
    '[RX 0xAA 0x55] PKT_STATUS seq=12 state=ONLINE heap=184320',
    '[TX 0xAA 0x55] PKT_TAMPER_PULSE out=GPIO3 in=GPIO2 mesh=INTACT',
    '[TX 0xAA 0x55] PKT_ENCODER_INIT a=GPIO6 b=GPIO7 sw=GPIO8 state=0',
    '[TX 0xAA 0x55] PKT_OLED_UPDATE lines=4 mode=STANDARD'
  ]);

  const playBip = () => {
    if (!audioEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio not permitted or supported
    }
  };

  const handleKeyClick = async (key: string) => {
    setActiveKey(key);
    playBip();
    setTimeout(() => setActiveKey(null), 150);

    const logMsg = `[TX 0xAA 0x55] PKT_KEYPAD key='${key}'`;
    setPacketLog((prev) => [logMsg, ...prev.slice(0, 19)]);

    try {
      await api.interactHardware({
        packet_type: 'KEYPAD',
        payload: { key },
        seq_num: 1,
        timestamp: Date.now()
      });
      if (onRefreshStatus) onRefreshStatus();
    } catch {
      // ignore
    }
  };

  const handleButtonClick = async (btn: 'ENTER' | 'BACK' | 'CLEAR' | 'PANIC') => {
    playBip();
    const logMsg = `[TX 0xAA 0x55] PKT_BUTTON btn='${btn}'`;
    setPacketLog((prev) => [logMsg, ...prev.slice(0, 19)]);

    if (btn === 'PANIC' && onPanicTriggered) {
      onPanicTriggered();
      return;
    }

    try {
      await api.interactHardware({
        packet_type: 'BUTTON',
        payload: { button: btn },
        seq_num: 1,
        timestamp: Date.now()
      });
      if (onRefreshStatus) onRefreshStatus();
    } catch {
      // ignore
    }
  };

  const handleEncoderRotate = async (dir: 'CW' | 'CCW') => {
    playBip();
    const delta = dir === 'CW' ? 1 : -1;
    const newPos = encoderPos + delta;
    const newAngle = encoderAngle + delta * 30;
    setEncoderPos(newPos);
    setEncoderAngle(newAngle);

    const logMsg = `[TX 0xAA 0x55] PKT_ENCODER dir=${dir} delta=${delta > 0 ? '+1' : '-1'} pos=${newPos} angle=${((newAngle % 360) + 360) % 360}°`;
    setPacketLog((prev) => [logMsg, ...prev.slice(0, 19)]);

    try {
      await api.interactHardware({
        packet_type: 'ENCODER',
        payload: { direction: dir, delta, position: newPos },
        seq_num: 1,
        timestamp: Date.now()
      });
      if (onRefreshStatus) onRefreshStatus();
    } catch {
      // ignore
    }
  };

  const handleEncoderSwitch = async () => {
    playBip();
    const logMsg = `[TX 0xAA 0x55] PKT_ENCODER_SW click=PUSH position=${encoderPos}`;
    setPacketLog((prev) => [logMsg, ...prev.slice(0, 19)]);

    try {
      await api.interactHardware({
        packet_type: 'ENCODER_SW',
        payload: { button: 'CLICK', position: encoderPos },
        seq_num: 1,
        timestamp: Date.now()
      });
      if (onRefreshStatus) onRefreshStatus();
    } catch {
      // ignore
    }
  };

  const handleSimulateTamper = () => {
    setTamperMeshStatus('TAMPER_DETECTED');
    const logMsg = `[ALERT 0xFF 0x00] PKT_TAMPER_ALERT active_pulse=MISMATCH (Expected 0x5A != Received 0x00) -> ULP ZEROIZATION TRIGGERED!`;
    setPacketLog((prev) => [logMsg, ...prev.slice(0, 19)]);
    if (onPanicTriggered) {
      onPanicTriggered();
    }
  };

  const matrixKeys = [
    ['1', '2', '3', 'A'],
    ['4', '5', '6', 'B'],
    ['7', '8', '9', 'C'],
    ['*', '0', '#', 'D']
  ];

  const oledLines = hardwareStatus?.oled_lines || [
    'CIPHERON-X1 READY',
    'MODE: STANDARD',
    'COMM: SECURE SERIAL',
    'WAITING FOR INPUT...'
  ];

  const led = hardwareStatus?.rgb_led || { r: 0, g: 255, b: 100 };
  const ledColor = `rgb(${led.r}, ${led.g}, ${led.b})`;
  const ledGlow = `0 0 15px rgba(${led.r}, ${led.g}, ${led.b}, 0.8)`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Photorealistic Virtual ESP32 Enclosure (7 cols) */}
      <div className="lg:col-span-7 bg-[#10141D] border-2 border-[#232B3E] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Enclosure Badge */}
        <div className="flex items-center justify-between border-b border-[#232B3E] pb-3 mb-6">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#00E5FF]" />
            <span className="font-mono text-xs font-bold text-white tracking-widest uppercase">
              ESP32-S3 CONTROLLER (V7.0 AUTONOMOUS SILICON & QUANTUM MESH)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="text-slate-400 hover:text-white p-1 rounded"
              title={audioEnabled ? 'Buzzer Audio Enabled' : 'Buzzer Muted'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-[#00E5FF]" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <span className="text-[10px] font-mono text-pink-400 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#232B3E]">
              PHOTONIC TPU MZI
            </span>
            <span className="text-[10px] font-mono text-sky-400 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#232B3E]">
              LEO FSO 100G
            </span>
            <span className="text-[10px] font-mono text-blue-400 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#232B3E]">
              eFPGA 64-LUT
            </span>
            <span className="text-[10px] font-mono text-purple-400 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#232B3E]">
              QKD BB84 OPTICAL
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#232B3E]">
              ULP LIF-SNN 32N
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#232B3E]">
              RMT GLITCH PIN 21
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#232B3E]">
              ATECC608A 0x60
            </span>
            <span className="text-[10px] font-mono text-purple-400 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#232B3E]">
              NXP SE050 0x48
            </span>
          </div>
        </div>

        {/* Top Indicators: RGB LED & Buzzer Indicator */}
        <div className="flex items-center justify-between mb-4 px-2">
          {/* RGB LED */}
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full border border-white/20 transition-all duration-300"
              style={{ backgroundColor: ledColor, boxShadow: ledGlow }}
            />
            <span className="text-[11px] font-mono text-slate-400">
              STATUS RGB ({led.r > 200 ? 'ALERT' : led.b > 200 ? 'DECODING' : 'READY'})
            </span>
          </div>

          {/* Device Telemetry */}
          <div className="text-[10px] font-mono text-slate-400 space-x-2">
            <span>HEAP: {((hardwareStatus?.free_heap_bytes || 184320) / 1024).toFixed(0)} KB</span>
            <span>|</span>
            <span>BAT: {(hardwareStatus?.battery_mv || 4150) / 1000}V</span>
          </div>
        </div>

        {/* 0.96" Monochrome OLED Display Simulation */}
        <div className="oled-screen rounded-lg p-4 mb-6 select-none border border-[#00E5FF]/20">
          <div className="text-[#00E5FF] font-mono text-xs tracking-wider space-y-1">
            {oledLines.map((line, idx) => (
              <div key={idx} className="flex justify-between font-bold h-5 items-center">
                <span className="truncate">{line}</span>
                {idx === 0 && <span className="text-[10px] text-[#00E5FF]/60">[OK]</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Controls Layout: Keypad + Tactile Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center mb-6">
          {/* 4x4 Matrix Keypad (8 cols) */}
          <div className="sm:col-span-8 bg-[#0B0F17] p-4 rounded-xl border border-[#232B3E]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 text-center">
              4x4 Matrix Keypad (GPIO 11,12,13,14 &times; 15,16,17,18)
            </div>
            <div className="grid grid-cols-4 gap-2">
              {matrixKeys.flat().map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeyClick(k)}
                  className={`h-11 rounded-lg font-mono text-sm font-bold transition-all flex items-center justify-center border ${
                    activeKey === k
                      ? 'bg-[#00E5FF] text-black border-[#00E5FF] scale-95 shadow-lg shadow-[#00E5FF]/40'
                      : 'bg-[#161B26] hover:bg-[#1F2739] text-white border-[#232B3E] active:scale-95'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Tactile Push Buttons (4 cols) */}
          <div className="sm:col-span-4 flex flex-col space-y-2.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider text-center">
              Tactile Push (ISRs)
            </div>

            <button
              onClick={() => handleButtonClick('ENTER')}
              className="py-2.5 px-3 rounded-lg bg-[#161B26] hover:bg-[#1F2739] text-[#00E676] border border-[#00E676]/40 font-mono text-xs font-bold active:scale-95 transition-all text-center"
            >
              ENTER [GPIO 4]
            </button>

            <button
              onClick={() => handleButtonClick('BACK')}
              className="py-2.5 px-3 rounded-lg bg-[#161B26] hover:bg-[#1F2739] text-slate-300 border border-slate-700 font-mono text-xs font-bold active:scale-95 transition-all text-center"
            >
              BACK [GPIO 5]
            </button>

            <button
              onClick={() => handleButtonClick('CLEAR')}
              className="py-2.5 px-3 rounded-lg bg-[#161B26] hover:bg-[#1F2739] text-amber-400 border border-amber-500/40 font-mono text-xs font-bold active:scale-95 transition-all text-center"
            >
              CLEAR [GPIO 9]
            </button>

            <button
              onClick={() => handleButtonClick('PANIC')}
              className="py-2.5 px-3 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-400 border border-red-500 font-mono text-xs font-bold active:scale-95 transition-all text-center shadow-md shadow-red-500/20"
            >
              PANIC [GPIO 10]
            </button>
          </div>
        </div>

        {/* Rotary Encoder & Active Tamper Mesh Control Deck (suggestion-v2 Section 2.2 & 2.4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0B0F17] p-4 rounded-xl border border-[#232B3E]">
          {/* Quadrature Rotary Encoder Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-white flex items-center space-x-1">
                <RotateCw className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>ROTARY ENCODER</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                A: GPIO 6 | B: GPIO 7 | SW: GPIO 8
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dial visualizer */}
              <div
                className="w-14 h-14 rounded-full border-2 border-[#00E5FF] bg-[#161B26] relative flex items-center justify-center transition-transform duration-150 shadow-md shadow-[#00E5FF]/20"
                style={{ transform: `rotate(${encoderAngle}deg)` }}
              >
                <div className="w-1.5 h-4 bg-[#00E5FF] rounded-full absolute top-1" />
                <div className="w-2.5 h-2.5 bg-white rounded-full" />
              </div>

              {/* Encoder Stats */}
              <div className="text-xs font-mono space-y-0.5">
                <div className="text-slate-400 text-[10px]">Pos: <span className="text-white font-bold">{encoderPos}</span></div>
                <div className="text-slate-400 text-[10px]">Angle: <span className="text-[#00E5FF] font-bold">{((encoderAngle % 360) + 360) % 360}°</span></div>
                <div className="text-slate-400 text-[10px]">Gray Code: <span className="text-amber-400">STATE 0b{(Math.abs(encoderPos) % 4).toString(2).padStart(2, '0')}</span></div>
              </div>
            </div>

            {/* Encoder Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleEncoderRotate('CCW')}
                className="py-1.5 px-2 rounded bg-[#161B26] hover:bg-[#1F2739] text-slate-300 font-mono text-[11px] font-bold border border-[#232B3E] active:scale-95 flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3 h-3 text-[#00E5FF]" />
                <span>CCW</span>
              </button>
              <button
                onClick={handleEncoderSwitch}
                className="py-1.5 px-2 rounded bg-[#161B26] hover:bg-[#1F2739] text-[#00E676] font-mono text-[11px] font-bold border border-[#00E676]/40 active:scale-95 flex items-center justify-center"
              >
                PUSH SW
              </button>
              <button
                onClick={() => handleEncoderRotate('CW')}
                className="py-1.5 px-2 rounded bg-[#161B26] hover:bg-[#1F2739] text-slate-300 font-mono text-[11px] font-bold border border-[#232B3E] active:scale-95 flex items-center justify-center space-x-1"
              >
                <span>CW</span>
                <RotateCw className="w-3 h-3 text-[#00E5FF]" />
              </button>
            </div>
          </div>

          {/* Active Tamper Mesh Heartbeat Monitor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-white flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
                <span>ACTIVE TAMPER MESH</span>
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                tamperMeshStatus === 'SECURE' ? 'bg-[#00E676]/20 text-[#00E676]' : 'bg-red-500/20 text-red-400 animate-pulse'
              }`}>
                {tamperMeshStatus}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-[#161B26] p-2.5 rounded border border-[#232B3E]">
              <div className="flex justify-between">
                <span>TX Pulse (GPIO 3):</span>
                <span className="text-[#00E5FF] font-bold">0x5A/0xA5 DUAL</span>
              </div>
              <div className="flex justify-between">
                <span>RX Sense (GPIO 2):</span>
                <span className={tamperMeshStatus === 'SECURE' ? 'text-[#00E676] font-bold' : 'text-red-400 font-bold'}>
                  {tamperMeshStatus === 'SECURE' ? 'CONTINUITY OK' : 'CUT DETECTED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ULP Zeroization:</span>
                <span className="text-slate-300">ARMED (20ms)</span>
              </div>
            </div>

            <button
              onClick={handleSimulateTamper}
              className="w-full py-1.5 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 font-mono text-[11px] font-bold border border-red-500/40 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Simulate Mesh Trace Cut (Tamper)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Serial Protocol Inspector & Architecture Telemetry (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Authenticated Serial Packet Monitor */}
        <div className="glass-panel p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between border-b border-[#232B3E] pb-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#00E5FF]">
              <Terminal className="w-4 h-4" />
              <span className="font-bold">AUTHENTICATED SERIAL FRAMING</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">115200 BAUD</span>
          </div>

          <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E] font-mono text-[11px] text-slate-300 h-44 overflow-y-auto space-y-1">
            {packetLog.map((pkt, i) => (
              <div
                key={i}
                className={
                  pkt.includes('TX')
                    ? 'text-[#00E5FF]'
                    : pkt.includes('ALERT') || pkt.includes('PANIC')
                    ? 'text-red-400'
                    : 'text-slate-300'
                }
              >
                {pkt}
              </div>
            ))}
          </div>

          <div className="text-[10px] font-mono text-slate-400 pt-1">
            Packet Protocol: <span className="text-white">[0xAA 0x55][TYPE:1B][LEN:2B][PAYLOAD][CRC:2B]</span>
          </div>
        </div>

        {/* Dual-Core FreeRTOS & V3.0 Pinout Tabbed Panel */}
        <div className="glass-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#232B3E] pb-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('DUAL_CORE')}
                className={`px-2.5 py-1 rounded font-mono text-xs font-bold transition-all ${
                  activeTab === 'DUAL_CORE'
                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                DUAL-CORE FREERTOS
              </button>
              <button
                onClick={() => setActiveTab('PINOUT')}
                className={`px-2.5 py-1 rounded font-mono text-xs font-bold transition-all ${
                  activeTab === 'PINOUT'
                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                V3.0 PCB PINOUT
              </button>
            </div>
            <span className="text-[10px] font-mono text-slate-500">ESP32-S3 WROOM-1</span>
          </div>

          {activeTab === 'DUAL_CORE' ? (
            <div className="space-y-3 font-mono text-xs">
              {/* CORE 0: PROTOCOL & SECURITY */}
              <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#00E5FF] font-bold text-[11px] flex items-center space-x-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>CORE 0: PROTOCOL & SECURITY MGR</span>
                  </span>
                  <span className="text-[10px] text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.5 rounded">AFFINITY=0</span>
                </div>
                <div className="text-[10px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>• task_serial_comm:</span>
                    <span className="text-slate-200">Priority 4 | Stack 4096B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• task_security_mgr:</span>
                    <span className="text-slate-200">Priority 5 | Stack 3072B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• task_watchdog:</span>
                    <span className="text-slate-200">Priority 6 | Stack 2048B</span>
                  </div>
                </div>
              </div>

              {/* CORE 1: UI & PERIPHERALS */}
              <div className="bg-[#0B0F17] p-3 rounded-lg border border-[#232B3E] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#FFB300] font-bold text-[11px] flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>CORE 1: UI & PERIPHERAL ENGINES</span>
                  </span>
                  <span className="text-[10px] text-[#FFB300] bg-[#FFB300]/10 px-1.5 py-0.5 rounded">AFFINITY=1</span>
                </div>
                <div className="text-[10px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>• task_keypad_encoder:</span>
                    <span className="text-slate-200">Priority 3 | Stack 2048B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• task_display_gui:</span>
                    <span className="text-slate-200">Priority 2 | Stack 4096B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• task_system_events:</span>
                    <span className="text-slate-200">Priority 1 | Stack 2048B</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-60">
              <table className="w-full text-left font-mono text-[10px] text-slate-300">
                <thead>
                  <tr className="border-b border-[#232B3E] text-slate-500">
                    <th className="py-1">GPIO</th>
                    <th className="py-1">Peripheral</th>
                    <th className="py-1">Design Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232B3E]/40">
                  <tr><td className="py-1 text-[#00E5FF]">GPIO 1</td><td>VBAT_SENSE</td><td>ADC1 Ch0 / 100k:100k Divider</td></tr>
                  <tr><td className="py-1 text-red-400">GPIO 2/3</td><td>SILICON TAMPER</td><td>Optical Photodiode & VFI Brownout ISR (&lt;1µs)</td></tr>
                  <tr><td className="py-1 text-[#00E676]">GPIO 4,5,9,10</td><td>Push Buttons</td><td>ENTER, BACK, CLEAR, PANIC</td></tr>
                  <tr><td className="py-1 text-amber-400">GPIO 6,7,8</td><td>ROTARY ENCODER</td><td>A (Phase), B (Quad), SW (Push)</td></tr>
                  <tr><td className="py-1 text-purple-400">GPIO 11-14</td><td>Keypad Rows</td><td>Matrix Scanning Outputs</td></tr>
                  <tr><td className="py-1 text-purple-400">GPIO 15-18</td><td>Keypad Cols</td><td>Inputs w/ Internal Pull-Down</td></tr>
                  <tr><td className="py-1 text-[#00E5FF]">GPIO 19/20</td><td>USB_D-/D+</td><td>Native USB OTG JTAG/Serial</td></tr>
                  <tr><td className="py-1 text-emerald-400">GPIO 38,39</td><td>RGB LED / BUZZ</td><td>WS2812B & Piezo PWM Timer</td></tr>
                  <tr><td className="py-1 text-cyan-400">GPIO 40,41,42</td><td>SPI ST7789</td><td>Display MOSI, SCK, CS (40MHz)</td></tr>
                  <tr><td className="py-1 text-amber-400">GPIO 47,48</td><td>I2C ATECC608A</td><td>SDA / SCL Crypto Co-Processor</td></tr>
                  <tr><td className="py-1 text-amber-400 font-bold">GPIO 21</td><td>EMFI_GLITCH_OUT</td><td>Nanosecond Voltage/Clock Pulser (12.5ns tick)</td></tr>
                  <tr><td className="py-1 text-cyan-400 font-bold">ULP FSM</td><td>SNN_ENTROPY_LIF</td><td>32-Neuron Streaming Classifier (&lt;0.8mW)</td></tr>
                  <tr><td className="py-1 text-blue-400 font-bold">GPIO 10,11,12</td><td>SPI eFPGA BUS</td><td>CS, CLK, MOSI Dynamic Reconfig (40MHz)</td></tr>
                  <tr><td className="py-1 text-purple-400 font-bold">GPIO 22,23</td><td>QKD OPTICAL</td><td>Sync &amp; Photonic Polarization Rx</td></tr>
                  <tr><td className="py-1 text-pink-400 font-bold">GPIO 25,26</td><td>PHOTONIC TPU</td><td>DAC MZI Theta &amp; Phi Phase Modulators</td></tr>
                  <tr><td className="py-1 text-sky-400 font-bold">GPIO 27,28</td><td>LEO FSO LASER</td><td>1550nm Laser Modulation TX &amp; Optical Rx</td></tr>
                  <tr><td className="py-1 text-purple-400 font-bold">GPIO 25,26</td><td>1T1M MEMRISTOR WL</td><td>DAC Wordline Analog Voltages (Ohmic VMM)</td></tr>
                  <tr><td className="py-1 text-cyan-400 font-bold">GPIO 36,39</td><td>1T1M MEMRISTOR BL</td><td>ADC Bitline Current Accumulators (100 TOPS/W)</td></tr>
                  <tr><td className="py-1 text-red-400 font-bold">GPIO 33</td><td>MICROFLUIDIC VALVE</td><td>Exothermic Reactant Release (&lt;500ns Silicon Dissolution)</td></tr>
                  <tr><td className="py-1 text-emerald-400 font-bold">DTN MESH</td><td>RFC 5050 DTN</td><td>Interplanetary Lagrange Deep Space Laser Custody</td></tr>
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
