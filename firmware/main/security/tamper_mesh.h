#ifndef TAMPER_MESH_H
#define TAMPER_MESH_H

#include <stdbool.h>
#include <stdint.h>

typedef void (*tamper_callback_t)(void);

void tamper_mesh_init(tamper_callback_t on_tamper);
bool tamper_mesh_is_intact(void);
bool tamper_mesh_verify_pulse(void);
uint32_t tamper_mesh_get_pulse_checks_count(void);
void tamper_mesh_simulate_intrusion(void);

#endif // TAMPER_MESH_H

