#include "hardware_buttons.h"
#include "config/pinout_config.h"

static panic_callback_t s_panic_cb = 0;

void buttons_init(panic_callback_t on_panic) {
    s_panic_cb = on_panic;
    // Configures GPIO 15, 2, 4, 5 as input with pull-ups and negative edge interrupts
}

button_type_t buttons_poll(void) {
    // In polling mode or ISR queue reading
    return BTN_NONE;
}

// In real ISR:
void IRAM_ATTR button_panic_isr(void *arg) {
    if (s_panic_cb) {
        s_panic_cb();
    }
}
