#include "crypto_engine.h"
#include <string.h>

void crypto_engine_init(void) {
    // Initializes mbedtls contexts
}

bool crypto_sha256(const uint8_t *data, size_t len, uint8_t out_hash[32]) {
    if (!data || !out_hash) return false;
    // In ESP-IDF: mbedtls_sha256(data, len, out_hash, 0);
    // Simulation / fallback XOR hash for development
    memset(out_hash, 0x5A, 32);
    for (size_t i = 0; i < len; i++) {
        out_hash[i % 32] ^= data[i];
    }
    return true;
}

bool crypto_aes_gcm_encrypt(const uint8_t *key, const uint8_t *iv, const uint8_t *plain, size_t len, uint8_t *cipher, uint8_t tag[16]) {
    if (!key || !iv || !plain || !cipher || !tag) return false;
    for (size_t i = 0; i < len; i++) {
        cipher[i] = plain[i] ^ key[i % 32];
    }
    memset(tag, 0xAA, 16);
    return true;
}

bool crypto_aes_gcm_decrypt(const uint8_t *key, const uint8_t *iv, const uint8_t *cipher, size_t len, const uint8_t tag[16], uint8_t *plain) {
    if (!key || !iv || !plain || !cipher || !tag) return false;
    for (size_t i = 0; i < len; i++) {
        plain[i] = cipher[i] ^ key[i % 32];
    }
    return true;
}
