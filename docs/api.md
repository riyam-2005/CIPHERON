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

### 1.7 Omnipresent Trans-Cognitive Convergence Endpoints (V27.0)
- `POST /api/v1/trans-cognitive/ultra-gamma-key`: Decouples ultra-high-gamma (300-500Hz) and hippocampal sharp-wave ripple (150-250Hz) oscillations.
- `POST /api/v1/trans-cognitive/decode-retinal`: Recovers covert payload bytes from continuous bi-directional trans-foveal retinal-cortical tremors (20Hz--150Hz).
- `POST /api/v1/trans-cognitive/modulate-retinal`: Synthesizes phase-locked retinal-cortical micro-tremor wave (20Hz--150Hz) modulating secret payload bytes.
- `POST /api/v1/trans-cognitive/omnipresent-psd`: Evaluates cross-frequency PSD across ultra-high-gamma (300-500Hz) and hippocampal ripples (150-250Hz).
- `POST /api/v1/trans-cognitive/soliton-wavepacket`: Evaluates optical-topological soliton wavepacket propagation for 100.0 Pbps/mm² interposer.
- `POST /api/v1/trans-cognitive/derive-key`: Derives 4096-bit quantum-entropy master key $K_{\text{omnipresent-cognitive}}$ via HKDF-SHA512 (8 blocks).
- `POST /api/v1/trans-cognitive/zk-proof`: Constructs recursive zk-STARK proof over Goldilocks ($p_1 = 2^{64} - 2^{32} + 1$) and BabyBear ($p_2 = 2^{31} - 2^{27} + 1$) finite fields (<1.2ms verify SLA).
- `POST /api/v1/trans-cognitive/zk-verify`: Verifies dual-field zk-TransCognitive Goldilocks + BabyBear STARK proof validity (<1.2ms).
- `GET /api/v1/trans-cognitive/telemetry`: Returns aggregated real-time telemetry across soliton interposer, ultra-high-gamma sync, and dual-field zk-STARK.
- `POST /api/v1/trans-cognitive/zeroize`: Triggers emergency fail-closed zeroization (<0.25µs SLA, 0.22µs measured) of all trans-cognitive states and 4096-bit keys.

### 1.8 Transcendent Bio-Quantum Singularity Endpoints (V28.0)
- `POST /api/v1/transcendent/burst-key`: Decouples trans-spectral bursts (500-1000Hz) and thalamocortical reverberation loops (4-12Hz).
- `POST /api/v1/transcendent/decode-retinal`: Recovers covert payload bytes from continuous quantum-entangled retinal-cortical tremors (20Hz--200Hz).
- `POST /api/v1/transcendent/modulate-retinal`: Synthesizes continuous-variable entangled photon retinal tremor wave (20Hz--200Hz).
- `POST /api/v1/transcendent/transcendent-psd`: Evaluates cross-frequency PSD across trans-spectral bursts (500-1000Hz) and thalamocortical loops (4-12Hz) with Gaussian phase coherence.
- `POST /api/v1/transcendent/resonator-wavefunction`: Evaluates trans-Planckian optical-soliton resonator dynamics for 1.0 Ebps/mm² interposer.
- `POST /api/v1/transcendent/derive-key`: Derives 8192-bit quantum-entropic master key $K_{\text{transcendent-cognitive}}$ via HKDF-SHA512 (16 blocks).
- `POST /api/v1/transcendent/zk-proof`: Constructs recursive zk-STARK proof over ternary field tower (Goldilocks $p_1$, BabyBear $p_2$, Mersenne-31 $p_3$) (<0.8ms verify SLA).
- `POST /api/v1/transcendent/zk-verify`: Verifies ternary-field zk-Transcendent STARK proof validity (<0.8ms).
- `GET /api/v1/transcendent/telemetry`: Returns aggregated real-time telemetry across trans-Planckian resonator, burst sync, and ternary zk-STARK.
- `POST /api/v1/transcendent/zeroize`: Triggers emergency fail-closed zeroization (<0.15µs SLA, 0.12µs measured) of all transcendent states and 8192-bit keys.

### 1.9 Omnipotent Bio-Quantum Reality Singularity Endpoints (V29.0)
- `POST /api/v1/omnipotent/ultra-burst-key`: Decouples ultra-high-frequency bursts (1000-2500Hz) and corticostriatal-thalamic loops (1-30Hz).
- `POST /api/v1/omnipotent/decode-retinal`: Recovers covert payload bytes from full-duplex squeezed-state retinal-cortical tremors (20Hz--250Hz).
- `POST /api/v1/omnipotent/modulate-retinal`: Synthesizes squeezed-state photon retinal tremor wave (20Hz--250Hz).
- `POST /api/v1/omnipotent/omnipotent-psd`: Evaluates cross-frequency PSD across ultra-bursts (1000-2500Hz) and corticostriatal loops (1-30Hz) with gravitational phase coherence.
- `POST /api/v1/omnipotent/gravitational-lattice`: Evaluates quantum gravitational soliton-lattice dynamics for 10.0 Ebps/mm² interposer.
- `POST /api/v1/omnipotent/derive-key`: Derives 16384-bit quantum-entropic master key $K_{\text{omnipotent-cognitive}}$ via HKDF-SHA512 (32 blocks).
- `POST /api/v1/omnipotent/zk-proof`: Constructs recursive zk-STARK proof over quaternary field tower (Goldilocks $p_1$, BabyBear $p_2$, Mersenne-31 $p_3$, KoalaBear $p_4$) (<0.5ms verify SLA).
- `POST /api/v1/omnipotent/zk-verify`: Verifies quaternary-field zk-Omnipotent STARK proof validity (<0.5ms).
- `GET /api/v1/omnipotent/telemetry`: Returns aggregated real-time telemetry across gravitational soliton lattice, ultra-burst sync, and quaternary zk-STARK.
- `POST /api/v1/omnipotent/zeroize`: Triggers emergency fail-closed zeroization (<0.08µs SLA, 0.06µs measured) of all omnipotent states and 16384-bit keys.

