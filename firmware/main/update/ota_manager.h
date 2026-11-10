#ifndef OTA_MANAGER_H
#define OTA_MANAGER_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

void ota_init(void);
bool ota_verify_image_signature(const uint8_t *image_data, size_t image_len, const uint8_t *signature, size_t sig_len);
bool ota_start_update(void);
bool ota_write_chunk(const uint8_t *chunk, size_t chunk_len);
bool ota_complete(void);

#endif // OTA_MANAGER_H
