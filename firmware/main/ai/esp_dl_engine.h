#ifndef ESP_DL_ENGINE_H
#define ESP_DL_ENGINE_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

// CIPHERON-X1 On-Device 8-Bit Quantized 1D-CNN Cipher Classifier
// ESP-DL Vector-Accelerated Inference on Xtensa LX7 S3 DSP Cores (Section 4.1)

#define CNN_INPUT_LEN       256
#define CNN_NUM_CLASSES     12

typedef enum {
    CIPHER_CLASS_PLAINTEXT = 0,
    CIPHER_CLASS_BASE64    = 1,
    CIPHER_CLASS_HEX       = 2,
    CIPHER_CLASS_CAESAR    = 3,
    CIPHER_CLASS_VIGENERE  = 4,
    CIPHER_CLASS_XOR       = 5,
    CIPHER_CLASS_HASH      = 6,
    CIPHER_CLASS_AES       = 7,
    CIPHER_CLASS_JWT       = 8,
    CIPHER_CLASS_PROTOBUF  = 9,
    CIPHER_CLASS_CODE      = 10,
    CIPHER_CLASS_UNKNOWN   = 11
} cipher_class_id_t;

typedef struct {
    cipher_class_id_t predicted_class;
    const char* class_name;
    float confidence;
    float probabilities[CNN_NUM_CLASSES];
    uint32_t inference_cycles;
    float latency_ms;
} esp_dl_inference_result_t;

// Initialize ESP-DL model weights and tensor arena
bool esp_dl_engine_init(void);

// Run 1D-CNN vector inference on 256-byte input buffer
bool esp_dl_classify_payload(const uint8_t* input_data, size_t len, esp_dl_inference_result_t* result);

// Get string name of cipher class ID
const char* esp_dl_get_class_name(cipher_class_id_t class_id);

#ifdef __cplusplus
}
#endif

#endif // ESP_DL_ENGINE_H
