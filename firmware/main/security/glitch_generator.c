/**
 * @file glitch_generator.c
 * @brief Active Electromagnetic Fault Injection (EMFI) & Glitch Pulser Driver
 * CIPHERON-X1 V6.0-NEURAL-QUANTUM SILICON FABRIC
 * Adhering to suggestion-v5.md Section 4.1
 */

#include "glitch_generator.h"
#include <string.h>

static glitch_config_t s_glitch_cfg = {
    .out_pin = PIN_DEFAULT_GLITCH_OUT,
    .pulse_width_ns = 25,
    .delay_offset_ns = 100,
    .repeat_count = 1,
    .total_fired = 0,
    .is_armed = false
};

void glitch_generator_init(uint8_t out_pin) {
    s_glitch_cfg.out_pin = out_pin;
    s_glitch_cfg.pulse_width_ns = 25;
    s_glitch_cfg.delay_offset_ns = 100;
    s_glitch_cfg.repeat_count = 1;
    s_glitch_cfg.total_fired = 0;
    s_glitch_cfg.is_armed = false;
}

bool glitch_generator_arm(uint32_t pulse_width_ns, uint32_t delay_offset_ns, uint32_t repeat_count) {
    if (pulse_width_ns < 12) {
        pulse_width_ns = 12; // Minimum tick limit
    }
    s_glitch_cfg.pulse_width_ns = pulse_width_ns;
    s_glitch_cfg.delay_offset_ns = delay_offset_ns;
    s_glitch_cfg.repeat_count = repeat_count > 0 ? repeat_count : 1;
    s_glitch_cfg.is_armed = true;
    return true;
}

bool glitch_generator_trigger_pulse(void) {
    if (!s_glitch_cfg.is_armed) return false;

    // Simulate nanosecond precision pulse execution via hardware RMT peripheral
    // Delta t = 12.5ns quantized steps
    s_glitch_cfg.total_fired += s_glitch_cfg.repeat_count;
    return true;
}

const glitch_config_t* glitch_generator_get_config(void) {
    return &s_glitch_cfg;
}

void glitch_generator_disarm(void) {
    s_glitch_cfg.is_armed = false;
}
