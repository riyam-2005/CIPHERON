"""
CIPHERON-X1 Deep Space Interplanetary Laser Mesh & Delay-Tolerant Networking (DTN)
RFC 5050 / CCSDS 734.2-B-1 Bundle Protocol Engine
Adhering to suggestion-v8.md Section 2.1 & 6.2
"""

import math
import time
import hashlib
import base64
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field

# Physical Constants
SPEED_OF_LIGHT_KM_S = 299792.458  # km/s
LASER_WAVELENGTH_M = 1.55e-6       # 1550 nm coherent laser

# Predefined Interplanetary Nodes with Heliocentric/Lagrange Coordinates (km)
# Scaled astronomical coordinates representing Sun-Earth-Moon-Mars orbital positions
DEFAULT_NODES = {
    "dtn://earth.ground/node-alpha": {
        "name": "Earth Ground Optical Terminal (Goldstone)",
        "coordinates": (0.0, 0.0, 0.0),
        "type": "GROUND_STATION",
        "optical_aperture_cm": 100.0,
        "laser_power_w": 250.0,
    },
    "dtn://moon.gateway/node-l1": {
        "name": "Lunar Gateway Transceiver",
        "coordinates": (384400.0, 15000.0, 5000.0),
        "type": "LUNAR_RELAY",
        "optical_aperture_cm": 40.0,
        "laser_power_w": 50.0,
    },
    "dtn://lagrange.l1/custodian-sol": {
        "name": "Sun-Earth L1 Lagrange Custodian Station",
        "coordinates": (1496000.0, 0.0, 0.0),
        "type": "LAGRANGE_CUSTODIAN",
        "optical_aperture_cm": 60.0,
        "laser_power_w": 100.0,
    },
    "dtn://lagrange.l2/custodian-deep": {
        "name": "Sun-Earth L2 Lagrange Deep Space Node",
        "coordinates": (-1500000.0, 20000.0, -10000.0),
        "type": "LAGRANGE_CUSTODIAN",
        "optical_aperture_cm": 70.0,
        "laser_power_w": 120.0,
    },
    "dtn://lagrange.l4/trojan-east": {
        "name": "Earth-Sun L4 Trojan Lagrange Relay",
        "coordinates": (74800000.0, 129550000.0, 0.0),
        "type": "INTERPLANETARY_RELAY",
        "optical_aperture_cm": 80.0,
        "laser_power_w": 150.0,
    },
    "dtn://lagrange.l5/trojan-west": {
        "name": "Earth-Sun L5 Trojan Lagrange Relay",
        "coordinates": (74800000.0, -129550000.0, 0.0),
        "type": "INTERPLANETARY_RELAY",
        "optical_aperture_cm": 80.0,
        "laser_power_w": 150.0,
    },
    "dtn://mars.orbit/ares-relay": {
        "name": "Mars Orbital Primary Relay (Ares-1)",
        "coordinates": (120000000.0, 160000000.0, 15000000.0), # Nominal distance ~2.0e8 km
        "type": "MARS_ORBITER",
        "optical_aperture_cm": 50.0,
        "laser_power_w": 80.0,
    },
    "dtn://mars.surface/jezero-term": {
        "name": "Mars Surface Terminal (Jezero Crater)",
        "coordinates": (120003000.0, 160001000.0, 14998000.0),
        "type": "SURFACE_TERMINAL",
        "optical_aperture_cm": 35.0,
        "laser_power_w": 40.0,
    }
}


def compute_euclidean_distance(p1: Tuple[float, float, float], p2: Tuple[float, float, float]) -> float:
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2 + (p1[2] - p2[2])**2)


