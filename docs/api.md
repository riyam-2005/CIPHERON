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

## 2. WebSocket Protocol (`/ws/stream`)
Real-time bidirectional event streaming:
- Client to Server: Sends framed hardware packets `{"packet_type": "KEYPAD", "payload": {"key": "A"}}`.
- Server to Client: Broadcasts `{"type": "HARDWARE_STATE", "data": {...}}`.
