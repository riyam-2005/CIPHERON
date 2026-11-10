import math
import re
from typing import List, Dict, Optional, Tuple
from app.scoring.metrics import score_candidate
from app.models.schemas import CandidatePlaintext

# --- CAESAR & ROT CIPHERS ---
def caesar_shift(text: str, shift: int) -> str:
    """Shifts alphabetic characters by shift mod 26."""
    result = []
    for char in text:
        if 'a' <= char <= 'z':
            result.append(chr((ord(char) - ord('a') + shift) % 26 + ord('a')))
        elif 'A' <= char <= 'Z':
            result.append(chr((ord(char) - ord('A') + shift) % 26 + ord('A')))
        else:
            result.append(char)
    return ''.join(result)

def solve_caesar_bruteforce(text: str) -> List[CandidatePlaintext]:
    """Evaluates all 25 non-trivial Caesar shifts (1-25) and scores them."""
    candidates = []
    for shift in range(1, 26):
        # Decrypting with shift k is shifting by (26 - k)
        decrypted = caesar_shift(text, 26 - shift)
        cand = score_candidate(decrypted, "Caesar Cipher", f"Shift {shift}")
        candidates.append(cand)
    candidates.sort(key=lambda c: c.score, reverse=True)
    return candidates

def rot13(text: str) -> str:
    return caesar_shift(text, 13)

def rot5(text: str) -> str:
    """Rotates digits 0-9 by 5."""
    res = []
    for c in text:
        if '0' <= c <= '9':
            res.append(chr((ord(c) - ord('0') + 5) % 10 + ord('0')))
        else:
            res.append(c)
    return ''.join(res)

def rot18(text: str) -> str:
    """ROT13 on letters + ROT5 on digits."""
    return rot5(rot13(text))

def rot47(text: str) -> str:
    """Rotates ASCII printable characters 33 (!) to 126 (~) by 47."""
    res = []
    for c in text:
        code = ord(c)
        if 33 <= code <= 126:
            res.append(chr(33 + ((code - 33 + 47) % 94)))
        else:
            res.append(c)
    return ''.join(res)

# --- ATBASH CIPHER ---
def atbash(text: str) -> str:
    """Reverses alphabet: A<->Z, B<->Y, etc."""
    res = []
    for c in text:
        if 'a' <= c <= 'z':
            res.append(chr(ord('z') - (ord(c) - ord('a'))))
        elif 'A' <= c <= 'Z':
            res.append(chr(ord('Z') - (ord(c) - ord('A'))))
        else:
            res.append(c)
    return ''.join(res)

# --- AFFINE CIPHER ---
# gcd(a, 26) == 1 => valid 'a' values in mod 26: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25
COPRIME_26 = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]

def mod_inverse(a: int, m: int) -> Optional[int]:
    """Extended Euclidean algorithm to find modular inverse."""
    for x in range(1, m):
        if (a * x) % m == 1:
            return x
    return None

def affine_decrypt(text: str, a: int, b: int) -> Optional[str]:
    """D(y) = a^-1 * (y - b) mod 26."""
    a_inv = mod_inverse(a, 26)
    if a_inv is None:
        return None
    res = []
    for c in text:
        if 'a' <= c <= 'z':
            y = ord(c) - ord('a')
            res.append(chr((a_inv * (y - b)) % 26 + ord('a')))
        elif 'A' <= c <= 'Z':
            y = ord(c) - ord('A')
            res.append(chr((a_inv * (y - b)) % 26 + ord('A')))
        else:
            res.append(c)
    return ''.join(res)

def solve_affine_bruteforce(text: str) -> List[CandidatePlaintext]:
    """Evaluates all 312 valid (a, b) key pairs for Affine cipher."""
    candidates = []
    for a in COPRIME_26:
        for b in range(26):
            decrypted = affine_decrypt(text, a, b)
            if decrypted:
                cand = score_candidate(decrypted, "Affine Cipher", f"a={a}, b={b}")
                candidates.append(cand)
    candidates.sort(key=lambda c: c.score, reverse=True)
    return candidates[:10]  # Return top 10

