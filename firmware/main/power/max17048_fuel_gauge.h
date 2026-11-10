#ifndef MAX17048_FUEL_GAUGE_H
#define MAX17048_FUEL_GAUGE_H

#include <stdint.h>
#include <stdbool.h>

typedef struct {
    uint16_t voltage_mv;
    float state_of_charge_percent;
    float charge_rate_percent_per_hr;
    bool is_charging;
    bool is_low_battery;
} max17048_telemetry_t;

void max17048_init(void);
bool max17048_read_telemetry(max17048_telemetry_t *out_telem);

#endif // MAX17048_FUEL_GAUGE_H
