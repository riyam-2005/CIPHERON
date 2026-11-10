import re
import math
from typing import Set, Dict, Tuple
from app.models.schemas import CandidatePlaintext, ScoreComponents
from app.detectors.statistics import (
    calculate_shannon_entropy,
    calculate_printable_ratio,
    calculate_index_of_coincidence
)

# Standard English Bigram frequencies (top common bigrams)
COMMON_BIGRAMS: Set[str] = {
    "TH", "HE", "IN", "ER", "AN", "RE", "ED", "ON", "ES", "ST",
    "EN", "AT", "TO", "NT", "HA", "ND", "OU", "EA", "NG", "AS",
    "OR", "TI", "IS", "ET", "IT", "AR", "TE", "SE", "HI", "OF"
}

# Standard English Trigram frequencies
COMMON_TRIGRAMS: Set[str] = {
    "THE", "AND", "THA", "ENT", "ING", "ION", "NDE", "HAS", "NCE", "EDT",
    "TIS", "OFT", "STH", "MEN", "FOR", "ALL", "NOT", "YOU", "ARE", "HIS"
}

# Curated English dictionary & CTF keywords for scoring
ENGLISH_WORD_LIST: Set[str] = {
    "THE", "BE", "TO", "OF", "AND", "A", "IN", "THAT", "HAVE", "I",
    "IT", "FOR", "NOT", "ON", "WITH", "HE", "AS", "YOU", "DO", "AT",
    "THIS", "BUT", "HIS", "BY", "FROM", "THEY", "WE", "SAY", "HER", "SHE",
    "OR", "AN", "WILL", "MY", "ONE", "ALL", "WOULD", "THERE", "THEIR", "WHAT",
    "SO", "UP", "OUT", "IF", "ABOUT", "WHO", "GET", "WHICH", "GO", "ME",
    "WHEN", "MAKE", "CAN", "LIKE", "TIME", "NO", "JUST", "HIM", "KNOW", "TAKE",
    "PEOPLE", "INTO", "YEAR", "YOUR", "GOOD", "SOME", "COULD", "THEM", "SEE", "OTHER",
    "THAN", "THEN", "NOW", "LOOK", "ONLY", "COME", "ITS", "OVER", "THINK", "ALSO",
    "BACK", "AFTER", "USE", "TWO", "HOW", "OUR", "WORK", "FIRST", "WELL", "WAY",
    "EVEN", "NEW", "WANT", "BECAUSE", "ANY", "THESE", "GIVE", "DAY", "MOST", "US",
    "HELLO", "WORLD", "CIPHER", "SECRET", "FLAG", "KEY", "ADMIN", "ROOT", "USER",
    "PASSWORD", "SYSTEM", "SECURITY", "TEST", "MESSAGE", "SERVER", "NETWORK", "ACCESS",
    "DEVICE", "HARDWARE", "CIPHERON", "CODE", "ENCODE", "DECODE", "ENCRYPT", "DECRYPT",
    "ATTACK", "TOKEN", "SESSION", "DATA", "PAYLOAD", "BUFFER", "PACKET", "CLIENT",
    "FOUND", "RESULT", "FOUNDED", "STRING", "BINARY", "PROTOCOL", "AGENT", "STATUS"
}

def compute_ngram_score(text: str) -> float:
    """Evaluates text against top bigrams and trigrams."""
    letters = re.sub(r'[^A-Za-z]', '', text).upper()
    n = len(letters)
    if n < 2:
        return 0.0
    
    bigram_hits = sum(1 for i in range(n - 1) if letters[i:i+2] in COMMON_BIGRAMS)
    total_bigrams = n - 1
    bigram_ratio = bigram_hits / total_bigrams if total_bigrams > 0 else 0.0
    
    trigram_ratio = 0.0
    if n >= 3:
        trigram_hits = sum(1 for i in range(n - 2) if letters[i:i+3] in COMMON_TRIGRAMS)
        total_trigrams = n - 2
        trigram_ratio = trigram_hits / total_trigrams if total_trigrams > 0 else 0.0
        
    return min(1.0, (bigram_ratio * 0.6) + (trigram_ratio * 0.4))

