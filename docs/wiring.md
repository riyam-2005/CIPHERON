# CIPHERON-X1 Wiring Specification & Pinout Table

## 1. Pinout Assignment Matrix
Directly compliant with PRD Section 3.3 Hardware Wiring Specification:

| ESP32 Pin Assignment | Connected Peripheral | Wiring Notes / Constraints |
| :--- | :--- | :--- |
| **GPIO 21** | OLED SDA | Requires 4.7k&Omega; pull-up resistor to 3.3V |
| **GPIO 22** | OLED SCL | Requires 4.7k&Omega; pull-up resistor to 3.3V |
| **GPIO 13** | Keypad Row 0 | Configured as Output / Input Matrix |
| **GPIO 12** | Keypad Row 1 | Configured as Output / Input Matrix |
| **GPIO 14** | Keypad Row 2 | Configured as Output / Input Matrix |
| **GPIO 27** | Keypad Row 3 | Configured as Output / Input Matrix |
| **GPIO 26** | Keypad Col 0 | Configured with internal pull-down |
| **GPIO 25** | Keypad Col 1 | Configured with internal pull-down |
| **GPIO 33** | Keypad Col 2 | Configured with internal pull-down |
| **GPIO 32** | Keypad Col 3 | Configured with internal pull-down |
| **GPIO 15** | Button: ENTER | Active LOW, internal pull-up enabled |
| **GPIO 2** | Button: BACK | Active LOW, internal pull-up enabled |
| **GPIO 4** | Button: CLEAR | Active LOW, internal pull-up enabled |
| **GPIO 5** | Button: PANIC | Active LOW, triggers Fortress/Wipe Mode |
| **GPIO 18** | RGB LED (Red) | Current-limiting resistor 220&Omega; |
| **GPIO 19** | RGB LED (Green) | Current-limiting resistor 220&Omega; |
| **GPIO 23** | RGB LED (Blue) | Current-limiting resistor 220&Omega; |
| **GPIO 0** | Buzzer PWM | Avoid pulling LOW during boot sequence |

## 2. Boot Strapping Pin Warning
Pins **GPIO 0, 2, 5, 12, and 15** are strapping pins on the ESP32. Ensure pull-up / pull-down resistor values do not force unintended boot states (e.g., flashing mode or MTDI voltage selection) at power-on.
