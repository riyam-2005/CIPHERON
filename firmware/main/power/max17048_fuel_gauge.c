#include "max17048_fuel_gauge.h"

void max17048_init(void) {
    // In real hardware, transmits QuickStart command to 0x36
}

bool max17048_read_telemetry(max17048_telemetry_t *out_telem) {
    if (!out_telem) return false;
    // In real hardware, reads VCELL (0x02) and SOC (0x04) registers over I2C
    out_telem->voltage_mv = 4150; // 4.15V LiPo nominal
    out_telem->state_of_charge_percent = 92.5f;
    out_telem->charge_rate_percent_per_hr = 15.0f;
    out_telem->is_charging = true;
    out_telem->is_low_battery = false;
    return true;
}