def compute_dict_score(text: str) -> float:
    """Computes ratio of text covered by recognized dictionary words and English alphabet ratio."""
    if not text:
        return 0.0
    words = re.findall(r'[A-Za-z]{2,}', text.upper())
    if not words:
        return 0.0
    matched_words = [w for w in words if w in ENGLISH_WORD_LIST]
    if not matched_words:
        return 0.0
    
    # If only 1 small 2-letter word matched in a string with junk, penalize
    if len(matched_words) == 1 and len(matched_words[0]) <= 2 and len(text) > 4:
        return 0.10
        
    matched_chars = sum(len(w) for w in matched_words)
    text_coverage = matched_chars / max(len(text), 1)
    word_ratio = len(matched_words) / len(words)
    alpha_ratio = sum(1 for c in text if c.isalpha() or c in ' \n\r\t.,!?-\'":;') / max(len(text), 1)
    
    dict_quality = (0.6 * text_coverage + 0.4 * word_ratio) * (alpha_ratio ** 2)
    return min(1.0, max(0.0, dict_quality))

def compute_ic_score(text: str) -> float:
    """Scores proximity of text IC to English constant 0.0667."""
    letters = [c for c in text if c.isalpha()]
    if len(letters) < 6:
        return 0.3  # Insufficient sample for reliable IC
    ic = calculate_index_of_coincidence(text)
    target_ic = 0.0667
    dist = abs(ic - target_ic)
    return max(0.0, 1.0 - (dist / 0.035))

def score_candidate(text: str, transformation: str, param: str = None) -> CandidatePlaintext:
    """
    Evaluates candidate using FR-4.1 formula:
    Score(C) = w1 * S_ngram + w2 * S_dict + w3 * S_printable + w4 * S_ic - P_entropy
    Returns 0.0 to 100.0 scaled score.
    """
    if not text:
        return CandidatePlaintext(
            text="",
            transformation=transformation,
            parameter=param,
            score=0.0,
            score_components=ScoreComponents(
                ngram_score=0.0, dict_score=0.0, printable_score=0.0,
                ic_score=0.0, entropy_penalty=0.0, raw_total=0.0
            )
        )
    
    # Check for binary control characters and weird non-ascii bytes
    unprintable_controls = sum(1 for c in text if ord(c) < 32 and c not in '\n\r\t')
    printable_ratio = calculate_printable_ratio(text)
    alpha_ratio = sum(1 for c in text if c.isalpha() or c in ' \n\r\t.,!?-\'":;') / max(len(text), 1)
    
    s_ngram = compute_ngram_score(text)
    s_dict = compute_dict_score(text)
    s_printable = printable_ratio
    s_ic = compute_ic_score(text)
    
    # Entropy penalty
    entropy = calculate_shannon_entropy(text)
    p_entropy = 0.0
    if len(text) > 10:
        if entropy > 6.0:
            p_entropy = (entropy - 6.0) * 0.15
        elif entropy < 1.5:
            p_entropy = (1.5 - entropy) * 0.10

    # Weights: w1=0.35, w2=0.35, w3=0.15, w4=0.15
    w1, w2, w3, w4 = 0.35, 0.35, 0.15, 0.15
    raw_total = (w1 * s_ngram) + (w2 * s_dict) + (w3 * s_printable) + (w4 * s_ic) - p_entropy
    
    # Severely penalize non-printable binary garbage or symbol-dominated gibberish
    if unprintable_controls > 0 or printable_ratio < 0.85:
        penalty_factor = (printable_ratio ** 3) * (0.1 if unprintable_controls > 0 else 0.4)
        raw_total *= penalty_factor
    elif alpha_ratio < 0.6 and s_dict < 0.5:
        raw_total *= (alpha_ratio ** 2)
        
    normalized_score = max(0.0, min(100.0, raw_total * 100.0))

    
    # Check for deterministic structural matches (JSON, XML, CTF flag)
    verified = None
    stripped = text.strip()
    if (stripped.startswith("{") and stripped.endswith("}")) or (stripped.startswith("[") and stripped.endswith("]")):
        verified = "VALID_JSON"
        normalized_score = min(100.0, normalized_score + 15.0)
    elif stripped.startswith("<") and stripped.endswith(">"):
        verified = "STRUCTURED_XML_HTML"
        normalized_score = min(100.0, normalized_score + 10.0)
    elif re.search(r'(flag|FLAG)\{[^}]+\}', text):
        verified = "CTF_FLAG_FORMAT"
        normalized_score = min(100.0, normalized_score + 25.0)

    components = ScoreComponents(
        ngram_score=round(s_ngram * 100, 2),
        dict_score=round(s_dict * 100, 2),
        printable_score=round(s_printable * 100, 2),
        ic_score=round(s_ic * 100, 2),
        entropy_penalty=round(p_entropy * 100, 2),
        raw_total=round(raw_total, 4)
    )

    return CandidatePlaintext(
        text=text,
        transformation=transformation,
        parameter=param,
        score=round(normalized_score, 2),
        score_components=components,
        verified_structure=verified
    )
