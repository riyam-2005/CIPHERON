#include "ssd1306_oled.h"
#include "config/pinout_config.h"
#include <string.h>
#include <stdio.h>

// 128x64 monochrome frame buffer (1024 bytes)
static uint8_t s_frame_buffer[OLED_WIDTH * OLED_HEIGHT / 8];
static char s_lines[4][22];

void oled_init(void) {
    memset(s_frame_buffer, 0, sizeof(s_frame_buffer));
    memset(s_lines, 0, sizeof(s_lines));
    // Hardware I2C initialization logic in real hardware
    oled_display_text(0, "CIPHERON-X1");
    oled_display_text(1, "SYS: READY");
    oled_display_text(2, "MODE: STANDARD");
    oled_display_text(3, "COMM: SERIAL AUTH");
}

void oled_clear(void) {
    memset(s_frame_buffer, 0, sizeof(s_frame_buffer));
    for (int i = 0; i < 4; i++) {
        s_lines[i][0] = '\0';
    }
}

void oled_display_text(uint8_t line, const char *text) {
    if (line >= 4 || !text) return;
    strncpy(s_lines[line], text, 21);
    s_lines[line][21] = '\0';
}

void oled_update_screen(void) {
    // In ESP-IDF, transmits buffer over I2C to SSD1306
}

void oled_draw_splash_screen(void) {
    oled_clear();
    oled_display_text(0, "== CIPHERON-X1 ==");
    oled_display_text(1, "CYBER-PHYSICAL");
    oled_display_text(2, "CRYPTANALYSIS LAB");
    oled_display_text(3, "BOOTING HW CORE...");
    oled_update_screen();
}

void oled_draw_panic_screen(void) {
    oled_clear();
    oled_display_text(0, "! PANIC TRIGGER !");
    oled_display_text(1, "MEMORY SHREDDED");
    oled_display_text(2, "KEYS ERASED");
    oled_display_text(3, "SYSTEM HALTED");
    oled_update_screen();
}

void oled_draw_status(const char *header, const char *mode, const char *status, const char *snippet) {
    oled_clear();
    if (header) oled_display_text(0, header);
    if (mode) oled_display_text(1, mode);
    if (status) oled_display_text(2, status);
    if (snippet) oled_display_text(3, snippet);
    oled_update_screen();
}
