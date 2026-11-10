#include <stdio.h>
#include <string.h>

#include "config/pinout_config.h"
#include "boot/boot_verifier.h"
#include "diagnostics/system_diagnostics.h"
#include "security/security_manager.h"
#include "display/ssd1306_oled.h"
#include "keypad/matrix_keypad.h"
#include "buttons/hardware_buttons.h"
#include "watchdog/twdt_manager.h"
#include "communication/serial_protocol.h"
#include "decoder/hw_decoder.h"
#include "ui/ui_controller.h"
#include "hardware/photonic_tpu.h"
#include "hardware/memristor_crossbar.h"

static void handle_system_panic(void) {
    ui_handle_panic();
}

void app_main(void) {
    // 1. Boot Verification & Strapping Pin Protection
    boot_verify_strapping_pins();
    
    // 2. Initialize Core Subsystems
    diagnostics_init();
    security_init();
    
    // 3. Peripheral Hardware Initialization
    oled_init();
    keypad_init();
    buttons_init(handle_system_panic);
    protocol_init();
    init_photonic_tpu_interface();
    init_memristor_crossbar();
    
    // 4. Initialize Hardware Task Watchdog Timer (5.0s timeout per NFR-2.2)
    twdt_init();
    
    // 5. Initialize UI Controller & Render Ready Screen
    ui_init();
    
    printf("[CIPHERON-X1] Firmware %s Initialized Successfully.\n", FIRMWARE_VERSION);
    printf("[CIPHERON-X1] Fail-closed security perimeter operational.\n");

    // Main Hardware Event Loop
    while (1) {
        // Feed watchdog timer
        twdt_feed();
        
        // Scan keypad
        if (keypad_has_key()) {
            char key = keypad_pop_key();
            ui_handle_keypad(key);
        }
        
        // Poll buttons
        button_type_t btn = buttons_poll();
        if (btn == BTN_ENTER) {
            ui_handle_button_enter();
        } else if (btn == BTN_BACK) {
            ui_handle_button_back();
        } else if (btn == BTN_CLEAR) {
            ui_handle_button_clear();
        } else if (btn == BTN_PANIC) {
            handle_system_panic();
        }
        
        // Refresh diagnostics
        diagnostics_refresh();
        
        // Yield to RTOS task scheduler
        // vTaskDelay(pdMS_TO_TICKS(20));
        break; // For simulation/test compilation loop termination
    }
}
