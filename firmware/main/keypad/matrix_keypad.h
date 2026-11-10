#ifndef MATRIX_KEYPAD_H
#define MATRIX_KEYPAD_H

#include <stdint.h>
#include <stdbool.h>

void keypad_init(void);
char keypad_scan(void);
bool keypad_has_key(void);
char keypad_pop_key(void);

#endif // MATRIX_KEYPAD_H
