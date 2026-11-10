import base64
import binascii
import urllib.parse
import html
import re
from typing import Optional, Tuple, List

# Base58 Bitcoin alphabet
B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

# Morse Code Dictionary
MORSE_MAP = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', ' ': '/'
}
REVERSE_MORSE = {v: k for k, v in MORSE_MAP.items() if k != ' '}
REVERSE_MORSE['/'] = ' '

# --- BASE 64 ---
def decode_base64(data: str) -> Optional[str]:
    """Decodes standard or URL-safe Base64."""
    try:
        clean = data.strip().replace(" ", "").replace("\n", "").replace("\r", "")
        # Add padding if needed
        missing_padding = len(clean) % 4
        if missing_padding:
            clean += '=' * (4 - missing_padding)
        # Try standard
        try:
            decoded = base64.b64decode(clean, validate=True)
            return decoded.decode('utf-8', errors='replace')
        except Exception:
            # Try urlsafe
            decoded = base64.urlsafe_b64decode(clean)
            return decoded.decode('utf-8', errors='replace')
    except Exception:
        return None

def encode_base64(data: str, url_safe: bool = False) -> str:
    b = data.encode('utf-8')
    return base64.urlsafe_b64encode(b).decode('utf-8') if url_safe else base64.b64encode(b).decode('utf-8')

# --- BASE 32 ---
def decode_base32(data: str) -> Optional[str]:
    """Decodes RFC 4648 Base32."""
    try:
        clean = data.strip().upper().replace(" ", "")
        missing_padding = len(clean) % 8
        if missing_padding:
            clean += '=' * (8 - missing_padding)
        decoded = base64.b32decode(clean)
        return decoded.decode('utf-8', errors='replace')
    except Exception:
        return None

def encode_base32(data: str) -> str:
    return base64.b32encode(data.encode('utf-8')).decode('utf-8')

# --- BASE 58 ---
def decode_base58(data: str) -> Optional[str]:
    """Decodes Base58 (Bitcoin alphabet)."""
    try:
        clean = data.strip()
        num = 0
        for char in clean:
            idx = B58_ALPHABET.find(char)
            if idx == -1:
                return None
            num = num * 58 + idx
        # Convert to bytes
        res = []
        while num > 0:
            res.append(num % 256)
            num //= 256
        res.reverse()
        # Add leading zeroes
        pad = 0
        for char in clean:
            if char == '1':
                pad += 1
            else:
                break
        raw_bytes = bytes([0] * pad + res)
        return raw_bytes.decode('utf-8', errors='replace')
    except Exception:
        return None

def encode_base58(data: str) -> str:
    b = data.encode('utf-8')
    num = int.from_bytes(b, byteorder='big')
    res = []
    while num > 0:
        res.append(B58_ALPHABET[num % 58])
        num //= 58
    res.reverse()
    pad = 0
    for byte in b:
        if byte == 0:
            pad += 1
        else:
            break
    return ('1' * pad) + ''.join(res)

# --- HEXADECIMAL ---
def decode_hex(data: str) -> Optional[str]:
    """Decodes formatted or raw Hex."""
    try:
        clean = re.sub(r'0x|0X|[\s:,]', '', data.strip())
        if len(clean) % 2 != 0:
            return None
        decoded = bytes.fromhex(clean)
        return decoded.decode('utf-8', errors='replace')
    except Exception:
        return None

def encode_hex(data: str, prefix_0x: bool = False, spaced: bool = False) -> str:
    h = data.encode('utf-8').hex()
    if spaced:
        parts = [h[i:i+2] for i in range(0, len(h), 2)]
        return ' '.join(parts)
    if prefix_0x:
        return "0x" + h
    return h

