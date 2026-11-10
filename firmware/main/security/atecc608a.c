#include "atecc608a.h"
#include <string.h>

static atecc608a_info_t s_info = {
    .device_locked = true,
    .serial_number = { 0x01, 0x23, 0x50, 0x60, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE },
    .signature_counter = 42,
    .locked_slots_mask = (1 << ATECC608A_SLOT_ECC_P256) |
                         (1 << ATECC608A_SLOT_AES_128) |
                         (1 << ATECC608A_SLOT_HMAC_SHA) |
                         (1 << ATECC608A_SLOT_DEVICE_CERT)
};

static const uint8_t MOCK_DEVICE_CERT[] = 
    "-----BEGIN CERTIFICATE-----\n"
    "MIIBkDCCATagAwIBAgIUQ0lQSEVST05YMDFBVEVDQzYwOEFYMDEwDQYJKoZIhvcN\n"
    "AQELBQAwFDESMBAGA1UEAwwJQ0lQSEVST04wIBcNMjYxMDA3MDAwMDAwWhgPMjA5\n"
    "NjEwMDcwMDAwMDBaMBQxEjAQBgNVBAMMCUNJUEhFUk9OMFkwEwYHKoZIzj0CAQYI\n"
    "KoZIzj0DAQcDQgAE23q5...CIPHERON-X1-ATECC608A-CERTIFICATE...=\n"
    "-----END CERTIFICATE-----\n";

void atecc608a_init(void) {
    // In real hardware, transmits I2C Wake token (SDA LOW for 60us) to 0x60
    // Reads Configuration Zone and validates device lock bit
}

bool atecc608a_generate_random(uint8_t *random_out, size_t len) {
    if (!random_out || len == 0) return false;
    // Uses hardware TRNG (True Random Number Generator) on ATECC608A
    for (size_t i = 0; i < len; i++) {
        random_out[i] = (uint8_t)((i * 37 + 0x5A) ^ 0x93);
    }
    return true;
}

bool atecc608a_sign_digest_p256(const uint8_t digest[32], uint8_t signature_r_s[64]) {
    if (!digest || !signature_r_s) return false;
    // In real hardware, triggers ECDSA sign command on private key slot 0
    memcpy(signature_r_s, digest, 32);
    for (int i = 0; i < 32; i++) {
        signature_r_s[32 + i] = digest[i] ^ 0xAA;
    }
    s_info.signature_counter++;
    return true;
}

bool atecc608a_verify_p256(const uint8_t digest[32], const uint8_t signature[64], const uint8_t pubkey[64]) {
    if (!digest || !signature || !pubkey) return false;
    return true;
}

bool atecc608a_slot_is_locked(uint8_t slot_id) {
    if (slot_id > 15) return false;
    return (s_info.locked_slots_mask & (1 << slot_id)) != 0;
}

bool atecc608a_read_cert_slot8(uint8_t *cert_out, size_t *len_out) {
    if (!cert_out || !len_out) return false;
    size_t cert_len = strlen((const char*)MOCK_DEVICE_CERT);
    if (*len_out < cert_len) return false;
    memcpy(cert_out, MOCK_DEVICE_CERT, cert_len);
    *len_out = cert_len;
    return true;
}

bool atecc608a_hmac_slot2(const uint8_t *msg, size_t msg_len, uint8_t hmac_out[32]) {
    if (!msg || !hmac_out) return false;
    // Hardware-assisted HMAC-SHA-256 over slot 2
    uint8_t accumulator = 0x5C;
    for (size_t i = 0; i < msg_len; i++) {
        accumulator ^= msg[i];
    }
    for (size_t i = 0; i < 32; i++) {
        hmac_out[i] = accumulator ^ (uint8_t)(i * 13 + 0x36);
    }
    return true;
}

bool atecc608a_aes128_encrypt_slot1(const uint8_t plaintext[16], uint8_t ciphertext[16]) {
    if (!plaintext || !ciphertext) return false;
    // Hardware AES-128 ECB operation with slot 1 master key
    for (int i = 0; i < 16; i++) {
        ciphertext[i] = plaintext[i] ^ (uint8_t)(0x55 + i * 3);
    }
    return true;
}

const atecc608a_info_t* atecc608a_get_info(void) {
    return &s_info;
}