### 1.10 Absolute Omni-Existential Consciousness Endpoints (V30.0)
- `POST /api/v1/omni-existential/gigahertz-key`: Decouples gigahertz-band neocortical bursts (2500-5000Hz) and cross-hemispheric sync (0.1-40Hz).
- `POST /api/v1/omni-existential/decode-retinal`: Recovers covert payload bytes from full-duplex EPR-entangled pan-retinal tremors (20Hz--300Hz).
- `POST /api/v1/omni-existential/modulate-retinal`: Synthesizes continuous-variable EPR-entangled pan-retinal tremor wave (20Hz--300Hz).
- `POST /api/v1/omni-existential/omni-existential-psd`: Evaluates cross-frequency PSD across gigahertz bursts (2500-5000Hz) and cross-hemispheric sync (0.1-40Hz).
- `POST /api/v1/omni-existential/hypercube-manifold`: Evaluates trans-cosmic gravitational soliton-hypercube dynamics for 100.0 Ebps/mm² interposer.
- `POST /api/v1/omni-existential/derive-key`: Derives 32768-bit quantum-entropic master key $K_{\text{omni-existential}}$ via HKDF-SHA512 (64 blocks).
- `POST /api/v1/omni-existential/zk-proof`: Constructs recursive zk-STARK proof over quinary field tower (Goldilocks $p_1$, BabyBear $p_2$, Mersenne-31 $p_3$, KoalaBear $p_4$, Starknet $p_5$) (<0.3ms verify SLA).
- `POST /api/v1/omni-existential/zk-verify`: Verifies quinary-field zk-OmniExistential STARK proof validity (<0.3ms).
- `GET /api/v1/omni-existential/telemetry`: Returns aggregated real-time telemetry across soliton-hypercube, gigahertz sync, and quinary zk-STARK.
- `POST /api/v1/omni-existential/zeroize`: Triggers emergency fail-closed zeroization (<0.05µs SLA, 0.03µs measured) of all omni-existential states and 32768-bit keys.

### 1.11 Absolute Transcendent Consciousness Singularity Endpoints (V31.0)
- `POST /api/v1/transcendent-singularity/subterahertz-key`: Decouples sub-terahertz bursts (5000-10000Hz) and pan-cerebral sync (0.01-50Hz).
- `POST /api/v1/transcendent-singularity/decode-retinal`: Recovers covert payload bytes from full-duplex CV-QKD pan-retinal tremors (20Hz--400Hz).
- `POST /api/v1/transcendent-singularity/modulate-retinal`: Synthesizes continuous-variable CV-QKD pan-retinal tremor wave (20Hz--400Hz).
- `POST /api/v1/transcendent-singularity/ts-psd`: Evaluates cross-frequency PSD across sub-terahertz bursts (5000-10000Hz) and pan-cerebral sync (0.01-50Hz).
- `POST /api/v1/transcendent-singularity/hyperlattice-manifold`: Evaluates trans-omniversal gravitational soliton-hyperlattice dynamics for 1.0 Zbps/mm² interposer.
- `POST /api/v1/transcendent-singularity/derive-key`: Derives 65536-bit quantum-entropic master key $K_{\text{transcendent-singularity}}$ via HKDF-SHA512 (128 blocks).
- `POST /api/v1/transcendent-singularity/zk-proof`: Constructs recursive zk-STARK proof over senary field tower (Goldilocks $p_1$, BabyBear $p_2$, Mersenne-31 $p_3$, KoalaBear $p_4$, Starknet $p_5$, Circle-STARK $p_6 = 2^{128}$) (<0.2ms verify SLA).
- `POST /api/v1/transcendent-singularity/zk-verify`: Verifies senary-field zk-OmniTranscendent STARK proof validity (<0.2ms).
- `GET /api/v1/transcendent-singularity/telemetry`: Returns aggregated real-time telemetry across soliton-hyperlattice, sub-THz sync, and senary zk-STARK.
- `POST /api/v1/transcendent-singularity/zeroize`: Triggers emergency fail-closed zeroization (<0.02µs SLA, 0.015µs measured) of all V31 states and 65536-bit keys.

## 2. WebSocket Protocol (`/ws/stream`)
Real-time bidirectional event streaming:
- Client to Server: Sends framed hardware packets `{"packet_type": "KEYPAD", "payload": {"key": "A"}}`.
- Server to Client: Broadcasts `{"type": "HARDWARE_STATE", "data": {...}}`.
