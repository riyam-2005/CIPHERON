#include "freertos_tasks.h"
#include <string.h>

static system_task_descriptor_t s_tasks[] = {
    // Core 0: Comm, Security & Hardware Watchdog
    { "Serial_USB_Task",    CORE_0_AFFINITY, PRIO_SERIAL_USB_TASK,    STACK_SERIAL_USB,    true },
    { "Security_Mesh_Task", CORE_0_AFFINITY, PRIO_SECURITY_MESH_TASK, STACK_SECURITY_MESH, true },
    { "Watchdog_Task",      CORE_0_AFFINITY, PRIO_WATCHDOG_TASK,      STACK_WATCHDOG,      true },

    // Core 1: User IO & Visual Rendering
    { "System_Event_Task",  CORE_1_AFFINITY, PRIO_SYSTEM_EVENT_TASK,   STACK_SYSTEM_EVENT,  true },
    { "Keypad_Encoder_Task",CORE_1_AFFINITY, PRIO_KEYPAD_ENCODER_TASK, STACK_KEYPAD_ENCODER,true },
    { "Display_GUI_Task",   CORE_1_AFFINITY, PRIO_DISPLAY_GUI_TASK,    STACK_DISPLAY_GUI,   true }
};

static const uint32_t s_task_count = sizeof(s_tasks) / sizeof(s_tasks[0]);

void freertos_tasks_init(void) {
    for (uint32_t i = 0; i < s_task_count; i++) {
        s_tasks[i].is_running = true;
    }
}

uint32_t freertos_tasks_get_count(void) {
    return s_task_count;
}

const system_task_descriptor_t* freertos_tasks_get_descriptor(uint32_t index) {
    if (index >= s_task_count) return NULL;
    return &s_tasks[index];
}

bool freertos_tasks_all_healthy(void) {
    for (uint32_t i = 0; i < s_task_count; i++) {
        if (!s_tasks[i].is_running) return false;
    }
    return true;
}