# --- BINARY (8-BIT) ---
def decode_binary(data: str) -> Optional[str]:
    """Decodes continuous or space-separated binary bits."""
    try:
        clean = data.strip().replace(" ", "").replace("\n", "").replace("\r", "")
        if not clean or any(c not in "01" for c in clean):
            return None
        if len(clean) % 8 != 0:
            # Maybe uneven, check if space-delimited had valid 8-bit bytes
            parts = data.strip().split()
            if all(len(p) <= 8 and all(c in "01" for c in p) for p in parts):
                byte_vals = [int(p, 2) for p in parts]
                return bytes(byte_vals).decode('utf-8', errors='replace')
            return None
        byte_vals = [int(clean[i:i+8], 2) for i in range(0, len(clean), 8)]
        return bytes(byte_vals).decode('utf-8', errors='replace')
    except Exception:
        return None

def encode_binary(data: str, spaced: bool = True) -> str:
    bytes_arr = data.encode('utf-8')
    bins = [f"{b:08b}" for b in bytes_arr]
    return ' '.join(bins) if spaced else ''.join(bins)

# --- DECIMAL / ASCII CODES ---
def decode_decimal_ascii(data: str) -> Optional[str]:
    """Decodes decimal integers representing ASCII codes (e.g., 72 101 108 108 111)."""
    try:
        parts = re.split(r'[\s,]+', data.strip())
        if not parts or not all(p.isdigit() for p in parts if p):
            return None
        bytes_arr = []
        for p in parts:
            if not p:
                continue
            val = int(p)
            if 0 <= val <= 255:
                bytes_arr.append(val)
            else:
                return None
        if not bytes_arr:
            return None
        return bytes(bytes_arr).decode('utf-8', errors='replace')
    except Exception:
        return None

def encode_decimal_ascii(data: str, delimiter: str = " ") -> str:
    return delimiter.join(str(b) for b in data.encode('utf-8'))

# --- URL / PERCENT ENCODING ---
def decode_url(data: str) -> Optional[str]:
    """Decodes percent-encoded URLs."""
    try:
        if '%' not in data:
            return None
        decoded = urllib.parse.unquote(data)
        return decoded if decoded != data else None
    except Exception:
        return None

def encode_url(data: str) -> str:
    return urllib.parse.quote(data)

# --- HTML ENTITIES ---
def decode_html_entities(data: str) -> Optional[str]:
    """Decodes HTML entities (&amp;, &#65;, etc.)."""
    try:
        if '&' not in data:
            return None
        decoded = html.unescape(data)
        return decoded if decoded != data else None
    except Exception:
        return None

# --- UNICODE ESCAPES ---
def decode_unicode_escapes(data: str) -> Optional[str]:
    """Decodes \\uXXXX and \\UXXXXXXXX sequences."""
    try:
        if '\\u' not in data and '\\U' not in data:
            return None
        return data.encode('utf-8').decode('unicode_escape')
    except Exception:
        return None

# --- UTF-16 BYTE INTERPRETATIONS ---
def decode_utf16_le(data_bytes: bytes) -> Optional[str]:
    try:
        return data_bytes.decode('utf-16le')
    except Exception:
        return None

def decode_utf16_be(data_bytes: bytes) -> Optional[str]:
    try:
        return data_bytes.decode('utf-16be')
    except Exception:
        return None

# --- MORSE CODE ---
def decode_morse(data: str) -> Optional[str]:
    """Decodes International Morse Code."""
    try:
        stripped = data.strip()
        if not stripped or any(c not in ".-/ \t\n" for c in stripped):
            return None
        words = stripped.split('/')
        decoded_words = []
        for word in words:
            letters = word.strip().split()
            decoded_letters = []
            for letter in letters:
                if letter in REVERSE_MORSE:
                    decoded_letters.append(REVERSE_MORSE[letter])
                else:
                    return None
            decoded_words.append(''.join(decoded_letters))
        result = ' '.join(decoded_words).strip()
        return result if result else None
    except Exception:
        return None

def encode_morse(data: str) -> str:
    encoded = []
    for c in data.upper():
        if c in MORSE_MAP:
            encoded.append(MORSE_MAP[c])
    return ' '.join(encoded)
