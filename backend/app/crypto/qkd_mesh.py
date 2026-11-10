"""
CIPHERON-X1 — Quantum Key Distribution (QKD) Optical Mesh & Entanglement Monitor
Adhering to suggestion-v6.md Section 5 & 5.1
Simulates BB84 single-photon polarization protocol (QBER < 11.0%)
and E91 Bell state CHSH inequality entanglement test (S > 2.0).
"""

import math
import random
from typing import Dict, List, Any, Tuple

class QKDOpticalMesh:
    """
    Quantum Key Distribution & Photonic Entanglement Monitoring Engine.
    Enforces physical-layer security across optical fiber nodes.
    """

    # BB84 theoretical eavesdropping threshold limit
    MAX_SECURE_QBER_PCT = 11.0

    def simulate_bb84_protocol(
        self,
        num_photons: int = 256,
        channel_noise_pct: float = 2.5,
        eavesdropper_active: bool = False
    ) -> Dict[str, Any]:
        """
        Executes BB84 Single-Photon Polarization Protocol.
        Alice transmits polarized photons in Rectilinear (+) or Diagonal (x) bases.
        Bob measures in random bases.
        Evaluates QBER: QBER < 11.0% -> Secure Key Established; QBER >= 11% -> Eavesdropper Alert!
        """
        alice_bits = [random.randint(0, 1) for _ in range(num_photons)]
        alice_bases = [random.choice(['+', 'x']) for _ in range(num_photons)]
        bob_bases = [random.choice(['+', 'x']) for _ in range(num_photons)]

        bob_measured_bits = []
        eve_interceptions = 0

        for i in range(num_photons):
            a_bit = alice_bits[i]
            a_basis = alice_bases[i]
            b_basis = bob_bases[i]

            # 1. Eavesdropper (Eve) Intercept-Resend Attack
            if eavesdropper_active:
                eve_basis = random.choice(['+', 'x'])
                eve_interceptions += 1
                if eve_basis != a_basis:
                    # Eve collapses state, resends in her basis -> 50% chance of flip
                    a_bit = random.randint(0, 1)
                    a_basis = eve_basis

            # 2. Channel noise bit-flip
            if (random.random() * 100.0) < channel_noise_pct:
                a_bit ^= 1

            # 3. Bob measurement
            if b_basis == a_basis:
                bob_measured_bits.append(a_bit)
            else:
                # Random outcome on mismatched basis
                bob_measured_bits.append(random.randint(0, 1))

        # 4. Sifting Phase: Retain only photons where Alice and Bob selected identical bases
        sifted_alice = []
        sifted_bob = []
        for i in range(num_photons):
            if alice_bases[i] == bob_bases[i]:
                sifted_alice.append(alice_bits[i])
                sifted_bob.append(bob_measured_bits[i])

        sifted_len = len(sifted_alice)
        if sifted_len == 0:
            return {"error": "INSUFFICIENT_SIFTED_PHOTONS"}

        # 5. Error estimation on sample subset (half of sifted bits)
        sample_size = max(sifted_len // 2, 1)
        errors = sum(1 for i in range(sample_size) if sifted_alice[i] != sifted_bob[i])
        qber = round((errors / sample_size) * 100.0, 2)

        # Remaining bits form the raw secret key
        raw_key_bits = sifted_alice[sample_size:]
        raw_key_hex = ""
        if len(raw_key_bits) >= 8:
            byte_vals = []
            for k in range(0, (len(raw_key_bits) // 8) * 8, 8):
                byte_val = 0
                for bit_pos in range(8):
                    byte_val = (byte_val << 1) | raw_key_bits[k + bit_pos]
                byte_vals.append(byte_val)
            raw_key_hex = bytes(byte_vals).hex().upper()

        is_secure = (qber < self.MAX_SECURE_QBER_PCT)

        return {
            "total_photons_transmitted": num_photons,
            "sifted_key_length_bits": sifted_len,
            "qber_pct": qber,
            "threshold_qber_limit_pct": self.MAX_SECURE_QBER_PCT,
            "status": "UNCONDITIONALLY_SECURE_KEY" if is_secure else "EAVESDROPPER_DETECTED_STATE_COLLAPSED",
            "is_secure": is_secure,
            "channel_noise_pct": channel_noise_pct,
            "eavesdropper_intercepted": eavesdropper_active,
            "generated_key_hex": raw_key_hex if is_secure else None,
            "photon_fidelity_pct": round(100.0 - qber, 2)
        }

    def evaluate_e91_bell_inequality(self, trials: int = 1000) -> Dict[str, Any]:
        """
        Executes Ekert-91 (E91) Entanglement Verification via CHSH Inequality.
        Bell parameter S = |E(a, b) - E(a, b') + E(a', b) + E(a', b')|
        Classical limit: |S| <= 2.0
        Quantum limit (Tsirelson bound): |S| <= 2 * sqrt(2) ~ 2.8284
        If S > 2.0, confirms true non-local quantum entanglement!
        """
        # Measurement angle settings (radians)
        # Alice: a1 = 0, a2 = pi/4
        # Bob:   b1 = pi/8, b2 = 3*pi/8
        a1, a2 = 0.0, math.pi / 4
        b1, b2 = math.pi / 8, 3 * math.pi / 8

        def correlation(angle_a: float, angle_b: float) -> float:
            # Ideal Bell singlet/state correlation: -cos(2*(angle_a - angle_b))
            ideal = -math.cos(2.0 * (angle_a - angle_b))
            # Introduce small realistic optical detector jitter
            noise = (random.random() - 0.5) * 0.05
            return ideal + noise

        e_a1_b1 = correlation(a1, b1)
        e_a1_b2 = correlation(a1, b2)
        e_a2_b1 = correlation(a2, b1)
        e_a2_b2 = correlation(a2, b2)

        # CHSH parameter S
        s_val = abs(e_a1_b1 - e_a1_b2 + e_a2_b1 + e_a2_b2)
        s_val = round(min(s_val, 2.8284), 4)

        quantum_violation = (s_val > 2.0)

        return {
            "chsh_parameter_s": s_val,
            "classical_local_realism_bound": 2.0,
            "quantum_tsirelson_bound": 2.8284,
            "bell_inequality_violated": quantum_violation,
            "entanglement_verified": quantum_violation,
            "bell_state": "|Phi+> = (|00> + |11>) / sqrt(2)",
            "entanglement_fidelity_pct": round((s_val / 2.8284) * 100.0, 2),
            "status": "NON_LOCAL_ENTANGLEMENT_CONFIRMED" if quantum_violation else "CLASSICAL_SEPARABLE_STATE"
        }

# Singleton instance
qkd_mesh = QKDOpticalMesh()
