#ifndef HW_DECODER_H
#define HW_DECODER_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

bool hw_decode_hex(const char *hex_in, uint8_t *bin_out, size_t *out_len, size_t max_out);
bool hw_decode_base64(const char *b64_in, uint8_t *bin_out, size_t *out_len, size_t max_out);

#endif // HW_DECODER_H
