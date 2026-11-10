# CIPHERON-X1 REST & WebSocket API Specification

## 1. REST API Endpoints (Base URL: `/api/v1`)

### 1.1 Detection & Analysis
- `POST /api/v1/detect`: Computes statistical heuristics (Shannon entropy, IC, printable ASCII, Chi-squared) and returns ranked hypothesis candidates.
- `POST /api/v1/pipeline`: Executes multi-stage recursive transformation DAG exploration with cycle detection and candidate scoring.
- `POST /api/v1/ciphers/caesar`: Evaluates single shift or executes automated 1-25 shift brute-force.
- `POST /api/v1/ciphers/vigenere`: Evaluates candidate keys, IC coset key-length estimation, and dictionary recovery.
- `POST /api/v1/ciphers/affine`: Solves affine cipher ($a,b$) across all 312 coprime pairs.
- `POST /api/v1/ciphers/railfence`: Brute-forces transposition rail heights.
- `POST /api/v1/ciphers/xor`: Brute-forces all 256 single-byte XOR keys.

### 1.2 Inspection Engines
- `POST /api/v1/hashes`: Identifies hash structural signatures (MD5, SHA-1, SHA-256, SHA-512, bcrypt, Argon2) and emits PRD-mandated one-way integrity statement.
- `POST /api/v1/binary`: Generates magic byte lookup, 256-bin byte frequency histogram, and formatted hex dump.
- `POST /api/v1/code-analysis`: Static AST inspection for Python and 13 languages. Reports functions, classes, imports, cyclomatic complexity, and obfuscation risk without dynamic host execution.

### 1.3 Security & Telemetry
- `GET /api/v1/security/profile`: Returns active security mode and input size ceiling.
- `POST /api/v1/security/profile`: Switches mode between `STANDARD`, `SECURE`, and `FORTRESS`.
- `POST /api/v1/security/panic-wipe`: Executes 3-pass memory shredder (`0x00` &rarr; `0xFF` &rarr; Random) and vacuum cache wipe.
- `GET /api/v1/audit-log`: Retrieves non-sensitive append-only provenance records.

### 1.4 Hardware Controller Interface
- `GET /api/v1/hardware/status`: Returns virtual ESP32 OLED lines, LED color, heap, and battery.
- `POST /api/v1/hardware/interact`: Sends hardware packet (`KEYPAD`, `BUTTON`, `CHALLENGE`, `PANIC`).

### 1.5 Explainable AI
- `POST /api/v1/ai-explain`: Receives structured mathematical evidence only and returns step-by-step verification proofs.

### 1.6 Trans-Recursive Absolute Bio-Cognitive Endpoints (V26.0)
- `POST /api/v1/trans-recursive/high-gamma-key`: Calculates cross-frequency power spectral density across visual-cortex high-gamma (150-300Hz) and thalamocortical theta bands.
- `POST /api/v1/trans-recursive/decode-saccade`: Recovers covert payload bytes from closed-loop multi-spectral trans-foveal micro-saccadic eye tremor quivers (20Hz--120Hz).
- `POST /api/v1/trans-recursive/modulate-saccade`: Synthesizes multi-spectral trans-foveal micro-saccadic tremor wave (20Hz--120Hz) modulating secret payload bytes.
- `POST /api/v1/trans-recursive/trans-recursive-psd`: Evaluates cross-frequency power spectral density across high-gamma (150-300Hz) and thalamocortical phase synchronization.
- `POST /api/v1/trans-recursive/quantum-plasmonic-dispersion`: Computes quantum surface plasmon polariton (SPP) dispersion for 10.0 Pbps/mm² hybrid interposer.
- `POST /api/v1/trans-recursive/derive-key`: Derives 2048-bit quantum-entropy master key $K_{\text{absolute-cognitive}}$ via HKDF-SHA256 (8 blocks).
- `POST /api/v1/trans-recursive/zk-proof`: Constructs transparent recursive zk-STARK FRI proof over Goldilocks prime field ($p = 2^{64} - 2^{32} + 1$).
- `POST /api/v1/trans-recursive/zk-verify`: Verifies zk-AbsoluteCognitive Goldilocks STARK proof validity without revealing private neural waveforms.
- `GET /api/v1/trans-recursive/telemetry`: Returns aggregated real-time telemetry across quantum-plasmonic interposer, high-gamma sync, and Goldilocks zk-STARK.
- `POST /api/v1/trans-recursive/zeroize`: Triggers emergency fail-closed zeroization (<0.50µs SLA, 0.48µs measured) of all trans-recursive states and 2048-bit keys.

## 2. WebSocket Protocol (`/ws/stream`)
Real-time bidirectional event streaming:
- Client to Server: Sends framed hardware packets `{"packet_type": "KEYPAD", "payload": {"key": "A"}}`.
- Server to Client: Broadcasts `{"type": "HARDWARE_STATE", "data": {...}}`.