# --- VIGENÈRE & BEAUFORT CIPHERS ---
def vigenere_decrypt(text: str, key: str) -> str:
    """Deciphers text using Vigenère key: P_i = (C_i - K_i) mod 26."""
    if not key:
        return text
    clean_key = [ord(c.upper()) - ord('A') for c in key if 'A' <= c.upper() <= 'Z']
    if not clean_key:
        return text
    
    res = []
    key_idx = 0
    k_len = len(clean_key)
    for c in text:
        if 'a' <= c <= 'z':
            shift = clean_key[key_idx % k_len]
            res.append(chr((ord(c) - ord('a') - shift) % 26 + ord('a')))
            key_idx += 1
        elif 'A' <= c <= 'Z':
            shift = clean_key[key_idx % k_len]
            res.append(chr((ord(c) - ord('A') - shift) % 26 + ord('A')))
            key_idx += 1
        else:
            res.append(c)
    return ''.join(res)

def beaufort_decrypt(text: str, key: str) -> str:
    """Beaufort cipher: P_i = (K_i - C_i) mod 26."""
    if not key:
        return text
    clean_key = [ord(c.upper()) - ord('A') for c in key if 'A' <= c.upper() <= 'Z']
    if not clean_key:
        return text
    
    res = []
    key_idx = 0
    k_len = len(clean_key)
    for c in text:
        if 'a' <= c <= 'z':
            k_val = clean_key[key_idx % k_len]
            res.append(chr((k_val - (ord(c) - ord('a'))) % 26 + ord('a')))
            key_idx += 1
        elif 'A' <= c <= 'Z':
            k_val = clean_key[key_idx % k_len]
            res.append(chr((k_val - (ord(c) - ord('A'))) % 26 + ord('A')))
            key_idx += 1
        else:
            res.append(c)
    return ''.join(res)

