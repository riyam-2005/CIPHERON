# Security Policy & Vulnerability Reporting

## 1. Security Philosophy & Boundaries
CIPHERON-X1 is an analytical research instrument designed for ethical security professionals, educators, and researchers.

### Defensive Boundaries
- **No Offensive Exploits**: CIPHERON-X1 strictly does not include features designed for credential dumping, payload delivery, authentication bypass, or malware execution.
- **Fail-Closed Security**: Data privacy is absolute. The companion server operates offline by default and collects zero plaintext telemetry.
- **No Arbitrary Code Execution (V1)**: Code inspected in the Source Code Intelligence module is parsed via static AST and is never dynamically evaluated on the host.

## 2. Reporting a Vulnerability
If you discover a security vulnerability in CIPHERON-X1, please follow our coordinated disclosure policy:
1. Do not open public issues on GitHub.
2. Submit your report to `security@cipheron.local`.
3. Provide a minimal reproducible test vector and attack vector description.
4. Security patches will be prioritized and verified within 48 hours.
