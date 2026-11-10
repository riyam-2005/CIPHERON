#ifndef ENCRYPTED_NVS_H
#define ENCRYPTED_NVS_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

void nvs_storage_init(void);
bool nvs_storage_write(const char *key, const uint8_t *data, size_t len);
bool nvs_storage_read(const char *key, uint8_t *data, size_t *len, size_t max_len);
void nvs_storage_erase_all(void);

#endif // ENCRYPTED_NVS_H
