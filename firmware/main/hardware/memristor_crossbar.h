/**
 * @file memristor_crossbar.h
 * @brief 1T1M Nanoscale HfOx/TiOx Quantum-Memristor Analog Crossbar Array Driver
 * CIPHERON-X1 V9.0.0-SINGULARITY SILICON, NEURAL-MEMRISTOR CROSSBAR & DEEP SPACE INTERPLANETARY MESH
 * Directly adhering to suggestion-v8.md Sections 1.1, 3.1 & 6.1
 */

#ifndef MEMRISTOR_CROSSBAR_H
#define MEMRISTOR_CROSSBAR_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

// Pin and DAC/ADC channel assignments
#define DAC_WORDLINE_0         1 // DAC_CHANNEL_1 (GPIO 25)
#define DAC_WORDLINE_1         2 // DAC_CHANNEL_2 (GPIO 26)
#define PIN_MEMRISTOR_WL0      25
#define PIN_MEMRISTOR_WL1      26
#define PIN_MEMRISTOR_BL0_ADC  0 // ADC1 Channel 0 (GPIO 36 / SENSOR_VP)
#define PIN_MEMRISTOR_BL1_ADC  3 // ADC1 Channel 3 (GPIO 39 / SENSOR_VN)
#define PIN_MICROFLUIDIC_ACT   33 // Microfluidic exothermic valve trigger pin

typedef struct {
    bool initialized;
    float conductance_matrix[2][2];     // Conductance in milliSiemens (mS)
    float last_current_out[2];          // Output accumulated currents (mA or scaled V)
    uint8_t last_v_in[2];               // Wordline input voltages (0..255 DAC levels)
    uint32_t total_vmm_ops;             // Total Vector-Matrix Multiplications executed
    float efficiency_tops_per_watt;     // 100 TOPS/W target
    float vmm_latency_ns;               // Analog VMM execution latency (<15 ns)
    bool microfluidic_armed;            // Exothermic chemical zeroization status
    bool zeroized;                      // True if chemical dissolution has fired (<500ns)
    float dissolution_time_ns;          // Dissolution reaction duration (typ 320ns, <500ns)
} memristor_status_t;

/**
 * @brief Initialize 1T1M HfOx memristive processing-in-memory crossbar array and arm DAC/ADC rails.
 */
void init_memristor_crossbar(void);

/**
 * @brief Executes analog Vector-Matrix Multiplication (VMM) via Ohmic and Kirchhoff current summation:
 *        I_out = G_memristor * V_in
 * @param v_in_0 Input voltage level for Wordline 0 (0..255)
 * @param v_in_1 Input voltage level for Wordline 1 (0..255)
 * @param current_out Pointer to array of size 2 receiving calculated/measured Bitline currents
 */
void execute_memristor_vmm(uint8_t v_in_0, uint8_t v_in_1, float* current_out);

/**
 * @brief Program conductance modulation into specific 1T1M crossbar cell.
 * @param row Wordline index (0..1)
 * @param col Bitline index (0..1)
 * @param conductance_ms Target conductance in milliSiemens (0.01 to 2.0 mS)
 */
void program_memristor_cell(uint8_t row, uint8_t col, float conductance_ms);

/**
 * @brief Retrieve current status and telemetry of the Memristor Processing-in-Memory subsystem.
 * @param status Pointer to status struct to populate
 */
void get_memristor_status(memristor_status_t* status);

/**
 * @brief Triggers active microfluidic chemical zeroization (<500ns silicon dissolution).
 * @return 0 on successful exothermic release trigger, negative on error
 */
int trigger_microfluidic_zeroization(void);

/**
 * @brief Check if silicon substrate metallization has undergone chemical zeroization.
 * @return true if zeroized, false otherwise
 */
bool is_microfluidic_zeroized(void);

/**
 * @brief Reset memristor crossbar to neutral calibrated state.
 */
void reset_memristor_crossbar(void);

#ifdef __cplusplus
}
#endif

#endif // MEMRISTOR_CROSSBAR_H
