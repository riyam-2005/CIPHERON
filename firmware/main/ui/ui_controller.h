#ifndef UI_CONTROLLER_H
#define UI_CONTROLLER_H

#include <stdint.h>
#include <stdbool.h>

typedef enum {
    UI_STATE_SPLASH = 0,
    UI_STATE_IDLE,
    UI_STATE_INPUT_BUFFER,
    UI_STATE_DECODE_RESULT,
    UI_STATE_PANIC_WIPED
} ui_state_t;

void ui_init(void);
void ui_update(void);
void ui_handle_keypad(char key);
void ui_handle_button_enter(void);
void ui_handle_button_back(void);
void ui_handle_button_clear(void);
void ui_handle_panic(void);
ui_state_t ui_get_state(void);

#endif // UI_CONTROLLER_H
