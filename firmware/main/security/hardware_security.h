/**
 * @file hardware_security.h
 * @brief Silicon-Level Security, Fault Injection Defense & Hardware PUF
 * CIPHERON-X1 V5.0-AUTONOMOUS AGENTIC & GLOBAL FORENSIC GRID
 */

#ifndef HARDWARE_SECURITY_H
#define HARDWARE_SECURITY_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

#define PIN_OPTICAL_SENSOR     2
#define PIN_VOLTAGE_ALERT       3

#define VOLTAGE_LOW_THRESHOLD_MV   2950
#define VOLTAGE_HIGH_THRESHOLD_MV  3600
#define OPTICAL_THRESHOLD_LUX      500

#define SRAM_SCRAMBLE_PATTERN      0xDEADBEEF
#define SRAM_SCRAMBLE_WORDS        1024

typedef enum {
    FAULT_NONE = 0,
    FAULT_VOLTAGE_BROWNOUT,
    FAULT_VOLTAGE_SPIKE,
    FAULT_OPTICAL_LASER,
    FAULT_CLOCK_GLITCH
} silicon_fault_type_t;

/**
 * @brief Initialize silicon tamper detectors, comparators, and NMI handler
 */
void init_silicon_tamper_defenses(void);

/**
 * @brief Non-Maskable Interrupt (NMI) Handler for Emergency Zeroization (<1us)
 */
void emergency_key_zeroization_isr(void* arg);

/**
 * @brief Query if hardware has entered emergency zeroization state
 */
bool hardware_security_is_zeroized(void);

/**
 * @brief Retrieve measured emergency zeroization latency in nanoseconds (<1000 ns)
 */
uint32_t hardware_security_get_zeroization_latency_ns(void);

/**
 * @brief SRAM-based Physically Unclonable Function (PUF) challenge-response evaluation
 * @param challenge 16-byte challenge vector
 * @param response 16-byte output helper response
 * @return true if PUF response meets entropy and stability threshold
 */
bool hardware_security_verify_puf(const uint8_t challenge[16], uint8_t response[16]);

/**
 * @brief Voltage comparator and optical threshold verification
 * @param vdd_mv Measured rail voltage in millivolts
 * @param lux Measured ambient light in Lux
 * @return true if rails and optical sensor are within safe operational boundaries
 */
bool hardware_security_check_rails(uint32_t vdd_mv, uint32_t lux);

/**
 * @brief Simulate a silicon physical attack for validation & testing
 */
void hardware_security_simulate_fault(silicon_fault_type_t fault);

/**
 * @brief Reset defense registers back to armed state (for testing/provisioning)
 */
void hardware_security_reset_state(void);

#ifdef __cplusplus
}
#endif

#endif // HARDWARE_SECURITY_H
