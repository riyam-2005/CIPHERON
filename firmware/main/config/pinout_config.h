#ifndef PINOUT_CONFIG_H
#define PINOUT_CONFIG_H

#include <stdint.h>

/*
 * CIPHERON-X1 Hardware Pinout Configuration
 * V3.0.0-EXECUTION Hardware Architecture (Custom 4-Layer PCB)
 * Directly adhering to suggestion-v2.md Section 2.1
 */

// Analog Voltage / Fuel Gauge Divider
#define PIN_VBAT_SENSE        1   // Analog voltage divider from LiPo terminal

// Active PCB Tamper Mesh Guard Loop (Monitored by ULP co-processor)
#define PIN_TAMPER_MESH_IN    2   // ULP active pulse monitor input
#define PIN_TAMPER_MESH_OUT   3   // ULP active pulse generator output
#define PIN_TAMPER_MESH_LOOP  PIN_TAMPER_MESH_IN // Legacy alias

// RGB LED (WS2812B / RMT peripheral) & Audio
#define PIN_WS2812B_DATA      4   // WS2812B RMT data line
#define PIN_BUZZER_PWM        5   // LEDC PWM channel for 5V active piezo buzzer

// Quadrature Rotary Encoder (Menu navigation & parameter tuning)
#define PIN_ENCODER_A         6   // Quadrature channel A (10k pull-up)
#define PIN_ENCODER_B         7   // Quadrature channel B (10k pull-up)
#define PIN_ENCODER_SW        8   // Active-low tactile push switch

// High-Speed SPI Bus (ST7789 TFT / E-Paper Dual Display)
#define PIN_SPI_SCK           9   // SPI Clock
#define PIN_SPI_MOSI          10  // SPI Master Out Slave In
#define PIN_SPI_MISO          11  // SPI Master In Slave Out (EPD feedback)
#define PIN_TFT_CS            12  // Display Chip Select
#define PIN_TFT_DC            13  // Data/Command control line
#define PIN_TFT_RST           14  // Hardware Reset line
#define PIN_EPD_BUSY          15  // E-Paper Busy status flag

// High-Speed I2C0 Bus (ATECC608A Secure Element, NXP SE050, MAX17048 Fuel Gauge, 400kHz)
#define PIN_I2C_SDA           17  // Primary I2C Data line (4.7k pull-up)
#define PIN_I2C_SCL           18  // Primary I2C Clock line (4.7k pull-up)
#define PIN_OLED_SDA          PIN_I2C_SDA
#define PIN_OLED_SCL          PIN_I2C_SCL
#define OLED_I2C_ADDR         0x3C
#define OLED_I2C_FREQ_HZ      400000
#define ATECC608A_I2C_ADDR    0x60
#define NXP_SE050_I2C_ADDR    0x48  // NXP SE050 FIPS 140-3 Level 3 Secure Element
#define MAX17048_I2C_ADDR     0x36

// Native USB OTG (Full-Speed USB 2.0 Differential Pair)
#define PIN_USB_DM            19  // USB Native D-
#define PIN_USB_DP            20  // USB Native D+

// 4x4 Matrix Keypad Rows (Outputs / Scanned)
#define PIN_KEYPAD_ROW_0      21
#define PIN_KEYPAD_ROW_1      38
#define PIN_KEYPAD_ROW_2      39
#define PIN_KEYPAD_ROW_3      40

// 4x4 Matrix Keypad Columns (Inputs with Internal Pull-Down)
#define PIN_KEYPAD_COL_0      41
#define PIN_KEYPAD_COL_1      42
#define PIN_KEYPAD_COL_2      45
#define PIN_KEYPAD_COL_3      46

// Legacy Push Button Aliases
#define PIN_BTN_ENTER         PIN_ENCODER_SW
#define PIN_BTN_BACK          14
#define PIN_BTN_CLEAR         15
#define PIN_BTN_PANIC         PIN_TAMPER_MESH_IN

// Legacy RGB LED Aliases
#define PIN_LED_RED           PIN_WS2812B_DATA
#define PIN_LED_GREEN         PIN_WS2812B_DATA
#define PIN_LED_BLUE          PIN_WS2812B_DATA

// Target Microcontroller Profile & System Revision
#define TARGET_MCU_ARCH       "ESP32-S3-WROOM-1U-N16R8"
#define HARDWARE_REVISION     "9.0.0-SINGULARITY SILICON"
#define FIRMWARE_VERSION      "9.0.0-SINGULARITY SILICON"
#define PQC_HYBRID_ENABLED    1
#define ESP_MESH_LITE_ENABLED 1
#define ESP_DL_VECTOR_ENABLED 1
#define SILICON_SECURITY_ENABLED 1
#define HARDWARE_PUF_ENABLED     1
#define NEUROMORPHIC_SNN_ENABLED 1
#define EMFI_GLITCH_ENABLED      1
#define EFPGA_RECONFIG_ENABLED   1
#define QKD_OPTICAL_MESH_ENABLED 1
#define PHOTONIC_TPU_ENABLED     1
#define ORBITAL_FSO_MESH_ENABLED 1
#define TOPOLOGICAL_QUANTUM_ENABLED 1
#define MEMRISTOR_CROSSBAR_ENABLED 1
#define DTN_INTERPLANETARY_ENABLED 1
#define MICROFLUIDIC_ZEROIZATION_ENABLED 1

// Silicon Security, EMFI & eFPGA Pins (suggestion-v6.md)
#define PIN_OPTICAL_SENSOR    2
#define PIN_VOLTAGE_ALERT      3
#define PIN_EMFI_GLITCH_OUT   21
#define PIN_EFPGA_CS          10
#define PIN_EFPGA_CLK         11
#define PIN_EFPGA_MOSI        12
#define PIN_QKD_SYNC          22
#define PIN_QKD_PHOTON_IN     23

// Silicon Photonic TPU MZI Phase Shifter DAC & FSO Transceiver Pins (suggestion-v7.md)
#define PIN_PHOTONIC_DAC_THETA 25 // DAC Channel 1 (MZI Theta Phase Modulator)
#define PIN_PHOTONIC_DAC_PHI   26 // DAC Channel 2 (MZI Phi Phase Modulator)
#define PIN_PHOTONIC_ADC_OUT   1  // ADC1 Channel 0 High-Speed Photodetector Read
#define PIN_FSO_LASER_TX       27 // 1550nm FSO Laser Transmitter Modulation Output
#define PIN_FSO_LASER_RX       28 // High-Speed FSO Optical Receiver Input

// Quantum-Memristor 1T1M Crossbar & Microfluidic Zeroization Pins (suggestion-v8.md)
#define PIN_MEMRISTOR_DAC_WL0  25 // DAC Channel 1 (Wordline 0 Analog Voltage)
#define PIN_MEMRISTOR_DAC_WL1  26 // DAC Channel 2 (Wordline 1 Analog Voltage)
#define PIN_MEMRISTOR_ADC_BL0  36 // ADC1 Channel 0 (Bitline 0 Current Accumulator)
#define PIN_MEMRISTOR_ADC_BL1  39 // ADC1 Channel 3 (Bitline 1 Current Accumulator)
#define PIN_MICROFLUIDIC_VALVE 33 // High-speed micro-valve exothermic trigger pin

// System & Watchdog Constants
#define TWDT_TIMEOUT_MS       5000
#define SERIAL_BAUD_RATE      115200

#endif // PINOUT_CONFIG_H

