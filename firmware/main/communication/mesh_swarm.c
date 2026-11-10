#include "mesh_swarm.h"
#include <string.h>

static mesh_swarm_state_t s_swarm;

bool mesh_swarm_init(swarm_role_t initial_role) {
    memset(&s_swarm, 0, sizeof(mesh_swarm_state_t));
    s_swarm.local_role = initial_role;
    s_swarm.active_nodes_count = 1;

    // Node 0: Self
    s_swarm.nodes[0].node_id = 0;
    strncpy(s_swarm.nodes[0].mac_address, "E8:9F:6D:01:A0:01", 17);
    s_swarm.nodes[0].role = initial_role;
    s_swarm.nodes[0].status = NODE_STATUS_IDLE;
    s_swarm.nodes[0].battery_soc = 95;
    s_swarm.nodes[0].has_vector_accel = true;
    s_swarm.nodes[0].last_heartbeat_ms = 1000;

    return true;
}

bool mesh_swarm_register_node(uint8_t node_id, const char* mac, uint8_t battery_soc, bool has_vector_accel) {
    if (s_swarm.active_nodes_count >= MAX_SWARM_NODES) return false;

    // Check if node exists
    for (int i = 0; i < s_swarm.active_nodes_count; i++) {
        if (s_swarm.nodes[i].node_id == node_id) {
            s_swarm.nodes[i].battery_soc = battery_soc;
            s_swarm.nodes[i].has_vector_accel = has_vector_accel;
            s_swarm.nodes[i].status = NODE_STATUS_IDLE;
            return true;
        }
    }

    int idx = s_swarm.active_nodes_count;
    s_swarm.nodes[idx].node_id = node_id;
    strncpy(s_swarm.nodes[idx].mac_address, mac ? mac : "00:00:00:00:00:00", 17);
    s_swarm.nodes[idx].role = NODE_ROLE_WORKER;
    s_swarm.nodes[idx].status = NODE_STATUS_IDLE;
    s_swarm.nodes[idx].battery_soc = battery_soc;
    s_swarm.nodes[idx].has_vector_accel = has_vector_accel;
    s_swarm.active_nodes_count++;

    return true;
}

bool mesh_swarm_partition_keyspace(uint32_t total_keys) {
    if (s_swarm.active_nodes_count == 0 || total_keys == 0) return false;

    s_swarm.total_key_space = total_keys;
    s_swarm.keys_evaluated = 0;
    s_swarm.key_discovered = false;

    uint32_t chunk_size = total_keys / s_swarm.active_nodes_count;
    uint32_t current_start = 0;

    for (int i = 0; i < s_swarm.active_nodes_count; i++) {
        s_swarm.nodes[i].key_range_start = current_start;
        if (i == s_swarm.active_nodes_count - 1) {
            s_swarm.nodes[i].key_range_end = total_keys - 1;
        } else {
            s_swarm.nodes[i].key_range_end = current_start + chunk_size - 1;
        }
        s_swarm.nodes[i].current_key = s_swarm.nodes[i].key_range_start;
        s_swarm.nodes[i].status = NODE_STATUS_SEARCHING;
        current_start = s_swarm.nodes[i].key_range_end + 1;
    }

    return true;
}

bool mesh_swarm_step_search(uint32_t step_batch_size) {
    if (s_swarm.key_discovered) return true;

    for (int i = 0; i < s_swarm.active_nodes_count; i++) {
        if (s_swarm.nodes[i].status == NODE_STATUS_SEARCHING) {
            s_swarm.nodes[i].current_key += step_batch_size;
            s_swarm.keys_evaluated += step_batch_size;
            if (s_swarm.nodes[i].current_key >= s_swarm.nodes[i].key_range_end) {
                s_swarm.nodes[i].status = NODE_STATUS_IDLE;
            }
        }
    }
    return true;
}

bool mesh_swarm_handle_node_failure(uint8_t failed_node_id) {
    int failed_idx = -1;
    for (int i = 0; i < s_swarm.active_nodes_count; i++) {
        if (s_swarm.nodes[i].node_id == failed_node_id) {
            failed_idx = i;
            break;
        }
    }

    if (failed_idx == -1) return false;

    uint32_t orphan_start = s_swarm.nodes[failed_idx].current_key;
    uint32_t orphan_end = s_swarm.nodes[failed_idx].key_range_end;
    s_swarm.nodes[failed_idx].status = NODE_STATUS_OFFLINE;

    if (orphan_start >= orphan_end) {
        return true; // Already finished
    }

    // Find first active surviving worker to adopt remaining range
    for (int i = 0; i < s_swarm.active_nodes_count; i++) {
        if (i != failed_idx && s_swarm.nodes[i].status != NODE_STATUS_OFFLINE) {
            // Adopt orphaned sub-space
            s_swarm.nodes[i].key_range_end = orphan_end;
            s_swarm.nodes[i].status = NODE_STATUS_SEARCHING;
            return true;
        }
    }

    return false;
}

const mesh_swarm_state_t* mesh_swarm_get_state(void) {
    return &s_swarm;
}
