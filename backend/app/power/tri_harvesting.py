"""
CIPHERON-X1 V11.0.0-TRANSCENDENCE ARCHITECTURE
Kardashev-Scale Tri-Modal Micro-Energy Harvesting Subsystem
Adheres to suggestion-v10.md Sections 1.1 & 4.1
"""

from typing import Dict, Any


class TriModalHarvestingManager:
    """
    Manages Beta-Voltaic, Thermoelectric (Seebeck), and Photovoltaic
    ambient micro-energy harvesting layers integrated into the 3D chiplet stack.
    """

    def __init__(self):
        # Continuous radioisotope baseline (Tritium / Ni-63)
        self.beta_voltaic_nw = 450.0        # 450 nW (0.45 uW)
        self.half_life_years = 12.3         # Ni-63 / Tritium half-life

        # Thermoelectric Seebeck Generator
        self.thermoelectric_uw = 12.5       # 12.5 uW at Delta T = 3.2 deg C
        self.delta_temp_celsius = 3.2

        # Micro-Photovoltaic Surface Die
        self.photovoltaic_uw = 35.0         # 35.0 uW at 500 Lux ambient

        # Internal consumption in HDC sleep/quiescent state
        self.quiescent_consumption_uw = 32.0

        # Substrate digestion status
        self.substrate_digested = False

    def simulate_environment(self, ambient_lux: float = 500.0, delta_t_c: float = 3.2) -> Dict[str, Any]:
        """Recalculate harvesting levels based on external environmental telemetry."""
        if self.substrate_digested:
            return self.get_telemetry()

        self.delta_temp_celsius = max(0.0, delta_t_c)
        # Thermoelectric: P_th ~ k * (Delta T)^2
        self.thermoelectric_uw = round(1.22 * (self.delta_temp_celsius ** 2), 2)

        # Photovoltaic: P_pv ~ eta * Lux
        self.photovoltaic_uw = round(min(120.0, ambient_lux * 0.07), 2)

        return self.get_telemetry()

    def trigger_substrate_digestion(self):
        """Zeroize power generation upon biological substrate digestion."""
        self.substrate_digested = True
        self.beta_voltaic_nw = 0.0
        self.thermoelectric_uw = 0.0
        self.photovoltaic_uw = 0.0

    def reset(self):
        """Reset power subsystem state."""
        self.substrate_digested = False
        self.beta_voltaic_nw = 450.0
        self.thermoelectric_uw = 12.5
        self.photovoltaic_uw = 35.0

    def get_telemetry(self) -> Dict[str, Any]:
        """Aggregate power generation metrics and net power balance."""
        if self.substrate_digested:
            return {
                "status": "SUBSTRATE_DIGESTED_INERT",
                "beta_voltaic_nw": 0.0,
                "thermoelectric_uw": 0.0,
                "photovoltaic_uw": 0.0,
                "total_harvested_uw": 0.0,
                "net_power_balance_uw": -self.quiescent_consumption_uw,
                "is_energy_positive": False,
                "autonomous_runtime_years": 0.0,
            }

        beta_uw = self.beta_voltaic_nw / 1000.0
        total_uw = round(beta_uw + self.thermoelectric_uw + self.photovoltaic_uw, 2)
        net_uw = round(total_uw - self.quiescent_consumption_uw, 2)
        is_positive = net_uw >= 0.0

        return {
            "status": "TRI_HARVESTING_OPERATIONAL",
            "beta_voltaic_nw": self.beta_voltaic_nw,
            "beta_voltaic_uw": beta_uw,
            "radioisotope_type": "Nickel-63 / Tritium Beta-Voltaic",
            "half_life_years": self.half_life_years,
            "thermoelectric_uw": self.thermoelectric_uw,
            "delta_temp_celsius": self.delta_temp_celsius,
            "photovoltaic_uw": self.photovoltaic_uw,
            "total_harvested_uw": total_uw,
            "quiescent_consumption_uw": self.quiescent_consumption_uw,
            "net_power_balance_uw": net_uw,
            "is_energy_positive": is_positive,
            "autonomous_runtime_years": 12.3 if is_positive else 0.5,
            "kardashev_micro_efficiency": "TYPE_0_OMEGA_SELF_SUSTAINING",
        }


# Global singleton instance
tri_harvesting_manager = TriModalHarvestingManager()
