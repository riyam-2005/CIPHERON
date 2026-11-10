#include "system_diagnostics.h"

static system_diagnostics_t s_diag;

void diagnostics_init(void) {
    s_diag.free_heap_bytes = 184320;
    s_diag.min_free_heap_bytes = 142000;
    s_diag.uptime_seconds = 0;
    s_diag.i2c_healthy = true;
    s_diag.serial_healthy = true;
}

void diagnostics_refresh(void) {
    s_diag.uptime_seconds++;
}

const system_diagnostics_t* diagnostics_get(void) {
    return &s_diag;
}
