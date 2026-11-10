#ifndef ROTARY_ENCODER_H
#define ROTARY_ENCODER_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    ENCODER_DIR_NONE = 0,
    ENCODER_DIR_CW   = 1,
    ENCODER_DIR_CCW  = -1
} encoder_direction_t;

typedef struct {
    int32_t position;
    encoder_direction_t last_direction;
    bool button_pressed;
    uint32_t total_rotations;
} rotary_encoder_state_t;

void rotary_encoder_init(void);
void rotary_encoder_process_quadrature(uint8_t a_level, uint8_t b_level);
void rotary_encoder_set_button(bool pressed);
rotary_encoder_state_t rotary_encoder_get_state(void);
void rotary_encoder_reset_position(void);

#ifdef __cplusplus
}
#endif

#endif // ROTARY_ENCODER_H
