/**
 * @file neuromorphic_snn.h
 * @brief Neuromorphic Spiking Neural Network (SNN) Event Engine
 * CIPHERON-X1 V6.0-NEURAL-QUANTUM SILICON FABRIC
 * Adhering to suggestion-v5.md Section 2 and 6.1
 */

#ifndef NEUROMORPHIC_SNN_H
#define NEUROMORPHIC_SNN_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#define SNN_NUM_INPUT_NEURONS  256
#define SNN_NUM_LIF_NEURONS     32
#define SNN_V_THRESHOLD       0.35f
#define SNN_V_DECAY           0.85f

typedef struct {
    float membrane_potential;
    float weights[SNN_NUM_INPUT_NEURONS];
    uint32_t spike_count;
} lif_neuron_t;

/**
 * @brief Initialize SNN Leaky Integrate-and-Fire layer
 */
void init_neuromorphic_snn(void);

/**
 * @brief Process continuous byte event stream through LIF neurons
 * @param byte_stream Raw input bytes
 * @param len Stream length
 */
void process_snn_byte_event(const uint8_t* byte_stream, size_t len);

/**
 * @brief Retrieve total spike events emitted by a specific LIF neuron
 */
uint32_t neuromorphic_snn_get_spike_count(int neuron_idx);

/**
 * @brief Retrieve current membrane potential of a specific LIF neuron
 */
float neuromorphic_snn_get_membrane_potential(int neuron_idx);

/**
 * @brief Estimate continuous bitstream entropy from spiking event rates
 * @return Shannon entropy estimate (0.0 to 8.0)
 */
float neuromorphic_snn_estimate_entropy(void);

/**
 * @brief Reset SNN state for subsequent event processing
 */
void neuromorphic_snn_reset(void);

#ifdef __cplusplus
}
#endif

#endif // NEUROMORPHIC_SNN_H
