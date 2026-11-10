#ifndef ATECC608A_H
#define ATECC608A_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

// Microchip ATECC608A Hardware Provisioning Slots (suggestion-v2.md Section 3.2)
#define ATECC608A_SLOT_ECC_P256     0  // ECC P-256 Private Key (Internal Exec Only)
#define ATECC608A_SLOT_AES_128       1  // AES-128 Symmetric Master Key (Encrypted Read / Write Locked)
#define ATECC608A_SLOT_HMAC_SHA     2  // HMAC SHA-256 Key (Slot Locked)
#define ATECC608A_SLOT_DEVICE_CERT   8  // Device X.509 Certificate (Publicly Readable)

typedef struct {
    bool device_locked;
    uint8_t serial_number[9];
    uint32_t signature_counter;
    uint16_t locked_slots_mask; // Bitmask of locked hardware slots
} atecc608a_info_t;

void atecc608a_init(void);
bool atecc608a_generate_random(uint8_t *random_out, size_t len);
bool atecc608a_sign_digest_p256(const uint8_t digest[32], uint8_t signature_r_s[64]);
bool atecc608a_verify_p256(const uint8_t digest[32], const uint8_t signature[64], const uint8_t pubkey[64]);
bool atecc608a_slot_is_locked(uint8_t slot_id);
bool atecc608a_read_cert_slot8(uint8_t *cert_out, size_t *len_out);
bool atecc608a_hmac_slot2(const uint8_t *msg, size_t msg_len, uint8_t hmac_out[32]);
bool atecc608a_aes128_encrypt_slot1(const uint8_t plaintext[16], uint8_t ciphertext[16]);
const atecc608a_info_t* atecc608a_get_info(void);

#endif // ATECC608A_H