def estimate_vigenere_key_length_ic(text: str, max_len: int = 12) -> List[Tuple[int, float]]:
    """
    Estimates key length using Index of Coincidence of cosets.
    For true key length, average IC across cosets is close to ~0.0667.
    """
    letters = [c.upper() for c in text if 'A' <= c.upper() <= 'Z']
    n = len(letters)
    if n < 10:
        return []
    
    results = []
    for k in range(1, min(max_len + 1, n // 2)):
        coset_ics = []
        for i in range(k):
            coset = [letters[j] for j in range(i, n, k)]
            c_len = len(coset)
            if c_len > 1:
                from collections import Counter
                counts = Counter(coset)
                ic = sum(f * (f - 1) for f in counts.values()) / (c_len * (c_len - 1))
                coset_ics.append(ic)
        if coset_ics:
            avg_ic = sum(coset_ics) / len(coset_ics)
            results.append((k, avg_ic))
    results.sort(key=lambda x: abs(x[1] - 0.0667))
    return results

# Common keys to test for quick Vigenère recovery
COMMON_VIGENERE_KEYS = [
    "CIPHER", "SECRET", "KEY", "FLAG", "PASS", "CRYPTO", "ADMIN", "TEST",
    "CODE", "SECURITY", "LEMON", "VIGENERE", "PYTHON", "HIDDEN", "LOCK"
]

def solve_vigenere_common(text: str) -> List[CandidatePlaintext]:
    candidates = []
    for key in COMMON_VIGENERE_KEYS:
        dec = vigenere_decrypt(text, key)
        candidates.append(score_candidate(dec, "Vigenère Cipher", f"Key='{key}'"))
    candidates.sort(key=lambda c: c.score, reverse=True)
    return candidates[:5]

# --- RAIL FENCE TRANSPOSITION ---
def rail_fence_decrypt(text: str, rails: int) -> str:
    """Deciphers Rail Fence transposition with given number of rails."""
    if rails <= 1 or rails >= len(text):
        return text
    
    # Determine the pattern of rails for each index
    pattern = []
    r, step = 0, 1
    for _ in range(len(text)):
        pattern.append(r)
        if r == 0:
            step = 1
        elif r == rails - 1:
            step = -1
        r += step
        
    # Reconstruct string by rail counts
    rail_indices = [[] for _ in range(rails)]
    for idx, r_num in enumerate(pattern):
        rail_indices[r_num].append(idx)
        
    res = [''] * len(text)
    curr = 0
    for r_num in range(rails):
        for idx in rail_indices[r_num]:
            res[idx] = text[curr]
            curr += 1
            
    return ''.join(res)

def solve_rail_fence_bruteforce(text: str, max_rails: int = 10) -> List[CandidatePlaintext]:
    candidates = []
    limit = min(max_rails + 1, len(text))
    for rails in range(2, limit):
        decrypted = rail_fence_decrypt(text, rails)
        candidates.append(score_candidate(decrypted, "Rail Fence Transposition", f"Rails={rails}"))
    candidates.sort(key=lambda c: c.score, reverse=True)
    return candidates

# --- BACONIAN CIPHER ---
BACON_DICT_STANDARD = {
    'A': 'AAAAA', 'B': 'AAAAB', 'C': 'AAABA', 'D': 'AAABB', 'E': 'AABAA',
    'F': 'AABAB', 'G': 'AABBA', 'H': 'AABBB', 'I': 'ABAAA', 'J': 'ABAAA', # I/J shared
    'K': 'ABAAB', 'L': 'ABABA', 'M': 'ABABB', 'N': 'ABBAA', 'O': 'ABBAB',
    'P': 'ABBBA', 'Q': 'ABBBB', 'R': 'BAAAA', 'S': 'BAAAB', 'T': 'BAABA',
    'U': 'BAABB', 'V': 'BAABB', # U/V shared
    'W': 'BABAA', 'X': 'BABAB', 'Y': 'BABBA', 'Z': 'BABBB'
}
REVERSE_BACON = {v: k for k, v in BACON_DICT_STANDARD.items()}

def decode_baconian(text: str) -> Optional[str]:
    """Decodes Baconian cipher (e.g. AABAA ABABB ... or 0/1 equivalent)."""
    # Normalize: letters A/B or 0/1
    clean = re.sub(r'[^ABab01]', '', text).upper()
    clean = clean.replace('0', 'A').replace('1', 'B')
    if len(clean) < 5:
        return None
    
    decoded = []
    for i in range(0, len(clean) - 4, 5):
        chunk = clean[i:i+5]
        if chunk in REVERSE_BACON:
            decoded.append(REVERSE_BACON[chunk])
        else:
            return None
    return ''.join(decoded) if decoded else None

# --- XOR CIPHERS ---
def xor_bytes(data: bytes, key: bytes) -> bytes:
    k_len = len(key)
    return bytes(b ^ key[i % k_len] for i, b in enumerate(data))

def solve_single_byte_xor(data: bytes | str) -> List[CandidatePlaintext]:
    """Brute forces all 256 single-byte XOR keys."""
    if isinstance(data, str):
        # Check if hex string
        try:
            clean = re.sub(r'0x|[\s:]', '', data)
            if len(clean) % 2 == 0 and all(c in "0123456789abcdefABCDEF" for c in clean):
                raw_bytes = bytes.fromhex(clean)
            else:
                raw_bytes = data.encode('utf-8', errors='replace')
        except Exception:
            raw_bytes = data.encode('utf-8', errors='replace')
    else:
        raw_bytes = data
        
    candidates = []
    for key in range(256):
        decrypted_bytes = xor_bytes(raw_bytes, bytes([key]))
        try:
            decrypted_text = decrypted_bytes.decode('utf-8', errors='replace')
            cand = score_candidate(decrypted_text, "Single-byte XOR", f"Key 0x{key:02X} ({key})")
            if cand.score > 20.0:  # Only keep reasonable scores to reduce noise
                candidates.append(cand)
        except Exception:
            continue
            
    candidates.sort(key=lambda c: c.score, reverse=True)
    return candidates[:10]
