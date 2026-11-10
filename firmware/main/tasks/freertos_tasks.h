#ifndef FREERTOS_TASKS_H
#define FREERTOS_TASKS_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

// FreeRTOS Task Affinity & Priority Configuration (suggestion-v2.md Section 3.1)
#define CORE_0_AFFINITY            0
#define CORE_1_AFFINITY            1

#define PRIO_SERIAL_USB_TASK       10
#define PRIO_SECURITY_MESH_TASK    25
#define PRIO_WATCHDOG_TASK         30

#define PRIO_SYSTEM_EVENT_TASK     2
#define PRIO_KEYPAD_ENCODER_TASK   5
#define PRIO_DISPLAY_GUI_TASK      8

#define STACK_SERIAL_USB           8192
#define STACK_SECURITY_MESH        4096
#define STACK_WATCHDOG             2048
#define STACK_KEYPAD_ENCODER       4096
#define STACK_DISPLAY_GUI          8192
#define STACK_SYSTEM_EVENT         4096

typedef struct {
    const char *task_name;
    uint8_t core_id;
    uint8_t priority;
    uint32_t stack_size_bytes;
    bool is_running;
} system_task_descriptor_t;

void freertos_tasks_init(void);
uint32_t freertos_tasks_get_count(void);
const system_task_descriptor_t* freertos_tasks_get_descriptor(uint32_t index);
bool freertos_tasks_all_healthy(void);

#ifdef __cplusplus
}
#endif

#endif // FREERTOS_TASKS_H
