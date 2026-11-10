/**
 * @file glitch_generator.h
 * @brief Active Electromagnetic Fault Injection (EMFI) & Glitch Pulser Driver
 * CIPHERON-X1 V6.0-NEURAL-QUANTUM SILICON FABRIC
 * Adhering to suggestion-v5.md Section 4.1
 */

#ifndef GLITCH_GENERATOR_H
#define GLITCH_GENERATOR_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

#define GLITCH_BASE_TICK_NS     12.5f  // 12.5ns at 80MHz clock rate
#define PIN_DEFAULT_GLITCH_OUT  21

typedef struct {
    uint8_t out_pin;
    uint32_t pulse_width_ns;
    uint32_t delay_offset_ns;
    uint32_t repeat_count;
    uint32_t total_fired;
    bool is_armed;
} glitch_config_t;

/**
 * @brief Initialize active glitch generator hardware peripheral
 */
void glitch_generator_init(uint8_t out_pin);

/**
 * @brief Arm glitch generator with target pulse parameters
 * @param pulse_width_ns Glitch pulse duration in nanoseconds (minimum 12.5ns)
 * @param delay_offset_ns Trigger offset in nanoseconds
 * @param repeat_count Number of pulses per burst
 */
bool glitch_generator_arm(uint32_t pulse_width_ns, uint32_t delay_offset_ns, uint32_t repeat_count);

/**
 * @brief Trigger high-resolution fault injection pulse burst
 */
bool glitch_generator_trigger_pulse(void);

/**
 * @brief Retrieve current armed configuration
 */
const glitch_config_t* glitch_generator_get_config(void);

/**
 * @brief Disarm glitch pulser
 */
void glitch_generator_disarm(void);

#ifdef __cplusplus
}
#endif

#endif // GLITCH_GENERATOR_H
