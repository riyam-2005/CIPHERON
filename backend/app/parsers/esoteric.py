import json
import base64
import struct
import math
from typing import Dict, Any, List, Optional, Tuple

# --- 1. JWT (JSON WEB TOKEN) INSPECTOR ---
def inspect_jwt(token_str: str) -> Dict[str, Any]:
    """
    Parses Header, Payload, and Signature of a JWT.
    Validates Base64URL encoding, checks claims, and detects vulnerabilities.
    """
    clean = token_str.strip()
    parts = clean.split('.')
    if len(parts) != 3:
        return {
            "is_valid_jwt": False,
            "error": "JWT must contain precisely 3 dot-delimited segments (Header.Payload.Signature)"
        }

    header_b64, payload_b64, signature_b64 = parts

    def b64url_decode(segment: str) -> Optional[bytes]:
        rem = len(segment) % 4
        if rem > 0:
            segment += '=' * (4 - rem)
        try:
            return base64.urlsafe_b64decode(segment.encode('ascii'))
        except Exception:
            return None

    header_bytes = b64url_decode(header_b64)
    payload_bytes = b64url_decode(payload_b64)

    if not header_bytes or not payload_bytes:
        return {
            "is_valid_jwt": False,
            "error": "Failed to decode Base64URL segments"
        }

    try:
        header = json.loads(header_bytes.decode('utf-8'))
        payload = json.loads(payload_bytes.decode('utf-8'))
    except Exception as e:
        return {
            "is_valid_jwt": False,
            "error": f"JSON decoding error: {str(e)}"
        }

    vulnerabilities: List[str] = []
    alg = header.get("alg", "").lower()
    if alg == "none":
        vulnerabilities.append("Critical: 'none' algorithm allowed (CVE-2015-9235 unauthenticated forgery risk)")
    elif alg in ["hs256", "hs384", "hs512"]:
        vulnerabilities.append("Info: Symmetric HMAC algorithm. Check for weak or leaked secret keys.")

    claims_info = {}
    if "exp" in payload:
        claims_info["exp"] = payload["exp"]
    if "nbf" in payload:
        claims_info["nbf"] = payload["nbf"]
    if "sub" in payload:
        claims_info["sub"] = payload["sub"]
    if "iss" in payload:
        claims_info["iss"] = payload["iss"]

    return {
        "is_valid_jwt": True,
        "header": header,
        "payload": payload,
        "signature_hex": signature_b64,
        "claims_info": claims_info,
        "vulnerabilities": vulnerabilities
    }

# --- 2. PROTOBUF WIRE FORMAT DECODER ---
def decode_varint(data: bytes, offset: int) -> Tuple[int, int]:
    """Decodes a protobuf varint starting at offset. Returns (value, new_offset)."""
    res = 0
    shift = 0
    idx = offset
    while idx < len(data):
        b = data[idx]
        idx += 1
        res |= (b & 0x7F) << shift
        if not (b & 0x80):
            break
        shift += 7
    return res, idx

def decode_protobuf_wire(data_bytes: bytes) -> Dict[str, Any]:
    """
    Decodes raw Protocol Buffers wire format without needing a .proto file.
    Identifies Wire Types:
      0: Varint
      1: 64-bit
      2: Length-delimited (string/sub-message/bytes)
      5: 32-bit
    """
    fields: List[Dict[str, Any]] = []
    offset = 0
    total_len = len(data_bytes)

    while offset < total_len:
        try:
            tag_varint, offset = decode_varint(data_bytes, offset)
            field_num = tag_varint >> 3
            wire_type = tag_varint & 0x07

            if wire_type == 0:  # Varint
                val, offset = decode_varint(data_bytes, offset)
                fields.append({
                    "field": field_num,
                    "wire_type": "0 (Varint)",
                    "value": val
                })
            elif wire_type == 1:  # 64-bit (fixed64, double)
                if offset + 8 > total_len:
                    break
                val_bytes = data_bytes[offset:offset+8]
                offset += 8
                val_int = struct.unpack('<Q', val_bytes)[0]
                fields.append({
                    "field": field_num,
                    "wire_type": "1 (64-bit)",
                    "hex": val_bytes.hex(),
                    "int64": val_int
                })
            elif wire_type == 2:  # Length-delimited
                length, offset = decode_varint(data_bytes, offset)
                if offset + length > total_len:
                    break
                chunk = data_bytes[offset:offset+length]
                offset += length

                # Try string representation
                try:
                    text_val = chunk.decode('utf-8')
                    # If printable string
                    if all(32 <= ord(c) <= 126 or c in '\n\r\t' for c in text_val):
                        fields.append({
                            "field": field_num,
                            "wire_type": "2 (Length-delimited String)",
                            "value": text_val
                        })
                        continue
                except Exception:
                    pass

                # If binary
                fields.append({
                    "field": field_num,
                    "wire_type": "2 (Length-delimited Bytes)",
                    "hex": chunk.hex(),
                    "length": length
                })
            elif wire_type == 5:  # 32-bit (fixed32, float)
                if offset + 4 > total_len:
                    break
                val_bytes = data_bytes[offset:offset+4]
                offset += 4
                val_int = struct.unpack('<I', val_bytes)[0]
                fields.append({
                    "field": field_num,
                    "wire_type": "5 (32-bit)",
                    "hex": val_bytes.hex(),
                    "int32": val_int
                })
            else:
                # Unsupported wire type
                break
        except Exception:
            break

    return {
        "total_bytes": total_len,
        "fields_parsed": len(fields),
        "fields": fields
    }

