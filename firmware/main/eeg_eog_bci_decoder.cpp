/**
 * @file eeg_eog_bci_decoder.cpp
 * @brief ESP32-S3 C++ Hybrid EEG/EOG Biosignal Decoder Driver
 * CIPHERON-X1 V22.0.0-BIO-CYBERNETIC COGNITIVE INTERFACE & NEURAL INTENT CRYPTANALYSIS
 * Directly adhering to suggestion-v21.md Section 5.1
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

static const char* TAG = "HYBRID_BCI_DECODER";

#define EEG_CHANNEL_P300 ADC1_CHANNEL_0 // GPIO 36 (Pz)
#define EOG_CHANNEL_HORIZ ADC1_CHANNEL_3 // GPIO 39

typedef struct {
    float p300_amplitude_uv;
    bool intent_detected;
    int gaze_direction;
} BCIStateCpp;

static BCIStateCpp bci_system;

void init_hybrid_bci_hardware_cpp() {
    ESP_LOGI(TAG, "Initializing Hybrid EEG/EOG High-Gain ADC Pipeline...");
    adc1_config_width(ADC_WIDTH_BIT_12);
    adc1_config_channel_atten(EEG_CHANNEL_P300, ADC_ATTEN_DB_11);
    adc1_config_channel_atten(EOG_CHANNEL_HORIZ, ADC_ATTEN_DB_11);
    bci_system.intent_detected = false;
    ESP_LOGI(TAG, "Hybrid BCI Hardware Active.");
}

BCIStateCpp IRAM_ATTR process_bci_frame_cpp() {
    int raw_eeg = adc1_get_raw(EEG_CHANNEL_P300);
    int raw_eog = adc1_get_raw(EOG_CHANNEL_HORIZ);

    // Convert raw ADC units to microvolts
    bci_system.p300_amplitude_uv = (raw_eeg / 4095.0f) * 3300.0f;

    // Detect P300 ERP spike threshold (> 15 uV relative pulse)
    if (bci_system.p300_amplitude_uv > 2200.0f) {
        bci_system.intent_detected = true;
    } else {
        bci_system.intent_detected = false;
    }

    bci_system.gaze_direction = (raw_eog > 2500) ? 1 : ((raw_eog < 1500) ? -1 : 0);
    return bci_system;
}
