#ifndef BOOT_VERIFIER_H
#define BOOT_VERIFIER_H

#include <stdbool.h>
#include <stdint.h>

bool boot_verify_strapping_pins(void);
uint32_t boot_measure_cold_boot_time_ms(void);
bool boot_is_secure_boot_verified(void);

#endif // BOOT_VERIFIER_H
