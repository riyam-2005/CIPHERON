#ifndef SERIAL_PROTOCOL_H
#define SERIAL_PROTOCOL_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#define PROTOCOL_MAGIC_HI  0xAA
#define PROTOCOL_MAGIC_LO  0x55

typedef enum {
    PKT_CHALLENGE        = 0x01,
    PKT_CHALLENGE_RESP   = 0x02,
    PKT_KEYPAD_EVENT     = 0x03,
    PKT_BUTTON_EVENT     = 0x04,
    PKT_OLED_UPDATE      = 0x05,
    PKT_PANIC_TRIGGER    = 0x06,
    PKT_HEARTBEAT        = 0x07
} packet_type_t;

typedef struct {
    packet_type_t type;
    uint16_t length;
    uint8_t payload[256];
    uint16_t checksum;
} serial_packet_t;

void protocol_init(void);
size_t protocol_frame_packet(packet_type_t type, const uint8_t *payload, uint16_t len, uint8_t *out_buf, size_t max_out);
bool protocol_parse_byte(uint8_t byte, serial_packet_t *out_pkt);

#endif // SERIAL_PROTOCOL_H
