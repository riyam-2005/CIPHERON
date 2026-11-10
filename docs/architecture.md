# CIPHERON-X1 System Architecture & Topology

## 1. Executive Topology Overview
CIPHERON-X1 is an asynchronous split-architecture system designed to bridge physical security hardware with high-performance computational cryptanalysis.

```
+-----------------------------------------------------------------------------------+
|                                  ESP32 HARDWARE                                   |
|  [0.96" OLED I2C Display] <---> [ESP32 Controller] <---> [4x4 Keypad & Buttons]   |
|                                         |                                         |
|                               (Secure Comm Layer)                                 |
|                         Authenticated Serial / TLS 1.3                            |
+-----------------------------------------|-----------------------------------------+
                                          v
+-----------------------------------------------------------------------------------+
|                             COMPANION ANALYSIS SERVER                             |
|                                                                                   |
|  +-------------------+   +--------------------+   +----------------------------+  |
|  | Detection Engine  | -->|   Cipher Engine    | -->| Candidate Scoring Engine   |  |
|  | (Heuristics)      |   | (Decoders/Ciphers) |   | (N-Grams / Dictionary)     |  |
|  +-------------------+   +--------------------+   +----------------------------+  |
|            |                        |                           |                 |
|            v                        v                           v                 |
|  +-----------------------------------------------------------------------------+  |
|  |               FastAPI Async Backend Services & SQLite Database               |  |
|  +-----------------------------------------------------------------------------+  |
|                                         |                                         |
|                                  (WebSocket / REST)                               |
|                                         v                                         |
|  +-----------------------------------------------------------------------------+  |
|  |               React / TypeScript / Tailwind Web Dashboard                   |  |
|  |        (Monaco Editor + Pipeline Visualizer + Security Profile Controls)      |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

## 2. Hardware Subsystem Responsibilities
- **Physical Ingestion & Control**: Matrix keypad scanning (4x4 matrix, GPIOs 13, 12, 14, 27 x 26, 25, 33, 32).
- **Tactile Interruption**: Push buttons for ENTER, BACK, CLEAR, and emergency PANIC.
- **Visual Feedback**: 0.96-inch Monochrome SSD1306 OLED display over I2C (GPIO 21/22).
- **Device Watchdog**: Task Watchdog Timer (TWDT) enforcing a 5.0-second fail-closed reset.
- **Secure Communication**: Framed packet engine `[0xAA 0x55][TYPE][LEN][PAYLOAD][CRC]` over 115200 baud serial.

## 3. Companion Analysis Server Responsibilities
- **Multi-Stage Heuristics**: Shannon entropy, Index of Coincidence, Chi-squared distribution, character set bounding.
- **Classical Cipher Brute-Force**: Caesar shifts (1-25), ROT variants, Atbash, Affine ($a,b$), Vigenère, Rail Fence, and Single-byte XOR.
- **Recursive Pipeline Engine**: Breadth-first exploration with cycle detection and depth limit $D=10$.
- **Source Code Intelligence**: Static AST analysis with zero dynamic code evaluation.
- **Fail-Closed Security**: Input size verification, 3-pass memory shredder, zero-plaintext audit logs.

## 4. Frontend Web Dashboard
- **React 18 + Vite + TypeScript + Tailwind CSS**
- **Cyber-Physical Theme**: Charcoal `#0B0F17`, Glass `#161B26`, Cyan `#00E5FF`, Amber `#FFB300`, Red `#FF3D00`.
- **Virtual ESP32 Console**: 1:1 photorealistic emulator with interactive OLED, keypad, and packet log.
