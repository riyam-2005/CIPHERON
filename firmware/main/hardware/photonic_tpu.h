/**
 * @file photonic_tpu.h
 * @brief Silicon Photonic Tensor Processing Unit (P-TPU) Driver
 * CIPHERON-X1 V8.0-AUTONOMOUS SPACE MESH & PHOTONIC QUANTUM RESISTANCE
 * Adhering to suggestion-v7.md Section 3 & 6.1
 */

#ifndef PHOTONIC_TPU_H
#define PHOTONIC_TPU_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

// Photonic TPU Pin Definitions
#define DAC_CHANNEL_MZI_THETA   1 // DAC_CHANNEL_1 (GPIO 25)
#define DAC_CHANNEL_MZI_PHI     2 // DAC_CHANNEL_2 (GPIO 26)
#define PIN_MZI_THETA           25
#define PIN_MZI_PHI             26
#define PIN_MZI_PHOTODIODE_ADC  1

typedef struct {
    bool initialized;
    uint8_t phase_theta;
    uint8_t phase_phi;
    uint32_t measured_photodiode_mv;
    float optical_transmission;
    float energy_per_op_pj;          // <0.1 pJ/op target
    uint32_t total_transforms;
    float propagation_latency_ps;   // <1000 ps (<1 ns)
} photonic_tpu_status_t;

/**
 * @brief Initialize Silicon Photonic MZI Optical Mesh Interface and armed DAC drivers.
 */
void init_photonic_tpu_interface(void);

/**
 * @brief Executes 2x2 optical unitary transformation via phase shifting (<1ns propagation).
 * @param phase_theta Phase shift theta (0..255 maps to 0..2*pi)
 * @param phase_phi Phase shift phi (0..255 maps to 0..2*pi)
 * @return 0 on success, negative error code on failure
 */
int execute_photonic_mzi_transform(uint8_t phase_theta, uint8_t phase_phi);

/**
 * @brief Retrieve current Silicon Photonic TPU telemetry.
 * @param status Pointer to status struct to populate
 */
void get_photonic_tpu_status(photonic_tpu_status_t* status);

/**
 * @brief Reset Photonic TPU to default neutral state.
 */
void reset_photonic_tpu(void);

#ifdef __cplusplus
}
#endif

#endif // PHOTONIC_TPU_H
