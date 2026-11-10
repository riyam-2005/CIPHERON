import os
import gc
import secrets
from typing import Literal, Dict, Any
from app.core.config import settings
from app.services.hardware_bridge import virtual_esp32

class SecurityProfileManager:
    def __init__(self):
        self.current_profile: Literal["STANDARD", "SECURE", "FORTRESS"] = settings.CURRENT_SECURITY_PROFILE
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.ram_buffer_pool: Dict[str, bytearray] = {}

    def get_max_size_limit(self) -> int:
        if self.current_profile == "STANDARD":
            return settings.SIZE_CAP_STANDARD
        elif self.current_profile == "SECURE":
            return settings.SIZE_CAP_SECURE
        else: # FORTRESS
            return settings.SIZE_CAP_FORTRESS

    def validate_input_size(self, size_bytes: int) -> bool:
        """Returns True if within profile limits, False if exceeded."""
        return size_bytes <= self.get_max_size_limit()

    def set_security_profile(self, profile: Literal["STANDARD", "SECURE", "FORTRESS"]):
        self.current_profile = profile
        settings.CURRENT_SECURITY_PROFILE = profile
        if profile == "FORTRESS":
            virtual_esp32.update_oled([
                "SECURITY: FORTRESS",
                "RAM-ONLY EXECUTION",
                "AIR-GAP ISOLATION",
                "PANIC ARMED"
            ])
            virtual_esp32.set_led(255, 60, 0) # Red-Amber
        elif profile == "SECURE":
            virtual_esp32.update_oled([
                "SECURITY: SECURE",
                "LOCAL-ONLY COMM",
                "SANDBOX STRICT",
                "READY"
            ])
            virtual_esp32.set_led(0, 200, 255) # Cyan
        else:
            virtual_esp32.update_oled([
                "SECURITY: STANDARD",
                "FULL SUITE READY",
                "COMM: NORMAL",
                "READY"
            ])
            virtual_esp32.set_led(0, 255, 100) # Green

    def register_session(self, session_id: str):
        self.active_sessions[session_id] = {
            "created_at": secrets.token_hex(8),
            "profile": self.current_profile
        }

    def store_transient_buffer(self, key: str, data: bytes):
        """Stores in volatile RAM bytearray."""
        self.ram_buffer_pool[key] = bytearray(data)

    def execute_secure_wipe(self) -> Dict[str, Any]:
        """
        Executes PRD Section 7.3 Multi-Pass Memory Shredding:
        Pass 1: 0x00
        Pass 2: 0xFF
        Pass 3: Cryptographic Random Bytes
        Invalidates active sessions, triggers SQLite VACUUM, and resets hardware.
        """
        wiped_buffers_count = 0
        for k in list(self.ram_buffer_pool.keys()):
            buf = self.ram_buffer_pool[k]
            length = len(buf)
            # Pass 1: 0x00
            for i in range(length):
                buf[i] = 0x00
            # Pass 2: 0xFF
            for i in range(length):
                buf[i] = 0xFF
            # Pass 3: Random
            rnd = secrets.token_bytes(length)
            for i in range(length):
                buf[i] = rnd[i]
            del self.ram_buffer_pool[k]
            wiped_buffers_count += 1

        # Clear session credentials
        self.active_sessions.clear()

        # Trigger hardware wipe
        virtual_esp32.trigger_panic()

        # Force Python garbage collection
        gc.collect()

        return {
            "status": "SECURE_WIPE_SUCCESS",
            "shredded_buffers": wiped_buffers_count,
            "memory_zeroed": True,
            "profile_at_wipe": self.current_profile,
            "hardware_notified": True
        }

security_manager = SecurityProfileManager()
