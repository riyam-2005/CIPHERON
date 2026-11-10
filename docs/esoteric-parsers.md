# Esoteric Formats & Serialization Parsers Engine

## 1. Overview
The CIPHERON-X1 Esoteric Parsers Engine ([esoteric.py](file:///backend/app/parsers/esoteric.py)) provides deterministic parsing and structural analysis for modern authentication tokens, binary serialization protocols, high-density radix encodings, and tactile accessibility encodings.

---

## 2. Supported Formats

### 2.1 JSON Web Tokens (JWT / RFC 7519)
- **Token Format**: `Header.Payload.Signature` (Base64URL encoded components).
- **Automated Claims Parsing**:
  - `sub` (Subject), `iss` (Issuer), `aud` (Audience), `exp` (Expiration Time), `iat` (Issued At), `nbf` (Not Before).
- **Security & Vulnerability Analysis**:
  - **Algorithm Confusion / `alg: none` Check**: Flags insecure tokens configured with `"alg": "none"` or unverified signatures.
  - **Expiration Validation**: Compares `exp` timestamp against current UTC system time to determine token validity.
  - **Weak Secret Advisory**: Recommends asymmetric ECDSA (ES256) or RS256 signing keys over symmetric HMAC.

### 2.2 Protocol Buffers Wire Format (Google Protobuf)
- **Zero-Schema Parsing**: Decodes raw binary protobuf streams without needing `.proto` definition files.
- **Wire Type Decoders**:
  - `0`: Varint (`int32`, `int64`, `uint32`, `uint64`, `sint32`, `sint64`, `bool`, `enum`).
  - `1`: 64-bit Fixed (`fixed64`, `sfixed64`, `double`).
  - `2`: Length-Delimited (`string`, `bytes`, embedded messages, packed repeated fields).
  - `5`: 32-bit Fixed (`fixed32`, `sfixed32`, `float`).
- **ZigZag Decoding**: Automatically converts sint representations into signed integers.

### 2.3 Concise Binary Object Representation (CBOR / RFC 8949)
- **Compact Serialization**: High-efficiency binary encoding used extensively in IoT, COSE, and WebAuthn / FIDO2.
- **Major Types Decoded**:
  - Major Type 0: Unsigned Integer.
  - Major Type 1: Negative Integer.
  - Major Type 2: Byte String (rendered as hexadecimal strings).
  - Major Type 3: UTF-8 Text String.
  - Major Type 4: Array of data items.
  - Major Type 5: Map of key-value pairs.
  - Major Type 7: Simple values and floating point numbers.

### 2.4 High-Density Radix Encodings: Base85
- **Adobe Ascii85**:
  - Encodes 4-byte sequences into 5 ASCII characters in the range `!` (33) to `u` (117).
  - Accommodates Adobe PostScript delimiter encapsulation (`<~...~>`).
  - Implements `z` zero-word compression (4 null bytes compressed to single `z`).
- **ZeroMQ Z85**:
  - String format tailored for ZeroMQ network frames.
  - Encodes 4-byte words using 85 printable characters without escaping special characters.

### 2.5 Unicode Braille Encodings
- **Character Space**: 8-dot and 6-dot Braille patterns located in Unicode range `U+2800` through `U+28FF`.
- **Mapping Matrix**: Bitmask-to-character translation mapping standard Grade 1 Braille patterns to English lowercase letters, uppercase shifts, and numbers `0-9`.

---

## 3. API Endpoints
| Endpoint | Method | Input | Output Model |
| :--- | :--- | :--- | :--- |
| `/api/v1/esoteric/jwt` | `POST` | `{"content": "<token>"}` | `JWTInspectionResult` |
| `/api/v1/esoteric/protobuf` | `POST` | `{"content": "<hex or raw>"}` | `ProtobufInspectionResult` |
| `/api/v1/esoteric/cbor` | `POST` | `{"content": "<hex or raw>"}` | `CBORInspectionResult` |
| `/api/v1/esoteric/base85` | `POST` | `{"content": "<data>"}` | `Base85Result` |
| `/api/v1/esoteric/braille` | `POST` | `{"content": "<braille>"}` | `{"braille_decoded": str, "success": bool}` |

---

## 4. Test Verification
All esoteric parsers are tested and verified via `pytest tests/test_v2_roadmap.py`:
- JWT header/payload decoding and `alg: none` security warning generation.
- Protobuf wire fields parsing (varints, strings, fixed types).
- CBOR map and array unpacking.
- Base85/Ascii85 round-trip encoding and decoding.
- Unicode Braille mapping.
