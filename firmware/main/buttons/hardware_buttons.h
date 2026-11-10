#ifndef HARDWARE_BUTTONS_H
#define HARDWARE_BUTTONS_H

#include <stdint.h>
#include <stdbool.h>

typedef enum {
    BTN_NONE = 0,
    BTN_ENTER,
    BTN_BACK,
    BTN_CLEAR,
    BTN_PANIC
} button_type_t;

typedef void (*panic_callback_t)(void);

void buttons_init(panic_callback_t on_panic);
button_type_t buttons_poll(void);

#endif // HARDWARE_BUTTONS_H
