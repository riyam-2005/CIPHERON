#ifndef MESH_SWARM_H
#define MESH_SWARM_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

// Distributed Mesh Swarm Cryptanalysis (ESP-MESH-LITE)
// Multi-Device MapReduce Key-Space Search (Section 3.1 & 3.2)

#define MAX_SWARM_NODES     8

typedef enum {
    NODE_ROLE_LEADER = 0,
    NODE_ROLE_WORKER = 1,
    NODE_ROLE_STANDBY = 2
} swarm_role_t;

typedef enum {
    NODE_STATUS_IDLE = 0,
    NODE_STATUS_SEARCHING = 1,
    NODE_STATUS_KEY_FOUND = 2,
    NODE_STATUS_OFFLINE = 3
} swarm_node_status_t;

typedef struct {
    uint8_t node_id;
    char mac_address[18];
    swarm_role_t role;
    swarm_node_status_t status;
    uint32_t key_range_start;
    uint32_t key_range_end;
    uint32_t current_key;
    uint8_t battery_soc;
    bool has_vector_accel;
    uint32_t last_heartbeat_ms;
} swarm_node_t;

typedef struct {
    swarm_role_t local_role;
    uint8_t active_nodes_count;
    uint32_t total_key_space;
    uint32_t keys_evaluated;
    bool key_discovered;
    uint32_t winning_key;
    swarm_node_t nodes[MAX_SWARM_NODES];
} mesh_swarm_state_t;

// Initialize ESP-MESH-LITE Swarm Manager
bool mesh_swarm_init(swarm_role_t initial_role);

// Register / Update node in mesh table
bool mesh_swarm_register_node(uint8_t node_id, const char* mac, uint8_t battery_soc, bool has_vector_accel);

// Leader: Distribute key-space range [0, total_keys] across active nodes
bool mesh_swarm_partition_keyspace(uint32_t total_keys);

// Worker: Simulate / Execute key-space search step
bool mesh_swarm_step_search(uint32_t step_batch_size);

// Re-allocate orphaned key-space if a worker node drops offline (<150ms)
bool mesh_swarm_handle_node_failure(uint8_t failed_node_id);

// Get current swarm state
const mesh_swarm_state_t* mesh_swarm_get_state(void);

#ifdef __cplusplus
}
#endif

#endif // MESH_SWARM_H
