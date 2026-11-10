#include "hw_decoder.h"
#include <string.h>

static int hex_char_to_val(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}

bool hw_decode_hex(const char *hex_in, uint8_t *bin_out, size_t *out_len, size_t max_out) {
    if (!hex_in || !bin_out || !out_len) return false;
    
    // Skip 0x if present
    if (hex_in[0] == '0' && (hex_in[1] == 'x' || hex_in[1] == 'X')) {
        hex_in += 2;
    }
    
    size_t in_len = strlen(hex_in);
    if (in_len % 2 != 0) return false;
    
    size_t expected_bytes = in_len / 2;
    if (expected_bytes > max_out) return false;
    
    for (size_t i = 0; i < expected_bytes; i++) {
        int hi = hex_char_to_val(hex_in[i * 2]);
        int lo = hex_char_to_val(hex_in[i * 2 + 1]);
        if (hi < 0 || lo < 0) return false;
        bin_out[i] = (uint8_t)((hi << 4) | lo);
    }
    
    *out_len = expected_bytes;
    return true;
}

static const int8_t B64_INDEX_TABLE[256] = {
    -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,62,-1,-1,-1,63,
    52,53,54,55,56,57,58,59,60,61,-1,-1,-1,-1,-1,-1,
    -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,
    15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,
    -1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,
    41,42,43,44,45,46,47,48,49,50,51,-1,-1,-1,-1,-1
};

bool hw_decode_base64(const char *b64_in, uint8_t *bin_out, size_t *out_len, size_t max_out) {
    if (!b64_in || !bin_out || !out_len) return false;
    
    size_t len = strlen(b64_in);
    if (len == 0 || len % 4 != 0) return false;
    
    size_t written = 0;
    for (size_t i = 0; i < len; i += 4) {
        int b0 = B64_INDEX_TABLE[(uint8_t)b64_in[i]];
        int b1 = B64_INDEX_TABLE[(uint8_t)b64_in[i + 1]];
        int b2 = (b64_in[i + 2] == '=') ? 0 : B64_INDEX_TABLE[(uint8_t)b64_in[i + 2]];
        int b3 = (b64_in[i + 3] == '=') ? 0 : B64_INDEX_TABLE[(uint8_t)b64_in[i + 3]];
        
        if (b0 < 0 || b1 < 0) return false;
        if (b64_in[i + 2] != '=' && b2 < 0) return false;
        if (b64_in[i + 3] != '=' && b3 < 0) return false;
        
        if (written >= max_out) return false;
        bin_out[written++] = (uint8_t)((b0 << 2) | (b1 >> 4));
        
        if (b64_in[i + 2] != '=') {
            if (written >= max_out) return false;
            bin_out[written++] = (uint8_t)(((b1 & 0x0F) << 4) | (b2 >> 2));
        }
        if (b64_in[i + 3] != '=') {
            if (written >= max_out) return false;
            bin_out[written++] = (uint8_t)(((b2 & 0x03) << 6) | b3);
        }
    }
    
    *out_len = written;
    return true;
}
