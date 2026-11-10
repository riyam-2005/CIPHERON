#include "security_manager.h"
#include "display/ssd1306_oled.h"
#include <string.h>
#include <stdlib.h>

static security_state_t s_state;

void security_init(void) {
    s_state.flash_encryption_active = true;
    s_state.secure_boot_active = true;
    s_state.fortress_mode_enabled = false;
    s_state.session_id = 0x8829A1F0;
}

bool security_check_flash_encryption(void) {
    return s_state.flash_encryption_active;
}

bool security_check_secure_boot(void) {
    return s_state.secure_boot_active;
}

void security_execute_panic_wipe(void) {
    s_state.session_id = 0;
    s_state.fortress_mode_enabled = true;
    
    // In real hardware, triggers NVS flash erase partition and 3-pass memory shredder
    oled_draw_panic_screen();
}

const security_state_t* security_get_state(void) {
    return &s_state;
}