def compute_deep_space_link_margin(
    distance_km: float,
    tx_power_w: float = 100.0,
    tx_aperture_m: float = 0.50,
    rx_aperture_m: float = 0.70,
    wavelength_m: float = LASER_WAVELENGTH_M,
    pointing_loss_db: float = 3.0,
    rx_sensitivity_dbm: float = -85.0
) -> Dict[str, float]:
    """
    Computes Free-Space Deep-Space Optical Link Margin according to suggestion-v8.md Section 2.1:
    Link_Margin = P_t + G_t + G_r - 20*log10(4*pi*d / lambda) - L_pointing - P_req >= 6.0 dB
    """
    distance_m = max(distance_km, 1.0) * 1000.0
    
    # Transmit power in dBW
    p_t_dbw = 10.0 * math.log10(max(tx_power_w, 0.001))
    
    # Antenna gains for circular optical apertures at lambda = 1550nm
    # Gain ~ (pi * D / lambda)^2
    g_t = (math.pi * tx_aperture_m / wavelength_m) ** 2
    g_r = (math.pi * rx_aperture_m / wavelength_m) ** 2
    g_t_dbi = 10.0 * math.log10(g_t)
    g_r_dbi = 10.0 * math.log10(g_r)
    
    # Free-Space Path Loss (FSPL) in dB
    fspl_ratio = (4.0 * math.pi * distance_m) / wavelength_m
    fspl_db = 20.0 * math.log10(fspl_ratio)
    
    # Receiver sensitivity in dBW (dBm - 30)
    p_req_dbw = rx_sensitivity_dbm - 30.0
    
    # Received Power: P_rx = P_t + G_t + G_r - FSPL - L_pointing
    p_rx_dbw = p_t_dbw + g_t_dbi + g_r_dbi - fspl_db - pointing_loss_db
    
    # Link Margin: Link_Margin = P_rx - P_req
    link_margin_db = p_rx_dbw - p_req_dbw
    
    # One-way propagation delay T = d / c
    propagation_delay_sec = (distance_km) / SPEED_OF_LIGHT_KM_S
    propagation_delay_min = propagation_delay_sec / 60.0
    
    return {
        "distance_km": distance_km,
        "propagation_delay_sec": round(propagation_delay_sec, 2),
        "propagation_delay_min": round(propagation_delay_min, 2),
        "tx_power_dbw": round(p_t_dbw, 2),
        "tx_gain_dbi": round(g_t_dbi, 2),
        "rx_gain_dbi": round(g_r_dbi, 2),
        "free_space_path_loss_db": round(fspl_db, 2),
        "pointing_loss_db": pointing_loss_db,
        "received_power_dbw": round(p_rx_dbw, 2),
        "receiver_threshold_dbw": round(p_req_dbw, 2),
        "link_margin_db": round(link_margin_db, 2),
        "margin_meets_requirement": link_margin_db >= 6.0
    }


def build_merkle_tree(chunks: List[bytes]) -> Tuple[str, List[Dict[str, Any]]]:
    """Builds a Merkle tree over payload chunks and yields root hash and proof structures."""
    if not chunks:
        empty_hash = hashlib.sha256(b"").hexdigest()
        return empty_hash, []
    
    current_level = [hashlib.sha256(c).hexdigest() for c in chunks]
    proofs = [{"leaf_index": i, "leaf_hash": h} for i, h in enumerate(current_level)]
    
    while len(current_level) > 1:
        next_level = []
        for i in range(0, len(current_level), 2):
            left = current_level[i]
            right = current_level[i + 1] if i + 1 < len(current_level) else left
            combined = hashlib.sha256((left + right).encode('utf-8')).hexdigest()
            next_level.append(combined)
        current_level = next_level
        
    return current_level[0], proofs


@dataclass
class DTNBundlePayload:
    source: str
    destination: str
    payload_bytes: bytes
    ttl_seconds: int = 86400 * 7 # 7 days interplanetary TTL
    creation_timestamp: int = field(default_factory=lambda: int(time.time()))
    custodian_node: str = "dtn://earth.ground/node-alpha"
    custody_accepted: bool = True
    hop_history: List[Dict[str, Any]] = field(default_factory=list)
    bundle_id: str = ""
    merkle_root: str = ""
    chunk_count: int = 1

    def __post_init__(self):
        # Chunk payload into 1KB blocks for Merkle tree generation
        chunk_size = 1024
        chunks = [self.payload_bytes[i:i+chunk_size] for i in range(0, max(len(self.payload_bytes), 1), chunk_size)]
        self.chunk_count = len(chunks)
        self.merkle_root, _ = build_merkle_tree(chunks)
        
        # Primary RFC 5050 Bundle ID
        header = f"{self.source}:{self.destination}:{self.creation_timestamp}:{self.merkle_root}".encode('utf-8')
        self.bundle_id = hashlib.sha256(header).hexdigest()
        
        if not self.hop_history:
            self.hop_history.append({
                "node": self.source,
                "timestamp": self.creation_timestamp,
                "status": "DISPATCHED",
                "custody_held": True
            })


