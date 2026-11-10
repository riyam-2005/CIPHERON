# CIPHERON-X1 Frontend Architecture & Design System

## 1. Design System Tokens
Adhering to PRD Section 6.3 UX & Visual Design System:
- **Primary Background**: `#0B0F17` (Near-black graphite)
- **Secondary Surface**: `#161B26` (Subtle glass pane, backdrop blur)
- **Border / Outline**: `#232B3E`
- **Accent Cyan**: `#00E5FF` (Status active / highlighting)
- **Accent Amber**: `#FFB300` (Warning indicators)
- **Security Red**: `#FF3D00` (Emergency panic & alert)
- **Status Green**: `#00E676` (Top candidate & verified match)
- **Text Light**: `#E0E6ED`

## 2. Key Components
1. **Interactive Transformation DAG**: Visualizes multi-stage recursive tree with node latency badges, intermediate text previews, and score chips.
2. **Virtual ESP32 Console**: Photorealistic 128x64 OLED display emulator with scanlines, 4x4 matrix keypad with audio click feedback, tactile push buttons, and glowing RGB status LED.
3. **Statistical Metrics Bar**: Real-time gauges for Shannon entropy ($H$), Index of Coincidence ($IC$), printable ASCII %, and Chi-squared distribution.
4. **Code Intelligence Inspector**: Displays functions, classes, cyclomatic complexity meters, and obfuscation warning flags.
5. **Binary & Hex Viewer**: Formatted offset, hex bytes, and ASCII representation with byte distribution histograms.
6. **Provenance Audit Explorer**: Cryptographic provenance logs with SHA-256 fingerprints.

## 3. Accessibility & Responsiveness (NFR-3.1, NFR-3.3)
- Fully responsive across screen viewports from **320px (Mobile)** to **3840px (Ultrawide 4K)**.
- High contrast, keyboard navigable, reduced-motion compatible.
