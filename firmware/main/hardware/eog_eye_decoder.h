/**
 * @file eog_eye_decoder.h
 * @brief Electrooculography (EOG) Biosignal Processing, Saccade Decoding & Ocular Key Derivation Interface
 * CIPHERON-X1 V21.0.0-OCULAR & EYE-GAZE CODING/DECODING SYSTEM
 * Directly adhering to suggestion-v20.md Sections 1.1, 2.1, 3.1, 4.1 & 5.1
 */

#ifndef EOG_EYE_DECODER_H
#define EOG_EYE_DECODER_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

#define EOG_ADC_CHANNEL_H 0 // ADC1_CHANNEL_0 / GPIO 36
#define EOG_ADC_CHANNEL_V 3 // ADC1_CHANNEL_3 / GPIO 39

typedef enum {
    GAZE_CENTER = 0,
    GAZE_LEFT,
    GAZE_RIGHT,
    GAZE_UP,
    GAZE_DOWN
} GazeDirection;

typedef struct {
    int16_t raw_h;
    int16_t raw_v;
    float v_horizontal_mv;
    float v_vertical_mv;
    GazeDirection direction;
    uint32_t timestamp_us;
} eog_sample_t;

typedef struct {
    float v_corneo_retinal_potential_mv; // Corneo-retinal standing potential (0.4 to 1.0 mV)
    float amplifier_gain;                 // Instrumentation amp gain (1000x)
    float filter_low_cutoff_hz;           // Bandpass low cutoff (0.1 Hz)
    float filter_high_cutoff_hz;          // Bandpass high cutoff (30.0 Hz)
    float sampling_rate_hz;               // Sampling rate (120 Hz)
    uint32_t total_saccades_classified;
    uint32_t total_bytes_decoded;
    float last_pupil_entropy_bits;        // Index of Cognitive Activity (ICA) entropy (typ. >7.8 bits/byte)
} eog_telemetry_t;

typedef struct {
    uint8_t master_key[32];               // 256-bit Ocular Biometric Master Key
    float pupil_entropy_bits;
    float gaze_transition_entropy;
    bool key_valid;
} ocular_key_derivation_t;

typedef struct {
    bool initialized;
    bool armed;
    bool zeroized;
    float zeroization_latency_us;
    eog_telemetry_t telemetry;
} eog_status_t;

/**
 * @brief Initialize Bi-Channel EOG Differential ADC Pipeline and filters.
 */
void init_eog_hardware(void);

/**
 * @brief Reads current EOG gaze direction from ADC hardware (or simulated register).
 * @return GazeDirection enum
 */
GazeDirection read_eog_gaze_direction(void);

/**
 * @brief Ingests raw EOG ADC values and produces calibrated differential voltage and direction.
 */
bool eog_process_adc_pair(int raw_h, int raw_v, eog_sample_t* out_sample);

/**
 * @brief Encodes saccade direction sequence into packed binary stream.
 * Mapping: LEFT=00, RIGHT=01, UP=10, DOWN=11 (CENTER skipped as neutral baseline)
 */
size_t eog_encode_saccades_to_bytes(const GazeDirection* directions, size_t count, uint8_t* out_bytes, size_t max_bytes);

/**
 * @brief Decodes packed binary stream into saccade direction sequence.
 */
size_t eog_decode_bytes_to_saccades(const uint8_t* bytes, size_t byte_count, GazeDirection* out_directions, size_t max_directions);

/**
 * @brief Derives 256-bit bi-factorial ocular master key K_ocular = HKDF(EOG || delta_R_pupil).
 */
bool derive_ocular_biometric_key(const uint8_t* eog_bytes, size_t eog_len, float pupil_delta_r, ocular_key_derivation_t* out_key);

/**
 * @brief Triggers immediate ocular security zeroization on intrusion or biosignal spoofing.
 */
bool eog_trigger_tamper_zeroization(void);

/**
 * @brief Reads full telemetry and status of the EOG ocular subsystem.
 */
void eog_get_status(eog_status_t* out_status);

#ifdef __cplusplus
}
#endif

#endif // EOG_EYE_DECODER_H
