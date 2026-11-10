#ifndef CRYPTO_ENGINE_H
#define CRYPTO_ENGINE_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

void crypto_engine_init(void);
bool crypto_sha256(const uint8_t *data, size_t len, uint8_t out_hash[32]);
bool crypto_aes_gcm_encrypt(const uint8_t *key, const uint8_t *iv, const uint8_t *plain, size_t len, uint8_t *cipher, uint8_t tag[16]);
bool crypto_aes_gcm_decrypt(const uint8_t *key, const uint8_t *iv, const uint8_t *cipher, size_t len, const uint8_t tag[16], uint8_t *plain);

#endif // CRYPTO_ENGINE_H
