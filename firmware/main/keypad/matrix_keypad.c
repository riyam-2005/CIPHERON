#include "matrix_keypad.h"
#include "config/pinout_config.h"
#include <string.h>

static const char KEYMAP[4][4] = {
    { '1', '2', '3', 'A' },
    { '4', '5', '6', 'B' },
    { '7', '8', '9', 'C' },
    { '*', '0', '#', 'D' }
};

#define KEY_QUEUE_SIZE 16
static char s_key_queue[KEY_QUEUE_SIZE];
static uint8_t s_head = 0;
static uint8_t s_tail = 0;
static char s_last_key = '\0';

void keypad_init(void) {
    s_head = 0;
    s_tail = 0;
    s_last_key = '\0';
}

static void enqueue_key(char k) {
    uint8_t next = (s_head + 1) % KEY_QUEUE_SIZE;
    if (next != s_tail) {
        s_key_queue[s_head] = k;
        s_head = next;
    }
}

char keypad_scan(void) {
    // In real hardware, sets rows HIGH sequentially and reads columns
    return '\0';
}

bool keypad_has_key(void) {
    return s_head != s_tail;
}

char keypad_pop_key(void) {
    if (s_head == s_tail) return '\0';
    char k = s_key_queue[s_tail];
    s_tail = (s_tail + 1) % KEY_QUEUE_SIZE;
    return k;
}
