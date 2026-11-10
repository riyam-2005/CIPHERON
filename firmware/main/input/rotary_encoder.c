#include "rotary_encoder.h"
#include <string.h>

static rotary_encoder_state_t s_encoder_state;
static uint8_t s_last_encoded = 0;

// State transition table for 2-bit quadrature decoding:
// (last_encoded << 2) | current_encoded
// 1 = CW step, -1 = CCW step, 0 = invalid or no movement
static const int8_t QUADRATURE_LOOKUP[16] = {
     0,  1, -1,  0,   // 00 -> 00, 01, 10, 11
    -1,  0,  0,  1,   // 01 -> 00, 01, 10, 11
     1,  0,  0, -1,   // 10 -> 00, 01, 10, 11
     0, -1,  1,  0    // 11 -> 00, 01, 10, 11
};


void rotary_encoder_init(void) {
    memset(&s_encoder_state, 0, sizeof(s_encoder_state));
    s_last_encoded = 0;
}

void rotary_encoder_process_quadrature(uint8_t a_level, uint8_t b_level) {
    uint8_t current = ((a_level & 0x01) << 1) | (b_level & 0x01);
    uint8_t index = (s_last_encoded << 2) | current;
    int8_t step = QUADRATURE_LOOKUP[index & 0x0F];

    if (step > 0) {
        s_encoder_state.position++;
        s_encoder_state.last_direction = ENCODER_DIR_CW;
        s_encoder_state.total_rotations++;
    } else if (step < 0) {
        s_encoder_state.position--;
        s_encoder_state.last_direction = ENCODER_DIR_CCW;
        s_encoder_state.total_rotations++;
    }

    s_last_encoded = current;
}

void rotary_encoder_set_button(bool pressed) {
    s_encoder_state.button_pressed = pressed;
}

rotary_encoder_state_t rotary_encoder_get_state(void) {
    return s_encoder_state;
}

void rotary_encoder_reset_position(void) {
    s_encoder_state.position = 0;
    s_encoder_state.last_direction = ENCODER_DIR_NONE;
}
