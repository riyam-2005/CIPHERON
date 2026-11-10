#include "se050.h"
#include <string.h>
#include <stdlib.h>

static se050_status_t s_se050 = {
    .initialized = false,
    .i2c_address = 0x48,
    .applet_version = 0x030100, // Version 3.1.0
    .fips_active = true,
    .nvram_free_bytes = 48500
};

// Simulated NVRAM slots for PQC trust anchors
static struct {
    uint32_t id;
    uint8_t data[256];
    uint16_t len;
    bool occupied;
} s_nvram_slots[4];

bool se050_init(void) {
    s_se050.initialized = true;
    s_se050.fips_active = true;
    
    // Initialize default trust anchor slot 0 (Root CA Dilithium3 Fingerprint)
    s_nvram_slots[0].id = 0x7FFF0001;
    const char* default_anchor = "CIPHERON_ROOT_PQC_DILITHIUM3_TRUST_ANCHOR_v4";
    s_nvram_slots[0].len = (uint16_t)strlen(default_anchor);
    memcpy(s_nvram_slots[0].data, default_anchor, s_nvram_slots[0].len);
    s_nvram_slots[0].occupied = true;

    return true;
}

bool se050_get_status(se050_status_t* status) {
    if (!status || !s_se050.initialized) return false;
    memcpy(status, &s_se050, sizeof(se050_status_t));
    return true;
}

bool se050_read_pqc_trust_anchor(uint32_t key_id, uint8_t* out_buffer, uint16_t max_len, uint16_t* out_len) {
    if (!s_se050.initialized || !out_buffer || !out_len) return false;

    for (int i = 0; i < 4; i++) {
        if (s_nvram_slots[i].occupied && s_nvram_slots[i].id == key_id) {
            uint16_t copy_len = s_nvram_slots[i].len > max_len ? max_len : s_nvram_slots[i].len;
            memcpy(out_buffer, s_nvram_slots[i].data, copy_len);
            *out_len = copy_len;
            return true;
        }
    }
    return false;
}

bool se050_write_pqc_trust_anchor(uint32_t key_id, const uint8_t* data, uint16_t data_len) {
    if (!s_se050.initialized || !data || data_len > sizeof(s_nvram_slots[0].data)) return false;

    // Check if key exists or find free slot
    int target_slot = -1;
    for (int i = 0; i < 4; i++) {
        if (s_nvram_slots[i].occupied && s_nvram_slots[i].id == key_id) {
            target_slot = i;
            break;
        }
        if (!s_nvram_slots[i].occupied && target_slot == -1) {
            target_slot = i;
        }
    }

    if (target_slot == -1) return false;

    s_nvram_slots[target_slot].id = key_id;
    memcpy(s_nvram_slots[target_slot].data, data, data_len);
    s_nvram_slots[target_slot].len = data_len;
    s_nvram_slots[target_slot].occupied = true;
    return true;
}

bool se050_get_random(uint8_t* buffer, uint16_t len) {
    if (!s_se050.initialized || !buffer) return false;
    for (uint16_t i = 0; i < len; i++) {
        buffer[i] = (uint8_t)(rand() & 0xFF);
    }
    return true;
}
