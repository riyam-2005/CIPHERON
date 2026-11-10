#ifndef EFPGA_SYNTHESIZER_H
#define EFPGA_SYNTHESIZER_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#define EFPGA_TOTAL_LUTS         64
#define EFPGA_RESERVE_LUTS       16
#define EFPGA_MAX_BITSTREAM_SZ   2048

typedef enum {
    LUT_HEALTHY = 0,
    LUT_DEGRADED = 1,
    LUT_FAULT_QUARANTINED = 2,
    LUT_RESERVE_ACTIVE = 3
} efpga_lut_state_t;

typedef struct {
    uint8_t lut_id;
    efpga_lut_state_t state;
    uint16_t configuration_word;
    uint8_t routed_input_pins;
    uint8_t routed_output_pin;
} efpga_lut_node_t;

typedef struct {
    bool initialized;
    uint32_t total_bitstreams_loaded;
    uint32_t active_luts_count;
    uint32_t quarantined_luts_count;
    uint32_t self_healing_events;
    float last_reconfig_latency_us;
    efpga_lut_node_t luts[EFPGA_TOTAL_LUTS];
} efpga_fabric_status_t;

/**
 * Initialize high-speed SPI configuration bus for on-board eFPGA micro-fabric.
 */
void init_efpga_interface(void);

/**
 * Load dynamic bitstream netlist into eFPGA fabric (<15us reconfiguration time).
 */
int load_efpga_bitstream(const uint8_t* bitstream, size_t length);

/**
 * Trigger dynamic silicon self-healing logic.
 * Isolates glitched or degraded LUTs and re-routes active signal lines to reserve LUTs.
 */
int efpga_self_heal_lut(uint8_t damaged_lut_id);

/**
 * Retrieve current eFPGA hardware fabric telemetry.
 */
void efpga_get_fabric_status(efpga_fabric_status_t* status);

/**
 * Reset all LUT allocations to baseline factory netlist.
 */
void efpga_reset_fabric(void);

#ifdef __cplusplus
}
#endif

#endif // EFPGA_SYNTHESIZER_H
