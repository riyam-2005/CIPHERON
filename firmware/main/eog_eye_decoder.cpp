/**
 * @file eog_eye_decoder.cpp
 * @brief ESP32-S3 C++ EOG Signal Decoder Driver
 * CIPHERON-X1 V21.0.0-OCULAR & EYE-GAZE CODING/DECODING SYSTEM
 * Directly adhering to suggestion-v20.md Section 5.1
 */

#include <stdio.h>
#include <math.h>

#ifdef ESP_PLATFORM
#include "esp_log.h"
#include "driver/adc.h"
#include "esp_attr.h"
#else
#define IRAM_ATTR
#define ESP_LOGI(tag, fmt, ...) printf("[%s] " fmt "\n", tag, ##__VA_ARGS__)
#define ESP_LOGD(tag, fmt, ...) printf("[%s] DEBUG: " fmt "\n", tag, ##__VA_ARGS__)
#define ESP_LOGE(tag, fmt, ...) printf("[%s] ERROR: " fmt "\n", tag, ##__VA_ARGS__)
#define ADC_WIDTH_BIT_12 3
#define ADC_ATTEN_DB_11  3
#define ADC1_CHANNEL_0   0
#define ADC1_CHANNEL_3   3
static inline void adc1_config_width(int w) { (void)w; }
static inline void adc1_config_channel_atten(int c, int a) { (void)c; (void)a; }
static inline int adc1_get_raw(int c) { (void)c; return 2048; }
#endif

static const char* TAG = "EOG_DECODER";

#define EOG_ADC_CHANNEL_H ADC1_CHANNEL_0 // GPIO 36
#define EOG_ADC_CHANNEL_V ADC1_CHANNEL_3 // GPIO 39

typedef enum {
    GAZE_CENTER = 0,
    GAZE_LEFT,
    GAZE_RIGHT,
    GAZE_UP,
    GAZE_DOWN
} GazeDirectionCpp;

void init_eog_hardware_cpp() {
    ESP_LOGI(TAG, "Initializing Bi-Channel EOG Differential ADC Pipeline...");
    adc1_config_width(ADC_WIDTH_BIT_12);
    adc1_config_channel_atten(EOG_ADC_CHANNEL_H, ADC_ATTEN_DB_11);
    adc1_config_channel_atten(EOG_ADC_CHANNEL_V, ADC_ATTEN_DB_11);
    ESP_LOGI(TAG, "EOG Hardware Pipeline Armed.");
}

GazeDirectionCpp IRAM_ATTR read_eog_gaze_direction_cpp() {
    int raw_h = adc1_get_raw(EOG_ADC_CHANNEL_H) - 2048;
    int raw_v = adc1_get_raw(EOG_ADC_CHANNEL_V) - 2048;

    if (raw_h > 800) return GAZE_RIGHT;
    if (raw_h < -800) return GAZE_LEFT;
    if (raw_v > 800) return GAZE_UP;
    if (raw_v < -800) return GAZE_DOWN;
    return GAZE_CENTER;
}
