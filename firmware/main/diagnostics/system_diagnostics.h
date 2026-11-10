#ifndef SYSTEM_DIAGNOSTICS_H
#define SYSTEM_DIAGNOSTICS_H

#include <stdint.h>
#include <stdbool.h>

typedef struct {
    uint32_t free_heap_bytes;
    uint32_t min_free_heap_bytes;
    uint32_t uptime_seconds;
    bool i2c_healthy;
    bool serial_healthy;
} system_diagnostics_t;

void diagnostics_init(void);
void diagnostics_refresh(void);
const system_diagnostics_t* diagnostics_get(void);

#endif // SYSTEM_DIAGNOSTICS_H
