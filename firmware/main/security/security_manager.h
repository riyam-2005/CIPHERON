#ifndef SECURITY_MANAGER_H
#define SECURITY_MANAGER_H

#include <stdbool.h>
#include <stdint.h>

typedef struct {
    bool flash_encryption_active;
    bool secure_boot_active;
    bool fortress_mode_enabled;
    uint32_t session_id;
} security_state_t;

void security_init(void);
bool security_check_flash_encryption(void);
bool security_check_secure_boot(void);
void security_execute_panic_wipe(void);
const security_state_t* security_get_state(void);

#endif // SECURITY_MANAGER_H
