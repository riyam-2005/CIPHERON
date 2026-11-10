#include "tamper_mesh.h"
#include "config/pinout_config.h"

static tamper_callback_t s_tamper_cb = 0;
static bool s_intact = true;
static uint32_t s_pulse_checks = 0;

void tamper_mesh_init(tamper_callback_t on_tamper) {
    s_tamper_cb = on_tamper;
    s_intact = true;
    s_pulse_checks = 0;
    // Configures PIN_TAMPER_MESH_OUT (GPIO 3) as pulse generator and PIN_TAMPER_MESH_IN (GPIO 2) as ULP input
}

bool tamper_mesh_is_intact(void) {
    return s_intact;
}

bool tamper_mesh_verify_pulse(void) {
    s_pulse_checks++;
    if (!s_intact) {
        if (s_tamper_cb) {
            s_tamper_cb();
        }
        return false;
    }
    // In real hardware, transmits microsecond pulse on GPIO 3 and confirms reception on GPIO 2
    return true;
}

uint32_t tamper_mesh_get_pulse_checks_count(void) {
    return s_pulse_checks;
}

void tamper_mesh_simulate_intrusion(void) {
    s_intact = false;
    if (s_tamper_cb) {
        s_tamper_cb();
    }
}