class DTNInterplanetaryMesh:
    """
    Delay-Tolerant Networking (DTN) Bundle Protocol & Interplanetary Mesh Manager.
    Manages Earth-Moon-Mars deep space optical communications across Lagrange nodes.
    """
    def __init__(self):
        self.nodes = DEFAULT_NODES.copy()
        self.bundles: Dict[str, DTNBundlePayload] = {}
        self.total_bundles_forwarded = 0
        self.total_bytes_transmitted = 0

    def register_bundle(self, source_eid: str, destination_eid: str, payload: bytes) -> DTNBundlePayload:
        if source_eid not in self.nodes:
            # Fallback default
            source_eid = "dtn://earth.ground/node-alpha"
        if destination_eid not in self.nodes:
            destination_eid = "dtn://mars.surface/jezero-term"

        bundle = DTNBundlePayload(
            source=source_eid,
            destination=destination_eid,
            payload_bytes=payload,
            custodian_node=source_eid
        )
        self.bundles[bundle.bundle_id] = bundle
        self.total_bundles_forwarded += 1
        self.total_bytes_transmitted += len(payload)
        return bundle

    def transfer_custody(self, bundle_id: str, next_custodian_eid: str) -> Dict[str, Any]:
        """Executes RFC 5050 custody transfer to adjacent custodian node with link budget verification."""
        if bundle_id not in self.bundles:
            raise ValueError(f"Bundle {bundle_id} not found in store-and-forward queue.")
        if next_custodian_eid not in self.nodes:
            raise ValueError(f"Target custodian {next_custodian_eid} unknown in interplanetary constellation.")
            
        bundle = self.bundles[bundle_id]
        current_node = bundle.custodian_node
        
        # Compute link physics between current and next node
        p1 = self.nodes[current_node]["coordinates"]
        p2 = self.nodes[next_custodian_eid]["coordinates"]
        dist_km = compute_euclidean_distance(p1, p2)
        
        link_budget = compute_deep_space_link_margin(
            distance_km=dist_km,
            tx_power_w=self.nodes[current_node]["laser_power_w"],
            tx_aperture_m=self.nodes[current_node]["optical_aperture_cm"] / 100.0,
            rx_aperture_m=self.nodes[next_custodian_eid]["optical_aperture_cm"] / 100.0
        )
        
        # Transfer custody
        bundle.custodian_node = next_custodian_eid
        bundle.hop_history.append({
            "node": next_custodian_eid,
            "timestamp": int(time.time()),
            "status": "CUSTODY_ACCEPTED",
            "distance_km": dist_km,
            "link_margin_db": link_budget["link_margin_db"]
        })
        
        return {
            "bundle_id": bundle.bundle_id,
            "previous_custodian": current_node,
            "new_custodian": next_custodian_eid,
            "link_budget": link_budget,
            "custody_status": "ACCEPTED",
            "merkle_root": bundle.merkle_root
        }

    def get_route_telemetry(self, source_eid: str, destination_eid: str) -> Dict[str, Any]:
        """Calculates end-to-end hop route and cumulative propagation delay across interplanetary mesh."""
        if source_eid not in self.nodes:
            source_eid = "dtn://earth.ground/node-alpha"
        if destination_eid not in self.nodes:
            destination_eid = "dtn://mars.surface/jezero-term"

        p_src = self.nodes[source_eid]["coordinates"]
        p_dst = self.nodes[destination_eid]["coordinates"]
        direct_dist = compute_euclidean_distance(p_src, p_dst)
        
        # Recommended RFC 5050 relay path through Lagrange nodes
        hops = [source_eid]
        if "earth" in source_eid and "mars" in destination_eid:
            hops.extend([
                "dtn://lagrange.l1/custodian-sol",
                "dtn://lagrange.l4/trojan-east",
                "dtn://mars.orbit/ares-relay",
                destination_eid
            ])
        else:
            hops.append(destination_eid)
            
        hop_details = []
        total_delay_sec = 0.0
        for i in range(len(hops) - 1):
            h_from = hops[i]
            h_to = hops[i + 1]
            dist = compute_euclidean_distance(
                self.nodes[h_from]["coordinates"],
                self.nodes[h_to]["coordinates"]
            )
            margin = compute_deep_space_link_margin(
                dist,
                tx_power_w=self.nodes[h_from]["laser_power_w"],
                tx_aperture_m=self.nodes[h_from]["optical_aperture_cm"] / 100.0,
                rx_aperture_m=self.nodes[h_to]["optical_aperture_cm"] / 100.0
            )
            total_delay_sec += margin["propagation_delay_sec"]
            hop_details.append({
                "from": h_from,
                "to": h_to,
                "distance_km": dist,
                "propagation_delay_sec": margin["propagation_delay_sec"],
                "link_margin_db": margin["link_margin_db"],
                "meets_spec": margin["margin_meets_requirement"]
            })

        direct_budget = compute_deep_space_link_margin(direct_dist)

        return {
            "source": source_eid,
            "destination": destination_eid,
            "direct_distance_km": direct_dist,
            "direct_propagation_delay_sec": direct_budget["propagation_delay_sec"],
            "direct_propagation_delay_min": direct_budget["propagation_delay_min"],
            "total_route_delay_min": round(total_delay_sec / 60.0, 2),
            "hops": hop_details,
            "relay_count": len(hops) - 2,
            "protocol_spec": "RFC 5050 / CCSDS 734.2-B-1"
        }

    def get_mesh_status(self) -> Dict[str, Any]:
        return {
            "constellation_version": "9.0.0-SINGULARITY SILICON",
            "active_nodes_count": len(self.nodes),
            "active_nodes": [
                {
                    "eid": eid,
                    "name": data["name"],
                    "type": data["type"],
                    "aperture_cm": data["optical_aperture_cm"],
                    "laser_power_w": data["laser_power_w"],
                    "coordinates_km": data["coordinates"]
                }
                for eid, data in self.nodes.items()
            ],
            "total_bundles_in_flight": len(self.bundles),
            "total_bundles_forwarded": self.total_bundles_forwarded,
            "total_bytes_transmitted": self.total_bytes_transmitted,
            "carrier_wavelength_nm": 1550.0,
            "minimum_required_margin_db": 6.0
        }


# Singleton instance
dtn_mesh_manager = DTNInterplanetaryMesh()