# --- 3. CBOR (CONCISE BINARY OBJECT REPRESENTATION) DECODER ---
def decode_cbor_minimal(data_bytes: bytes) -> Dict[str, Any]:
    """
    Lightweight recursive parser for CBOR Major Types:
    0: unsigned int, 1: negative int, 2: byte string, 3: text string, 4: array, 5: map
    """
    def parse_item(offset: int) -> Tuple[Any, int]:
        if offset >= len(data_bytes):
            return None, offset
        b = data_bytes[offset]
        offset += 1
        major = b >> 5
        info = b & 0x1F

        def read_length(inf: int, off: int) -> Tuple[int, int]:
            if inf < 24:
                return inf, off
            elif inf == 24:
                val = data_bytes[off]
                return val, off + 1
            elif inf == 25:
                val = struct.unpack('>H', data_bytes[off:off+2])[0]
                return val, off + 2
            elif inf == 26:
                val = struct.unpack('>I', data_bytes[off:off+4])[0]
                return val, off + 4
            elif inf == 27:
                val = struct.unpack('>Q', data_bytes[off:off+8])[0]
                return val, off + 8
            return 0, off

        val_len, offset = read_length(info, offset)

        if major == 0:  # Unsigned integer
            return val_len, offset
        elif major == 1:  # Negative integer
            return -1 - val_len, offset
        elif major == 2:  # Byte string
            chunk = data_bytes[offset:offset+val_len]
            return f"h'{chunk.hex()}'", offset + val_len
        elif major == 3:  # UTF-8 text string
            chunk = data_bytes[offset:offset+val_len]
            return chunk.decode('utf-8', errors='replace'), offset + val_len
        elif major == 4:  # Array
            arr = []
            for _ in range(val_len):
                sub, offset = parse_item(offset)
                arr.append(sub)
            return arr, offset
        elif major == 5:  # Map
            obj = {}
            for _ in range(val_len):
                k, offset = parse_item(offset)
                v, offset = parse_item(offset)
                obj[str(k)] = v
            return obj, offset
        elif major == 7:  # Float / simple
            if info == 20:
                return False, offset
            elif info == 21:
                return True, offset
            elif info == 22:
                return None, offset
            return f"simple({info})", offset
        return f"unhandled(major={major})", offset

    try:
        parsed, final_off = parse_item(0)
        return {
            "success": True,
            "parsed_cbor": parsed,
            "bytes_consumed": final_off
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# --- 4. BASE85 / ASCII85 / Z85 ---
def decode_ascii85(text: str) -> Optional[str]:
    """Decodes Adobe Ascii85 (RFC 1924 / Adobe variant)."""
    clean = text.strip()
    try:
        if clean.startswith("<~") and clean.endswith("~>"):
            return base64.a85decode(clean.encode('ascii'), adobe=True).decode('utf-8', errors='replace')
        else:
            return base64.a85decode(clean.encode('ascii'), adobe=False).decode('utf-8', errors='replace')
    except Exception:
        try:
            return base64.b85decode(clean.encode('ascii')).decode('utf-8', errors='replace')
        except Exception:
            return None


def encode_ascii85(text: str) -> str:
    raw = text.encode('utf-8')
    return base64.a85encode(raw, adobe=True).decode('ascii')

# ZeroMQ Z85 alphabet
Z85_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#"

def decode_z85(text: str) -> Optional[str]:
    """Decodes ZeroMQ Z85 string."""
    clean = text.strip().replace(" ", "")
    if len(clean) % 5 != 0:
        return None
    char_to_val = {c: i for i, c in enumerate(Z85_CHARS)}
    if any(c not in char_to_val for c in clean):
        return None

    byte_arr = []
    for i in range(0, len(clean), 5):
        chunk = clean[i:i+5]
        val = 0
        for char in chunk:
            val = val * 85 + char_to_val[char]
        for shift in [24, 16, 8, 0]:
            byte_arr.append((val >> shift) & 0xFF)

    try:
        return bytes(byte_arr).decode('utf-8', errors='replace')
    except Exception:
        return None

# --- 5. UNICODE BRAILLE DECODER ---
BRAILLE_MAP = {
    '⠁': 'A', '⠃': 'B', '⠉': 'C', '⠙': 'D', '⠑': 'E', '⠋': 'F', '⠛': 'G',
    '⠓': 'H', '⠊': 'I', '⠚': 'J', '⠅': 'K', '⠇': 'L', '⠍': 'M', '⠝': 'N',
    '⠕': 'O', '⠏': 'P', '⠟': 'Q', '⠗': 'R', '⠎': 'S', '⠞': 'T', '⠥': 'U',
    '⠧': 'V', '⠺': 'W', '⠭': 'X', '⠽': 'Y', '⠵': 'Z', '⠀': ' '
}

def decode_braille(text: str) -> Optional[str]:
    """Decodes Unicode Braille characters (U+2800 to U+28FF)."""
    has_braille = any('\u2800' <= c <= '\u28FF' for c in text)
    if not has_braille:
        return None

    res = []
    for c in text:
        if c in BRAILLE_MAP:
            res.append(BRAILLE_MAP[c])
        elif c in ' \n\r\t':
            res.append(c)
        else:
            res.append(c)
    return ''.join(res)
