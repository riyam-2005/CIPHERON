#ifndef SSD1306_OLED_H
#define SSD1306_OLED_H

#include <stdint.h>
#include <stdbool.h>

#define OLED_WIDTH   128
#define OLED_HEIGHT  64

void oled_init(void);
void oled_clear(void);
void oled_display_text(uint8_t line, const char *text);
void oled_update_screen(void);
void oled_draw_splash_screen(void);
void oled_draw_panic_screen(void);
void oled_draw_status(const char *header, const char *mode, const char *status, const char *snippet);

#endif // SSD1306_OLED_H
