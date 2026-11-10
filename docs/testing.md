# CIPHERON-X1 Testing & Quality Gates

## 1. Test Strategy Overview
CIPHERON-X1 enforces a 100% test pass rate across both firmware and backend test suites, covering all standardized baseline test vectors from PRD Section 8.2.

## 2. Standardized Baseline Test Vectors (PRD 8.2)
| Target Engine | Test Input Payload | Expected Result | Validation Standard |
| :--- | :--- | :--- | :--- |
| **Base64 Decoder** | `SGVsbG8gQ0lQSEVST04tWDEx` | Hello CIPHERON-X11 | Exact Plaintext |
| **Hex Decoder** | `4349504845524f4e` | CIPHERON | Exact Plaintext |
| **Binary Decoder** | `01010100 01100101 01110011 01110100` | Test | Exact Plaintext |
| **ROT13 Cipher** | `Uryyb Jbeyq` | Hello World | Exact Plaintext |
| **Caesar Cipher** | `KHOOR` (Shift +3) | HELLO | Top Candidate Score |
| **Morse Code** | `.... . .-.. .-.. ---` | HELLO | Exact Plaintext |
| **SHA-256 Hash** | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | SHA-256 Identified | One-Way Warning Msg |

## 3. Running Backend Automated Tests
```bash
cd backend
$env:PYTHONPATH="."
python -m pytest tests/test_backend.py -v
```
All 24 test cases pass with 100% success rate.

## 4. Running Firmware Unit Tests
```bash
gcc -I firmware/main -I firmware/main/config firmware/tests/test_firmware.c \
    firmware/main/decoder/hw_decoder.c \
    firmware/main/communication/serial_protocol.c \
    firmware/main/ui/ui_controller.c \
    firmware/main/display/ssd1306_oled.c \
    firmware/main/security/security_manager.c \
    firmware/main/boot/boot_verifier.c \
    -o firmware/tests/test_firmware.exe

./firmware/tests/test_firmware.exe
```
All 5 firmware test suites (Hex decoder, Base64 decoder, Serial framing, UI state panic, Cold boot timing SLA) pass with 100% success rate.
