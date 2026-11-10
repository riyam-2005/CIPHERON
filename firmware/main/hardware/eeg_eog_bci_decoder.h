/**
 * @file eeg_eog_bci_decoder.h
 * @brief Multi-Modal EEG/EOG Hybrid Brain-Computer Interface & Neural Intent Decoder Interface
 * CIPHERON-X1 V22.0.0-BIO-CYBERNETIC COGNITIVE INTERFACE & NEURAL INTENT CRYPTANALYSIS
 * Directly adhering to suggestion-v21.md Sections 1.1, 2.1, 3.1, 4.1 & 5.1
 */

#ifndef EEG_EOG_BCI_DECODER_H
#define EEG_EOG_BCI_DECODER_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

#define EEG_CHANNEL_P300 0   // ADC1_CHANNEL_0 / GPIO 36 (Pz electrode)
#define EOG_CHANNEL_HORIZ 3  // ADC1_CHANNEL_3 / GPIO 39 (Horizontal EOG)

typedef struct {
    float p300_amplitude_uv;
    bool intent_detected;
    int gaze_direction;      // -1: Left, 0: Center, +1: Right
    float alpha_power_uv2;
    float beta_power_uv2;
    float gamma_power_uv2;
    float cognitive_entropy_bits;
    uint32_t timestamp_us;
} BCIState;

typedef struct {
    float amplifier_gain;             // 5000x instrumentation amplifier
    float filter_low_cutoff_hz;       // 0.5 Hz high-pass
    float filter_high_cutoff_hz;      // 45.0 Hz low-pass
    float sampling_rate_hz;           // 250 Hz sampling
    uint32_t total_p300_events;
    uint32_t total_bci_frames;
    float baseline_noise_uv;
} bci_telemetry_t;

typedef struct {
    uint8_t master_cognitive_key[32]; // 256-bit K_cognitive
    char zk_bci_commitment[65];
    bool key_valid;
    float erp_peak_uv;
    float spectral_entropy;
} cognitive_key_t;

typedef struct {
    bool initialized;
    bool armed;
    bool zeroized;
    float zeroization_latency_us;
    BCIState current_state;
    bci_telemetry_t telemetry;
} bci_system_status_t;

/**
 * @brief Initializes hybrid EEG/EOG high-gain ADC pipeline and BCI state.
 */
void init_hybrid_bci_hardware(void);

/**
 * @brief Processes single BCI frame from hardware ADC registers.
 */
BCIState process_bci_frame(void);

/**
 * @brief Processes raw ADC inputs into calibrated microvolts, ERP detection, and gaze direction.
 */
bool process_bci_raw_inputs(int raw_eeg, int raw_eog, BCIState* out_state);

/**
 * @brief Derives 256-bit Cognitive Master Key K_cognitive = HKDF(Salt_P300 || H_neural || V_EOG).
 */
bool derive_cognitive_master_key(const float* eeg_window, size_t window_len, int gaze_dir, cognitive_key_t* out_key);

/**
 * @brief Verifies zero-knowledge zk-BCI cognitive familiarity proof.
 */
bool verify_zk_bci_proof(const cognitive_key_t* key, const char* expected_commitment);

/**
 * @brief Triggers emergency zeroization of neural circular buffers and master keys (<2µs SLA).
 */
bool bci_trigger_emergency_zeroization(void);

/**
 * @brief Reads aggregated status and telemetry of the BCI cognitive system.
 */
void bci_get_status(bci_system_status_t* out_status);

/**
 * @brief Resets BCI subsystem for unit testing.
 */
void reset_bci_for_test(void);

#ifdef __cplusplus
}
#endif

#endif // EEG_EOG_BCI_DECODER_H
