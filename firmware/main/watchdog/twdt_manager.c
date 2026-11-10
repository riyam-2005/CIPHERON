#include "twdt_manager.h"
#include "config/pinout_config.h"
#include <stdio.h>

void twdt_init(void) {
    // In ESP-IDF:
    // esp_task_wdt_config_t config = { .timeout_ms = TWDT_TIMEOUT_MS, .idle_core_mask = 0, .trigger_panic = true };
    // esp_task_wdt_init(&config);
    // esp_task_wdt_add(NULL);
}

void twdt_feed(void) {
    // In ESP-IDF:
    // esp_task_wdt_reset();
}

void twdt_deinit(void) {
    // In ESP-IDF:
    // esp_task_wdt_deinit();
}
