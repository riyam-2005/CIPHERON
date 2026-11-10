# CIPHERON-X1 Firmware Guide (ESP-IDF v5.x)

## 1. Overview
The firmware subsystem is built for the ESP32 microcontroller using ESP-IDF v5.x. It manages peripheral hardware, user input debouncing, OLED display rendering, task watchdog monitoring, and authenticated serial framing.

## 2. Firmware Directory Layout
```
firmware/
├── CMakeLists.txt
├── main/
│   ├── main.c                     # app_main entrypoint & RTOS loop
│   ├── config/pinout_config.h     # Hardware pin assignments
│   ├── display/ssd1306_oled.c/.h  # SSD1306 128x64 I2C driver
│   ├── keypad/matrix_keypad.c/.h  # 4x4 keypad scanner & debouncing
│   ├── buttons/hardware_buttons.c # Tactile button ISRs & panic trigger
│   ├── communication/serial_protocol.c # Binary framed protocol parser
│   ├── security/security_manager.c# Flash encryption & panic wipe
│   ├── crypto/crypto_engine.c     # Cryptographic primitives
│   ├── decoder/hw_decoder.c       # On-chip Hex & Base64 decoders
│   ├── watchdog/twdt_manager.c    # Task Watchdog Timer (5.0s timeout)
│   ├── diagnostics/system_diagnostics.c # Heap & uptime monitor
│   ├── update/ota_manager.c       # Cryptographically signed OTA
│   └── ui/ui_controller.c         # Menu state machine
└── tests/test_firmware.c          # Unity test suite
```

## 3. Building and Flashing
### Prerequisites
- ESP-IDF v5.2 or newer installed and exported in environment (`. $IDF_PATH/export.sh` or `export.ps1`)

### Build Commands
```bash
cd firmware
idf.py set-target esp32
idf.py build
idf.py -p COM3 flash monitor
```

### Running the Firmware Unit Test Suite
The firmware test suite compiles standalone with GCC for host verification:
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
