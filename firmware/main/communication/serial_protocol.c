#include "serial_protocol.h"
#include <string.h>

typedef enum {
    PARSE_WAIT_MAGIC_HI = 0,
    PARSE_WAIT_MAGIC_LO,
    PARSE_TYPE,
    PARSE_LEN_HI,
    PARSE_LEN_LO,
    PARSE_PAYLOAD,
    PARSE_CRC_HI,
    PARSE_CRC_LO
} parse_state_t;

static parse_state_t s_state = PARSE_WAIT_MAGIC_HI;
static serial_packet_t s_current_pkt;
static uint16_t s_bytes_read = 0;

static uint16_t calc_checksum(const uint8_t *data, size_t len) {
    uint16_t sum = 0;
    for (size_t i = 0; i < len; i++) {
        sum += data[i];
    }
    return sum;
}

void protocol_init(void) {
    s_state = PARSE_WAIT_MAGIC_HI;
    s_bytes_read = 0;
    memset(&s_current_pkt, 0, sizeof(s_current_pkt));
}

size_t protocol_frame_packet(packet_type_t type, const uint8_t *payload, uint16_t len, uint8_t *out_buf, size_t max_out) {
    if (len > 256 || max_out < (size_t)(len + 7)) return 0;
    
    out_buf[0] = PROTOCOL_MAGIC_HI;
    out_buf[1] = PROTOCOL_MAGIC_LO;
    out_buf[2] = (uint8_t)type;
    out_buf[3] = (uint8_t)(len >> 8);
    out_buf[4] = (uint8_t)(len & 0xFF);
    
    if (payload && len > 0) {
        memcpy(&out_buf[5], payload, len);
    }
    
    uint16_t crc = calc_checksum(payload, len);
    out_buf[5 + len] = (uint8_t)(crc >> 8);
    out_buf[6 + len] = (uint8_t)(crc & 0xFF);
    
    return len + 7;
}

bool protocol_parse_byte(uint8_t b, serial_packet_t *out_pkt) {
    switch (s_state) {
        case PARSE_WAIT_MAGIC_HI:
            if (b == PROTOCOL_MAGIC_HI) s_state = PARSE_WAIT_MAGIC_LO;
            break;
            
        case PARSE_WAIT_MAGIC_LO:
            if (b == PROTOCOL_MAGIC_LO) s_state = PARSE_TYPE;
            else s_state = PARSE_WAIT_MAGIC_HI;
            break;
            
        case PARSE_TYPE:
            s_current_pkt.type = (packet_type_t)b;
            s_state = PARSE_LEN_HI;
            break;
            
        case PARSE_LEN_HI:
            s_current_pkt.length = (uint16_t)(b << 8);
            s_state = PARSE_LEN_LO;
            break;
            
        case PARSE_LEN_LO:
            s_current_pkt.length |= b;
            s_bytes_read = 0;
            if (s_current_pkt.length > 256) {
                s_state = PARSE_WAIT_MAGIC_HI; // Reset invalid packet
            } else if (s_current_pkt.length == 0) {
                s_state = PARSE_CRC_HI;
            } else {
                s_state = PARSE_PAYLOAD;
            }
            break;
            
        case PARSE_PAYLOAD:
            s_current_pkt.payload[s_bytes_read++] = b;
            if (s_bytes_read >= s_current_pkt.length) {
                s_state = PARSE_CRC_HI;
            }
            break;
            
        case PARSE_CRC_HI:
            s_current_pkt.checksum = (uint16_t)(b << 8);
            s_state = PARSE_CRC_LO;
            break;
            
        case PARSE_CRC_LO:
            s_current_pkt.checksum |= b;
            s_state = PARSE_WAIT_MAGIC_HI;
            // Verify checksum
            uint16_t expected = calc_checksum(s_current_pkt.payload, s_current_pkt.length);
            if (expected == s_current_pkt.checksum) {
                if (out_pkt) *out_pkt = s_current_pkt;
                return true;
            }
            break;
    }
    return false;
}
