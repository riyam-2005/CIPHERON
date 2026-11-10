import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SecurityMode, AuditLogEntry, SecurityProfileStatus, ProvenanceLedgerRecord, LedgerVerificationResult, MerkleAuditProof, MerkleVerifyResult } from '../types';

import { Shield, ShieldAlert, Lock, Trash2, RefreshCw, CheckCircle, Database, Link, CheckCircle2, AlertTriangle, Key, GitBranch } from 'lucide-react';

interface SecurityPageProps {
  currentProfile: SecurityMode;
  onProfileChange: (mode: SecurityMode) => void;
  onPanicWipe: () => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({
  currentProfile,
  onProfileChange,
  onPanicWipe
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [profileStatus, setProfileStatus] = useState<SecurityProfileStatus | null>(null);
  const [ledgerRecords, setLedgerRecords] = useState<ProvenanceLedgerRecord[]>([]);
  const [ledgerVerification, setLedgerVerification] = useState<LedgerVerificationResult | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isVerifyingLedger, setIsVerifyingLedger] = useState(false);

  // Merkle Audit Proof State (suggestion-v2.md Section 8.1)
  const [selectedLeafIdx, setSelectedLeafIdx] = useState<number>(0);
  const [merkleProof, setMerkleProof] = useState<MerkleAuditProof | null>(null);
  const [proofVerification, setProofVerification] = useState<MerkleVerifyResult | null>(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState<boolean>(false);
  const [isVerifyingProof, setIsVerifyingProof] = useState<boolean>(false);


  const fetchLogsAndStatus = async () => {
    setIsLoadingLogs(true);
    try {
      const [logsData, statusData, recordsData] = await Promise.all([
        api.getAuditLogs(30),
        api.getSecurityProfile(),
        api.getLedgerRecords(30)
      ]);
      setLogs(logsData);
      setProfileStatus(statusData);
      setLedgerRecords(recordsData);
    } catch {
      // ignore
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleVerifyLedger = async () => {
    setIsVerifyingLedger(true);
    try {
      const result = await api.verifyLedger();
      setLedgerVerification(result);
    } catch (err: any) {
      setLedgerVerification({
        valid: false,
        reason: err.message || 'Verification endpoint communication failed'
      });
    } finally {
      setIsVerifyingLedger(false);
    }
  };

  const handleGenerateMerkleProof = async () => {
    setIsGeneratingProof(true);
    setProofVerification(null);
    try {
      const res = await api.getMerkleProof(selectedLeafIdx);
      setMerkleProof(res);
    } catch {
      // ignore
    } finally {
      setIsGeneratingProof(false);
    }
  };

  const handleVerifyMerkleProof = async () => {
    if (!merkleProof) return;
    setIsVerifyingProof(true);
    try {
      const res = await api.verifyMerkleProof(
        merkleProof.leaf_hash,
        merkleProof.proof_path,
        merkleProof.root_hash
      );
      setProofVerification(res);
    } catch {
      // ignore
    } finally {
      setIsVerifyingProof(false);
    }
  };


  useEffect(() => {
    fetchLogsAndStatus();
  }, [currentProfile]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-mono text-base font-bold text-white tracking-wide">
              SECURITY PROFILES & PROVENANCE AUDIT TRAIL
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            PRD Section 7.1 - 7.3 Cryptographic provenance audit records. Zero Plaintext Telemetry Policy.
          </p>
        </div>

        <button
          onClick={fetchLogsAndStatus}
          disabled={isLoadingLogs}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#161B26] hover:bg-[#1F2739] text-slate-300 text-xs font-mono border border-[#232B3E]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
          <span>Refresh All Logs</span>
        </button>
      </div>

      {/* Profiles Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* STANDARD */}
        <div
          onClick={() => onProfileChange('STANDARD')}
          className={`cursor-pointer rounded-xl p-5 border transition-all ${
            currentProfile === 'STANDARD'
              ? 'bg-[#161B26] border-[#00E5FF] shadow-lg shadow-[#00E5FF]/10 ring-1 ring-[#00E5FF]'
              : 'bg-[#0B0F17] border-[#232B3E] hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-bold text-[#00E5FF]">STANDARD PROFILE</span>
            {currentProfile === 'STANDARD' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-bold">
                ACTIVE
              </span>
            )}
          </div>
          <ul className="text-[11px] font-mono text-slate-400 space-y-1.5">
            <li>• Max Input: <span className="text-white font-bold">10 MB</span></li>
            <li>• Network: Local Web UI + User Cloud AI</li>
            <li>• Storage: Encrypted SQLite Cache</li>
            <li>• Log Level: INFO</li>
          </ul>
        </div>

        {/* SECURE */}
        <div
          onClick={() => onProfileChange('SECURE')}
          className={`cursor-pointer rounded-xl p-5 border transition-all ${
            currentProfile === 'SECURE'
              ? 'bg-[#161B26] border-amber-400 shadow-lg shadow-amber-400/10 ring-1 ring-amber-400'
              : 'bg-[#0B0F17] border-[#232B3E] hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-bold text-amber-400">SECURE PROFILE</span>
            {currentProfile === 'SECURE' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-400 font-bold">
                ACTIVE
              </span>
            )}
          </div>
          <ul className="text-[11px] font-mono text-slate-400 space-y-1.5">
            <li>• Max Input: <span className="text-white font-bold">2 MB</span></li>
            <li>• Network: <span className="text-amber-400">Localhost Loopback Only</span></li>
            <li>• Storage: Transient Encrypted RAM</li>
            <li>• Strict AST Sandboxing Enforced</li>
          </ul>
        </div>

        {/* FORTRESS */}
        <div
          onClick={() => onProfileChange('FORTRESS')}
          className={`cursor-pointer rounded-xl p-5 border transition-all ${
            currentProfile === 'FORTRESS'
              ? 'bg-[#161B26] border-red-500 shadow-lg shadow-red-500/10 ring-1 ring-red-500'
              : 'bg-[#0B0F17] border-[#232B3E] hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-bold text-red-400">FORTRESS (AIR-GAP)</span>
            {currentProfile === 'FORTRESS' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                ACTIVE
              </span>
            )}
          </div>
          <ul className="text-[11px] font-mono text-slate-400 space-y-1.5">
            <li>• Max Input: <span className="text-white font-bold">500 KB</span></li>
            <li>• Network: <span className="text-red-400">Full Air-Gap Isolation</span></li>
            <li>• Storage: <span className="text-red-400">Zero-Disk Pure Volatile RAM</span></li>
            <li>• Auto-Session Wipe on Disconnect</li>
          </ul>
        </div>
      </div>

      {/* Cryptographic Provenance Hash Chain (Merkle Ledger) */}
      <div className="glass-panel p-5 rounded-xl space-y-4 border border-[#232B3E]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232B3E] pb-3">
          <div>
            <div className="flex items-center space-x-2 text-sm font-mono font-bold text-white">
              <Link className="w-4 h-4 text-[#00E5FF]" />
              <span>CRYPTOGRAPHIC PROVENANCE LEDGER (MERKLE HASH CHAIN)</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Zero-Plaintext append-only chain. Each block hashes input SHA-256 + pipeline steps + previous block hash + ECDSA signature.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleVerifyLedger}
              disabled={isVerifyingLedger}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-mono font-bold border border-[#00E5FF]/40 transition-colors"
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isVerifyingLedger ? 'animate-spin' : ''}`} />
              <span>{isVerifyingLedger ? 'Verifying Chain...' : 'Verify Hash Chain Integrity'}</span>
            </button>
          </div>
        </div>

        {/* Verification Result Banner */}
        {ledgerVerification && (
          <div
            className={`p-3 rounded-lg border font-mono text-xs flex items-center justify-between ${
              ledgerVerification.valid
                ? 'bg-[#00E676]/10 border-[#00E676]/30 text-[#00E676]'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              {ledgerVerification.valid ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span>
                {ledgerVerification.valid
                  ? `INTEGRITY VERIFIED: All ${ledgerVerification.total_blocks ?? ledgerRecords.length} blocks validated with unbroken cryptographic hash links.`
                  : `INTEGRITY VIOLATION DETECTED: Tampered record #${ledgerVerification.tampered_record_id} (${ledgerVerification.reason})`}
              </span>
            </div>
            {ledgerVerification.head_hash && (
              <span className="text-[10px] text-slate-400">
                HEAD: {ledgerVerification.head_hash.slice(0, 16)}...
              </span>
            )}
          </div>
        )}

        {/* Provenance Block Timeline / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-slate-300">
            <thead>
              <tr className="border-b border-[#232B3E] text-slate-500 text-[11px]">
                <th className="py-2 px-2">Block #</th>
                <th className="py-2 px-2">Timestamp (UTC)</th>
                <th className="py-2 px-2">Input Fingerprint</th>
                <th className="py-2 px-2">Transformation Pipeline</th>
                <th className="py-2 px-2">Previous Hash</th>
                <th className="py-2 px-2">Block Hash</th>
                <th className="py-2 px-2">Device Signature (ECDSA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232B3E]/50 text-[11px]">
              {ledgerRecords.map((block) => (
                <tr key={block.record_id} className="hover:bg-[#161B26]">
                  <td className="py-2.5 px-2 font-bold text-[#00E5FF]">#{block.record_id}</td>
                  <td className="py-2.5 px-2 text-slate-400">{block.timestamp.slice(11, 19)}</td>
                  <td className="py-2.5 px-2 text-slate-300 font-mono" title={block.input_sha256}>
                    {block.input_sha256.slice(0, 10)}...
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {block.steps_applied && block.steps_applied.length > 0 ? (
                        block.steps_applied.slice(0, 3).map((st, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F2739] text-slate-300 border border-[#2A344A]"
                          >
                            {st}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-[10px]">Direct Pipeline</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-slate-500 font-mono text-[10px]" title={block.prev_hash}>
                    {block.prev_hash === '0'.repeat(64) ? 'GENESIS_0x0' : `${block.prev_hash.slice(0, 8)}...`}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-[#FFB300] text-[10px]" title={block.record_hash}>
                    {block.record_hash.slice(0, 10)}...
                  </td>
                  <td className="py-2.5 px-2 text-slate-400 font-mono text-[10px]" title={block.device_signature}>
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Key className="w-3 h-3 text-[#00E5FF]" />
                      <span>{block.device_signature.slice(0, 12)}...</span>
                    </span>
                  </td>
                </tr>
              ))}
              {ledgerRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No provenance blocks recorded yet. Execute a transformation pipeline in Analysis Studio to generate genesis records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zero-Knowledge Merkle Provenance Tree & Sibling Inclusion Proofs (suggestion-v2 Section 8.1) */}
      <div className="glass-panel p-5 rounded-xl space-y-4 border border-[#232B3E]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232B3E] pb-3">
          <div>
            <div className="flex items-center space-x-2 text-sm font-mono font-bold text-white">
              <GitBranch className="w-4 h-4 text-[#00E5FF]" />
              <span>ZERO-KNOWLEDGE MERKLE PROVENANCE TREE & SIBLING AUDIT PROOFS</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Balanced SHA-256 Merkle Tree over execution stages with ECDSA P-256 root signatures & logarithmic audit proofs.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-[#0B0F17] px-3 py-1.5 rounded-lg border border-[#232B3E]">
              <span className="text-[11px] font-mono text-slate-400">Leaf Index:</span>
              <input
                type="number"
                min={0}
                max={Math.max(0, ledgerRecords.length - 1)}
                value={selectedLeafIdx}
                onChange={(e) => setSelectedLeafIdx(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 bg-[#161B26] border border-[#232B3E] rounded px-1.5 py-0.5 text-xs font-mono text-white text-center focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
            <button
              onClick={handleGenerateMerkleProof}
              disabled={isGeneratingProof}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-mono font-bold border border-[#00E5FF]/40 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingProof ? 'animate-spin' : ''}`} />
              <span>Generate Audit Proof</span>
            </button>
            {merkleProof && (
              <button
                onClick={handleVerifyMerkleProof}
                disabled={isVerifyingProof}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#00E676]/10 hover:bg-[#00E676]/20 text-[#00E676] text-xs font-mono font-bold border border-[#00E676]/40 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${isVerifyingProof ? 'animate-spin' : ''}`} />
                <span>Verify Against Signed Root</span>
              </button>
            )}
          </div>
        </div>

        {/* Verification Result Banner */}
        {proofVerification && (
          <div
            className={`p-3 rounded-lg border font-mono text-xs flex items-center justify-between ${
              proofVerification.is_valid
                ? 'bg-[#00E676]/10 border-[#00E676]/30 text-[#00E676]'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              {proofVerification.is_valid ? (
                <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
              <span>
                {proofVerification.is_valid
                  ? `MERKLE PROOF VALIDATED: Cryptographic sibling path correctly hashes to expected root ${proofVerification.expected_root.slice(0, 16)}... [Status: ${proofVerification.status}]`
                  : `MERKLE PROOF INVALID: Sibling verification failed against root ${proofVerification.expected_root.slice(0, 16)}... [Status: ${proofVerification.status}]`}
              </span>
            </div>
          </div>
        )}

        {/* Audit Proof Display */}
        {merkleProof ? (
          <div className="space-y-3 bg-[#0B0F17] p-4 rounded-lg border border-[#232B3E]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px]">Merkle Root Hash (SHA-256):</span>
                <p className="text-[#FFB300] break-all bg-[#161B26] p-2 rounded border border-[#232B3E]">
                  {merkleProof.root_hash}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px]">Target Leaf Hash [Index #{merkleProof.leaf_index}]:</span>
                <p className="text-[#00E5FF] break-all bg-[#161B26] p-2 rounded border border-[#232B3E]">
                  {merkleProof.leaf_hash}
                </p>
              </div>
            </div>

            {merkleProof.root_signature && (
              <div className="text-xs font-mono space-y-1">
                <span className="text-slate-400 text-[11px]">ECDSA P-256 Root Signature:</span>
                <p className="text-slate-300 break-all bg-[#161B26] p-2 rounded border border-[#232B3E] text-[10px]">
                  {merkleProof.root_signature}
                </p>
              </div>
            )}

            {/* Sibling Path Traversal Steps */}
            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                <GitBranch className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Sibling Proof Path ({merkleProof.proof_path.length} Audit Nodes - O(log N) Proof):</span>
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {merkleProof.proof_path.map((node, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 text-[11px] font-mono bg-[#161B26] px-3 py-1.5 rounded border border-[#232B3E]"
                  >
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#1F2739] text-[#00E5FF]">
                      Level {idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold ${node.position === 'left' ? 'text-amber-400' : 'text-purple-400'}`}>
                      [{node.position.toUpperCase()}_SIBLING]
                    </span>
                    <span className="text-slate-400 truncate flex-1 font-mono">
                      {node.hash}
                    </span>
                  </div>
                ))}
                {merkleProof.proof_path.length === 0 && (
                  <p className="text-slate-500 text-xs font-mono py-2">
                    Tree has single leaf; no sibling nodes required.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-xs font-mono text-slate-500">
            No Merkle audit proof generated yet. Select a leaf index and click "Generate Audit Proof".
          </div>
        )}
      </div>

      {/* Append-Only Provenance Audit Logs Table */}
      <div className="glass-panel p-5 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#232B3E] pb-2">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-white">
            <Database className="w-4 h-4 text-[#00E5FF]" />
            <span>NON-SENSITIVE PROVENANCE AUDIT TRAIL</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            PRD 7.2 Zero Plaintext Telemetry Policy Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-slate-300">
            <thead>
              <tr className="border-b border-[#232B3E] text-slate-500 text-[11px]">
                <th className="py-2 px-2">ID</th>
                <th className="py-2 px-2">Timestamp (UTC)</th>
                <th className="py-2 px-2">Event</th>
                <th className="py-2 px-2">Payload SHA-256 Fingerprint</th>
                <th className="py-2 px-2">Profile</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232B3E]/50 text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#161B26]">
                  <td className="py-2 px-2 text-[#00E5FF]">{log.id}</td>
                  <td className="py-2 px-2 text-slate-400">{log.timestamp.slice(11, 19)}</td>
                  <td className="py-2 px-2 font-bold text-white">{log.event_type}</td>
                  <td className="py-2 px-2 text-slate-400 max-w-xs truncate" title={log.input_sha256}>
                    {log.input_sha256.slice(0, 16)}...
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.security_profile === 'FORTRESS'
                          ? 'bg-red-500/20 text-red-400'
                          : log.security_profile === 'SECURE'
                          ? 'bg-amber-400/20 text-amber-400'
                          : 'bg-[#00E5FF]/20 text-[#00E5FF]'
                      }`}
                    >
                      {log.security_profile}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-[#00E676]">{log.status}</td>
                  <td className="py-2 px-2 text-slate-400">{log.duration_ms} ms</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No provenance logs recorded yet. Run analysis to populate audit records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

