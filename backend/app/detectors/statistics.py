import math
from collections import Counter
from typing import Dict, List, Tuple, Any

from app.models.schemas import StatisticalMetrics

# Standard English letter frequencies (normalized to sum to 1.0)
ENGLISH_LETTER_FREQS: Dict[str, float] = {
    'A': 0.08167, 'B': 0.01492, 'C': 0.02782, 'D': 0.04253, 'E': 0.12702,
    'F': 0.02228, 'G': 0.02015, 'H': 0.06094, 'I': 0.06966, 'J': 0.00153,
    'K': 0.00772, 'L': 0.04025, 'M': 0.02406, 'N': 0.06749, 'O': 0.07507,
    'P': 0.01929, 'Q': 0.00095, 'R': 0.05987, 'S': 0.06327, 'T': 0.09056,
    'U': 0.02758, 'V': 0.00978, 'W': 0.02360, 'X': 0.00150, 'Y': 0.01974,
    'Z': 0.00074
}

# Base58 Bitcoin alphabet characters
BASE58_CHARS = set("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")
BASE32_CHARS = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=")
BASE64_CHARS = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=")
BASE64_URL_CHARS = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=")
HEX_CHARS = set("0123456789abcdefABCDEF")
BIN_CHARS = set("01 \t\r\n")

def calculate_shannon_entropy(data: str | bytes) -> float:
    """Calculates Shannon Entropy: H = -sum(p_i * log2(p_i))."""
    if not data:
        return 0.0
    
    if isinstance(data, str):
        data_bytes = data.encode('utf-8', errors='replace')
    else:
        data_bytes = data

    length = len(data_bytes)
    if length == 0:
        return 0.0

    counts = Counter(data_bytes)
    entropy = 0.0
    for count in counts.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)

def calculate_printable_ratio(text: str) -> float:
    """Computes percentage of printable ASCII characters."""
    if not text:
        return 0.0
    printable_count = sum(1 for c in text if (32 <= ord(c) <= 126) or c in ('\n', '\r', '\t'))
    return round(printable_count / len(text), 4)

def calculate_index_of_coincidence(text: str) -> float:
    """
    Computes Index of Coincidence (IC):
    IC = sum(f_i * (f_i - 1)) / (N * (N - 1))
    Returns 0.0 if fewer than 2 alphabetic characters.
    """
    letters = [c.upper() for c in text if 'A' <= c.upper() <= 'Z']
    n = len(letters)
    if n < 2:
        return 0.0
    
    counts = Counter(letters)
    numerator = sum(f * (f - 1) for f in counts.values())
    denominator = n * (n - 1)
    return round(numerator / denominator, 4)

def calculate_chi_squared(text: str) -> float:
    """
    Computes Chi-squared statistic against standard English letter frequencies:
    chi^2 = sum((Observed - Expected)^2 / Expected)
    """
    letters = [c.upper() for c in text if 'A' <= c.upper() <= 'Z']
    n = len(letters)
    if n == 0:
        return 999.0
    
    counts = Counter(letters)
    chi2 = 0.0
    for letter, prob in ENGLISH_LETTER_FREQS.items():
        observed = counts.get(letter, 0)
        expected = n * prob
        chi2 += ((observed - expected) ** 2) / expected
    return round(chi2, 3)

def detect_character_sets(text: str) -> List[str]:
    """Bounds text into detected mathematical character sets."""
    if not text:
        return []
    
    detected: List[str] = []
    stripped = text.strip()
    
    # Check Binary
    cleaned_bin = stripped.replace(" ", "").replace("\n", "").replace("\r", "")
    if cleaned_bin and all(c in "01" for c in cleaned_bin):
        detected.append("BINARY")
        
    # Check Hex
    cleaned_hex = stripped.replace(" ", "").replace("0x", "").replace("0X", "").replace(":", "")
    if cleaned_hex and all(c in HEX_CHARS for c in cleaned_hex):
        detected.append("HEXADECIMAL")
        
    # Check Base64
    cleaned_b64 = stripped.replace(" ", "").replace("\n", "").replace("\r", "")
    if cleaned_b64 and len(cleaned_b64) >= 4 and all(c in BASE64_CHARS for c in cleaned_b64):
        detected.append("BASE64")
    elif cleaned_b64 and len(cleaned_b64) >= 4 and all(c in BASE64_URL_CHARS for c in cleaned_b64):
        detected.append("BASE64_URL")

    # Check Base32
    if cleaned_b64 and len(cleaned_b64) >= 8 and all(c in BASE32_CHARS for c in cleaned_b64):
        detected.append("BASE32")

    # Check Base58
    if cleaned_b64 and all(c in BASE58_CHARS for c in cleaned_b64):
        detected.append("BASE58")

    # Check Decimal / Numbers
    words = stripped.split()
    if words and all(w.isdigit() for w in words):
        detected.append("DECIMAL_CODES")

    # Check Morse Code
    morse_chars = set(".-/ \t\n")
    if stripped and all(c in morse_chars for c in stripped) and any(c in ".-" for c in stripped):
        detected.append("MORSE_CODE")

    # Check Printable ASCII
    if all(32 <= ord(c) <= 126 or c in "\n\r\t" for c in text):
        detected.append("PRINTABLE_ASCII")

    return detected

def extract_statistical_metrics(text: str) -> StatisticalMetrics:
    """Comprehensive statistical metric extraction."""
    has_null = '\x00' in text
    pure_ascii = all(ord(c) < 128 for c in text)
    
    return StatisticalMetrics(
        length=len(text),
        shannon_entropy=calculate_shannon_entropy(text),
        printable_ratio=calculate_printable_ratio(text),
        index_of_coincidence=calculate_index_of_coincidence(text),
        chi_squared_english=calculate_chi_squared(text),
        detected_charsets=detect_character_sets(text),
        has_null_bytes=has_null,
        is_pure_ascii=pure_ascii
    )

# Multilingual IC Benchmarks (suggestion-v2.md Section 4.1)
MULTILINGUAL_IC_BENCHMARKS = {
    "English": 0.0667,
    "German": 0.0762,
    "Spanish": 0.0770,
    "Uniform_Polyalphabetic_Random": 0.0385
}

def analyze_multilingual_ic(text: str) -> Dict[str, Any]:
    """
    Computes text IC and compares against standardized multilingual benchmark values.
    Returns delta distances and likelihood rankings.
    """
    observed_ic = calculate_index_of_coincidence(text)
    rankings = []
    
    for lang, benchmark in MULTILINGUAL_IC_BENCHMARKS.items():
        delta = abs(observed_ic - benchmark)
        # Convert delta into confidence percentage
        confidence = max(0.0, 100.0 - (delta * 1500.0))
        rankings.append({
            "language": lang,
            "benchmark_ic": benchmark,
            "delta": round(delta, 4),
            "match_confidence": round(confidence, 1)
        })
        
    rankings.sort(key=lambda x: x["delta"])
    
    return {
        "observed_ic": observed_ic,
        "closest_profile": rankings[0]["language"],
        "is_polyalphabetic_or_random": (observed_ic < 0.0500),
        "language_alignment": rankings
    }

