/**
 * @file neuromorphic_snn.c
 * @brief Neuromorphic Spiking Neural Network (SNN) Event Engine
 * CIPHERON-X1 V6.0-NEURAL-QUANTUM SILICON FABRIC
 * Adhering to suggestion-v5.md Section 2 and 6.1
 */

#include "neuromorphic_snn.h"
#include <string.h>
#include <math.h>

static lif_neuron_t s_snn_layer[SNN_NUM_LIF_NEURONS];
static bool s_initialized = false;

void init_neuromorphic_snn(void) {
    for (int i = 0; i < SNN_NUM_LIF_NEURONS; i++) {
        s_snn_layer[i].membrane_potential = 0.0f;
        s_snn_layer[i].spike_count = 0;
        for (int j = 0; j < SNN_NUM_INPUT_NEURONS; j++) {
            // Deterministic calibrated synaptic weights (0.08 to 0.33)
            float val = 0.08f + (float)((i * 37 + j * 19) % 250) / 1000.0f;
            s_snn_layer[i].weights[j] = val;
        }
    }
    s_initialized = true;
}

void process_snn_byte_event(const uint8_t* byte_stream, size_t len) {
    if (!s_initialized) {
        init_neuromorphic_snn();
    }
    if (!byte_stream || len == 0) return;

    for (size_t t = 0; t < len; t++) {
        uint8_t input_val = byte_stream[t];

        for (int i = 0; i < SNN_NUM_LIF_NEURONS; i++) {
            // 1. Decay membrane potential
            s_snn_layer[i].membrane_potential *= SNN_V_DECAY;

            // 2. Integrate incoming input spike
            s_snn_layer[i].membrane_potential += s_snn_layer[i].weights[input_val];

            // 3. Fire & Soft Reset when reaching threshold
            if (s_snn_layer[i].membrane_potential >= SNN_V_THRESHOLD) {
                s_snn_layer[i].spike_count++;
                s_snn_layer[i].membrane_potential -= SNN_V_THRESHOLD;
            }
        }
    }
}

uint32_t neuromorphic_snn_get_spike_count(int neuron_idx) {
    if (neuron_idx < 0 || neuron_idx >= SNN_NUM_LIF_NEURONS) return 0;
    return s_snn_layer[neuron_idx].spike_count;
}

float neuromorphic_snn_get_membrane_potential(int neuron_idx) {
    if (neuron_idx < 0 || neuron_idx >= SNN_NUM_LIF_NEURONS) return 0.0f;
    return s_snn_layer[neuron_idx].membrane_potential;
}

float neuromorphic_snn_estimate_entropy(void) {
    uint32_t total_spikes = 0;
    for (int i = 0; i < SNN_NUM_LIF_NEURONS; i++) {
        total_spikes += s_snn_layer[i].spike_count;
    }
    if (total_spikes == 0) return 0.0f;

    // Calculate spike distribution entropy across 32 neurons
    float entropy = 0.0f;
    for (int i = 0; i < SNN_NUM_LIF_NEURONS; i++) {
        if (s_snn_layer[i].spike_count > 0) {
            float p = (float)s_snn_layer[i].spike_count / (float)total_spikes;
            entropy -= p * (logf(p) / logf(2.0f));
        }
    }
    // Scale log2(32) = 5 bits to standard byte Shannon scale (0..8)
    float scaled = (entropy / 5.0f) * 8.0f;
    return scaled > 8.0f ? 8.0f : scaled;
}

void neuromorphic_snn_reset(void) {
    for (int i = 0; i < SNN_NUM_LIF_NEURONS; i++) {
        s_snn_layer[i].membrane_potential = 0.0f;
        s_snn_layer[i].spike_count = 0;
    }
}
