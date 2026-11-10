import math
import re
from collections import Counter, defaultdict
from typing import Dict, List, Tuple, Any
from app.detectors.statistics import ENGLISH_LETTER_FREQS, calculate_index_of_coincidence
from app.ciphers.classical import vigenere_decrypt
from app.scoring.metrics import score_candidate

def find_repeated_substrings(text: str, min_len: int = 3, max_len: int = 5) -> Dict[str, List[int]]:
    """Finds repeated n-grams and their 0-indexed positions in text."""
    clean = re.sub(r'[^A-Za-z]', '', text).upper()
    repeats: Dict[str, List[int]] = defaultdict(list)
    
    for l in range(min_len, max_len + 1):
        for i in range(len(clean) - l + 1):
            sub = clean[i:i+l]
            repeats[sub].append(i)
            
    # Filter to only substrings appearing at least twice
    return {k: v for k, v in repeats.items() if len(v) >= 2}

def kasiski_examination(text: str, max_key_len: int = 16) -> Dict[str, Any]:
    """
    Performs Kasiski examination to estimate Vigenère key length.
    Finds repeated substrings, computes spacing differences,
    and calculates greatest common divisors and factor frequencies.
    """
    clean = re.sub(r'[^A-Za-z]', '', text).upper()
    n = len(clean)
    if n < 20:
        return {
            "success": False,
            "message": "Ciphertext too short for reliable Kasiski examination (minimum 20 alphabetic chars required)."
        }

    repeats = find_repeated_substrings(clean, min_len=3, max_len=4)
    all_spacings: List[int] = []
    ngram_spacings: List[Dict[str, Any]] = []

    for sub, positions in list(repeats.items())[:20]:
        spacings = [positions[i+1] - positions[i] for i in range(len(positions) - 1)]
        all_spacings.extend(spacings)
        ngram_spacings.append({
            "ngram": sub,
            "occurrences": len(positions),
            "positions": positions[:5],
            "spacings": spacings[:5]
        })

    # Factor frequencies between 2 and max_key_len
    factor_counts: Counter = Counter()
    for sp in all_spacings:
        for factor in range(2, max_key_len + 1):
            if sp % factor == 0:
                factor_counts[factor] += 1

    ranked_key_lengths = factor_counts.most_common(5)

    # Section 4.2 Pairwise GCD Matrix across all distance tuples
    gcd_counts: Counter = Counter()
    for i in range(len(all_spacings)):
        for j in range(i + 1, len(all_spacings)):
            g = math.gcd(all_spacings[i], all_spacings[j])
            if 2 <= g <= max_key_len:
                gcd_counts[g] += 1

    gcd_matrix_top = [
        {"key_length": k, "gcd_pairs_count": count} for k, count in gcd_counts.most_common(5)
    ]

    # Friedman test key length estimation
    ic = calculate_index_of_coincidence(clean)
    friedman_k = 0.0
    denominator = (n - 1) * ic - 0.0385 * n + 0.0667
    if denominator > 0:
        friedman_k = round((0.027 * n) / denominator, 2)

    return {
        "success": True,
        "total_letters": n,
        "index_of_coincidence": round(ic, 4),
        "friedman_estimated_key_length": friedman_k,
        "repeated_ngrams_count": len(repeats),
        "sample_ngrams": ngram_spacings[:8],
        "top_candidate_key_lengths": [
            {"key_length": k, "factor_votes": votes} for k, votes in ranked_key_lengths
        ],
        "gcd_matrix_candidates": gcd_matrix_top
    }


def solve_vigenere_by_frequency_alignment(text: str, key_length: int) -> Dict[str, Any]:
    """
    Recovers the Vigenère key for a given key length by matching
    each coset's letter frequencies against English letter frequencies (Chi-Square minimization).
    """
    clean_alpha = [c.upper() for c in text if c.isalpha()]
    n = len(clean_alpha)
    if n < key_length * 3:
        return {"success": False, "error": "Insufficient text for coset frequency analysis"}

    recovered_key_chars = []
    coset_details = []

    for coset_idx in range(key_length):
        coset = [clean_alpha[i] for i in range(coset_idx, n, key_length)]
        coset_len = len(coset)
        counts = Counter(coset)

        best_shift = 0
        best_chi2 = float('inf')

        for shift in range(26):
            chi2 = 0.0
            for letter, prob in ENGLISH_LETTER_FREQS.items():
                target_char = chr((ord(letter) - ord('A') + shift) % 26 + ord('A'))
                observed = counts.get(target_char, 0)
                expected = coset_len * prob
                chi2 += ((observed - expected) ** 2) / expected
            
            if chi2 < best_chi2:
                best_chi2 = chi2
                best_shift = shift

        recovered_key_chars.append(chr(ord('A') + best_shift))
        coset_details.append({
            "coset": coset_idx,
            "best_shift": best_shift,
            "key_char": chr(ord('A') + best_shift),
            "chi2": round(best_chi2, 2)
        })

    recovered_key = ''.join(recovered_key_chars)
    decrypted = vigenere_decrypt(text, recovered_key)
    scored = score_candidate(decrypted, "Vigenère Automated Frequency Solver", f"Key='{recovered_key}'")

    return {
        "success": True,
        "recovered_key": recovered_key,
        "key_length": key_length,
        "decrypted_plaintext": decrypted,
        "candidate_score": scored.score,
        "coset_analysis": coset_details
    }
