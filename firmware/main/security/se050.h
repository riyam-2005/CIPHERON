#ifndef SE050_H
#define SE050_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

// NXP SE050 Secure Element Driver (I2C 0x48)
// FIPS 140-3 Level 3 Cryptographic Anchor for RSA-4096, Brainpool & Post-Quantum NVRAM

typedef struct {
    bool initialized;
    uint8_t i2c_address;
    uint32_t applet_version;
    bool fips_active;
    uint32_t nvram_free_bytes;
} se050_status_t;

// Initialize NXP SE050 hardware interface
bool se050_init(void);

// Get device status
bool se050_get_status(se050_status_t* status);

// Read post-quantum trust anchor from tamper-proof NVRAM
bool se050_read_pqc_trust_anchor(uint32_t key_id, uint8_t* out_buffer, uint16_t max_len, uint16_t* out_len);

// Write post-quantum trust anchor to tamper-proof NVRAM
bool se050_write_pqc_trust_anchor(uint32_t key_id, const uint8_t* data, uint16_t data_len);

// Hardware TRNG via SE050
bool se050_get_random(uint8_t* buffer, uint16_t len);

#ifdef __cplusplus
}
#endif

#endif // SE050_H
