#include "ui_controller.h"
#include "display/ssd1306_oled.h"
#include "security/security_manager.h"
#include <string.h>
#include <stdio.h>

static ui_state_t s_ui_state = UI_STATE_SPLASH;
static char s_input_buffer[64];
static size_t s_buf_len = 0;

void ui_init(void) {
    s_ui_state = UI_STATE_IDLE;
    memset(s_input_buffer, 0, sizeof(s_input_buffer));
    s_buf_len = 0;
    oled_draw_status("CIPHERON-X1", "MODE: STANDARD", "COMM: SECURE SERIAL", "READY FOR INPUT");
}

void ui_update(void) {
    // Periodic refresh
}

void ui_handle_keypad(char key) {
    if (s_ui_state == UI_STATE_PANIC_WIPED) return;
    
    if (key >= '0' && key <= '9' || (key >= 'A' && key <= 'F')) {
        if (s_buf_len < sizeof(s_input_buffer) - 1) {
            s_input_buffer[s_buf_len++] = key;
            s_input_buffer[s_buf_len] = '\0';
            s_ui_state = UI_STATE_INPUT_BUFFER;
            oled_draw_status("INPUT BUFFER", "KEYPAD ENTRY", "HEX/TXT INGEST", s_input_buffer);
        }
    } else if (key == '*') {
        ui_handle_button_clear();
    } else if (key == '#') {
        ui_handle_button_enter();
    }
}

void ui_handle_button_enter(void) {
    if (s_ui_state == UI_STATE_PANIC_WIPED) return;
    if (s_buf_len > 0) {
        oled_draw_status("TRANSMITTING", "PAYLOAD DISPATCH", "TO COMPANION...", s_input_buffer);
    }
}

void ui_handle_button_back(void) {
    if (s_ui_state == UI_STATE_PANIC_WIPED) return;
    if (s_buf_len > 0) {
        s_input_buffer[--s_buf_len] = '\0';
        oled_draw_status("INPUT BUFFER", "BACKSPACE", "HEX/TXT INGEST", s_input_buffer);
    } else {
        s_ui_state = UI_STATE_IDLE;
        oled_draw_status("CIPHERON-X1", "MODE: STANDARD", "COMM: SECURE SERIAL", "READY FOR INPUT");
    }
}

void ui_handle_button_clear(void) {
    if (s_ui_state == UI_STATE_PANIC_WIPED) return;
    memset(s_input_buffer, 0, sizeof(s_input_buffer));
    s_buf_len = 0;
    oled_draw_status("INPUT BUFFER", "BUFFER CLEARED", "COMM: READY", "");
}

void ui_handle_panic(void) {
    s_ui_state = UI_STATE_PANIC_WIPED;
    memset(s_input_buffer, 0, sizeof(s_input_buffer));
    s_buf_len = 0;
    security_execute_panic_wipe();
}

ui_state_t ui_get_state(void) {
    return s_ui_state;
}
