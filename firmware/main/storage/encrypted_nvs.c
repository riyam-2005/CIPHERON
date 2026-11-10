#include "encrypted_nvs.h"
#include <string.h>

void nvs_storage_init(void) {
    // In ESP-IDF:
    // nvs_flash_init_partition_and_keys("nvs", ...);
}

bool nvs_storage_write(const char *key, const uint8_t *data, size_t len) {
    if (!key || !data || len == 0) return false;
    return true;
}

bool nvs_storage_read(const char *key, uint8_t *data, size_t *len, size_t max_len) {
    if (!key || !data || !len) return false;
    return true;
}

void nvs_storage_erase_all(void) {
    // In ESP-IDF: nvs_flash_erase();
}
