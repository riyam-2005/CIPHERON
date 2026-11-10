import time
import json
import hashlib
from typing import Dict, Any, Optional, List
from app.models.schemas import HardwarePacket

class VirtualESP32Device:
    """
    Virtual Hardware Controller simulating the ESP32-WROOM-32 / S3
    with SSD1306 128x64 OLED display, 4x4 keypad, tactile buttons,
    RGB status LED, and active piezo buzzer.
    """
    def __init__(self):
        self.device_id = "ESP32-CIPHERON-X1-SN8829"
        self.is_authenticated = False
        self.session_token = ""
        self.firmware_version = "v1.0.0-IDF5.2"
        self.boot_time_ms = 450.0  # Cold boot took 450ms <= 1.2s SLA
        self.seq_num = 0
        
        # Hardware States
        self.oled_lines = [
            "CIPHERON-X1 READY",
            "MODE: STANDARD",
            "COMM: SECURE SERIAL",
            "WAITING FOR INPUT..."
        ]
        self.rgb_led = {"r": 0, "g": 255, "b": 100}  # Cyan/Green ready state
        self.buzzer_active = False
        self.panic_triggered = False
        self.input_buffer = ""
        self.last_key_pressed: Optional[str] = None
        self.free_heap_bytes = 184320
        self.battery_mv = 4150  # 4.15V Li-ion

    def handle_incoming_packet(self, packet_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Processes framed packet from hardware or frontend emulator."""
        self.seq_num += 1
        p_type = packet_dict.get("packet_type", "")
        payload = packet_dict.get("payload", {})

        if p_type == "CHALLENGE":
            # Cryptographic challenge-response handshake
            client_nonce = payload.get("nonce", "")
            response_hash = hashlib.sha256(f"{client_nonce}:{self.device_id}:SECRET_KEY".encode()).hexdigest()
            self.is_authenticated = True
            self.session_token = response_hash[:32]
            self.oled_lines[0] = "CIPHERON-X1 [AUTH]"
            self.oled_lines[2] = "LINK: ENCRYPTED"
            return {
                "packet_type": "CHALLENGE_RESPONSE",
                "seq_num": self.seq_num,
                "payload": {
                    "authenticated": True,
                    "session_token": self.session_token,
                    "device_id": self.device_id,
                    "fw_version": self.firmware_version
                }
            }

        elif p_type == "KEYPAD":
            key = payload.get("key", "")
            self.last_key_pressed = key
            if key in "0123456789ABCDEFabcdef":
                self.input_buffer += key
            elif key == "*":
                self.input_buffer = ""  # Clear
            elif key == "#":
                pass  # Submit
                
            self.oled_lines[3] = f"BUF: {self.input_buffer[-14:]}"
            return {
                "packet_type": "STATUS",
                "seq_num": self.seq_num,
                "payload": self.get_device_status()
            }

        elif p_type == "BUTTON":
            btn = payload.get("button", "")
            if btn == "PANIC":
                return self.trigger_panic()
            elif btn == "CLEAR":
                self.input_buffer = ""
                self.oled_lines[3] = "BUF CLEARED"
            elif btn == "ENTER":
                self.oled_lines[3] = "DISPATCHING PAYLOAD"
            elif btn == "BACK":
                if self.input_buffer:
                    self.input_buffer = self.input_buffer[:-1]
                self.oled_lines[3] = f"BUF: {self.input_buffer[-14:]}"

            return {
                "packet_type": "STATUS",
                "seq_num": self.seq_num,
                "payload": self.get_device_status()
            }

        elif p_type == "PANIC":
            return self.trigger_panic()

        return {
            "packet_type": "STATUS",
            "seq_num": self.seq_num,
            "payload": self.get_device_status()
        }

    def trigger_panic(self) -> Dict[str, Any]:
        """Executes emergency panic wipe on virtual device."""
        self.panic_triggered = True
        self.input_buffer = ""
        self.session_token = ""
        self.is_authenticated = False
        self.rgb_led = {"r": 255, "g": 0, "b": 0}  # Red alert
        self.buzzer_active = True
        self.oled_lines = [
            "! PANIC TRIGGERED !",
            "MEMORY SHREDDED",
            "NVS KEYS WIPED",
            "SYSTEM RESETTING"
        ]
        return {
            "packet_type": "PANIC_ACK",
            "seq_num": self.seq_num,
            "payload": {
                "status": "WIPE_COMPLETE",
                "memory_cleared": True,
                "keys_erased": True
            }
        }

    def update_oled(self, lines: List[str]):
        """Companion server pushes live analysis status to OLED."""
        for i in range(min(4, len(lines))):
            self.oled_lines[i] = lines[i][:20]

    def set_led(self, r: int, g: int, b: int):
        self.rgb_led = {"r": r, "g": g, "b": b}

    def get_device_status(self) -> Dict[str, Any]:
        return {
            "device_id": self.device_id,
            "firmware_version": self.firmware_version,
            "is_authenticated": self.is_authenticated,
            "session_token": self.session_token,
            "oled_lines": self.oled_lines,
            "rgb_led": self.rgb_led,
            "buzzer_active": self.buzzer_active,
            "panic_triggered": self.panic_triggered,
            "input_buffer": self.input_buffer,
            "last_key": self.last_key_pressed,
            "free_heap_bytes": self.free_heap_bytes,
            "battery_mv": self.battery_mv
        }

virtual_esp32 = VirtualESP32Device()
