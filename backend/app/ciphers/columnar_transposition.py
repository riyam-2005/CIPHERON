import math
import itertools
from typing import List, Dict, Tuple, Any, Optional
from app.scoring.metrics import score_candidate, compute_dict_score



# Common English log-bigram frequency matrix (standard cryptanalysis table)
# Values represent log10(probability) roughly normalized
ENGLISH_COMMON_BIGRAMS = {
    "TH": 3.88, "HE": 3.68, "IN": 3.28, "ER": 3.27, "AN": 3.14, "RE": 3.12,
    "ON": 3.01, "AT": 2.98, "EN": 2.93, "ND": 2.91, "TI": 2.89, "ES": 2.87,
    "OR": 2.85, "TE": 2.84, "OF": 2.80, "ED": 2.76, "IS": 2.75, "IT": 2.74,
    "AL": 2.71, "AR": 2.68, "ST": 2.67, "TO": 2.66, "NT": 2.63, "NG": 2.60,
    "SE": 2.58, "HA": 2.55, "AS": 2.54, "OU": 2.52, "IO": 2.50, "LE": 2.48,
    "VE": 2.45, "CO": 2.44, "ME": 2.43, "DE": 2.40, "HI": 2.39, "RI": 2.38,
    "RO": 2.37, "IC": 2.36, "NE": 2.35, "EA": 2.34, "RA": 2.33, "CE": 2.32
}

def log_bigram_score(col_a: List[str], col_b: List[str]) -> float:
    """Computes adjacency log-score between two columns."""
    score = 0.0
    rows = min(len(col_a), len(col_b))
    for r in range(rows):
        bg = col_a[r] + col_b[r]
        if bg in ENGLISH_COMMON_BIGRAMS:
            score += ENGLISH_COMMON_BIGRAMS[bg]
        else:
            score -= 1.5  # Penalty for unlikely bigrams
    return score

def decrypt_columnar_transposition(ciphertext: str, key_order: List[int]) -> str:
    """
    Decrypts columnar transposition ciphertext given a column permutation order.
    key_order is 0-indexed list of column indices.
    """
    clean = "".join([c.upper() for c in ciphertext if c.isalnum() or c.isspace()])
    n = len(clean)
    num_cols = len(key_order)
    if num_cols == 0 or n == 0:
        return ciphertext

    num_rows = math.ceil(n / num_cols)
    num_full_cols = n % num_cols
    if num_full_cols == 0:
        num_full_cols = num_cols

    # Calculate length of each column in the grid
    col_lengths = [num_rows if i < num_full_cols else (num_rows - 1) for i in range(num_cols)]

    # Read ciphertext into columns according to key_order
    cols: Dict[int, List[str]] = {}
    curr_idx = 0
    for col_idx in key_order:
        c_len = col_lengths[col_idx]
        cols[col_idx] = list(clean[curr_idx:curr_idx + c_len])
        curr_idx += c_len

    # Read off grid row by row
    plaintext_chars = []
    for r in range(num_rows):
        for c in range(num_cols):
            if r < len(cols.get(c, [])):
                plaintext_chars.append(cols[c][r])

    return "".join(plaintext_chars)

def solve_columnar_transposition(ciphertext: str, max_cols: int = 8) -> Dict[str, Any]:
    """
    Automated Columnar Transposition Permutation Solver (suggestion-v2.md Section 4.3).
    Evaluates candidate column counts and uses permutation beam search to recover ordering.
    """
    clean_alpha = "".join([c.upper() for c in ciphertext if c.isalpha()])
    n = len(clean_alpha)
    if n < 8:
        return {
            "success": False,
            "error": "Ciphertext too short for columnar transposition solver (minimum 8 letters required)."
        }

    best_overall_score = -float('inf')
    best_candidate_text = ""
    best_col_count = 0
    best_permutation: List[int] = []
    candidates_list: List[Dict[str, Any]] = []

    for num_cols in range(2, min(max_cols + 1, n // 2 + 1)):
        num_rows = math.ceil(n / num_cols)
        num_full_cols = n % num_cols
        if num_full_cols == 0:
            num_full_cols = num_cols
        col_lengths = [num_rows if i < num_full_cols else (num_rows - 1) for i in range(num_cols)]

        # If num_cols <= 6, exhaustively evaluate permutations (<= 720)
        # If num_cols > 6, use beam search / heuristic
        permutations_to_test = []
        if num_cols <= 6:
            permutations_to_test = list(itertools.permutations(range(num_cols)))
        else:
            # Beam search heuristic: start with top pairs and expand
            identity = list(range(num_cols))
            permutations_to_test.append(identity)
            permutations_to_test.append(list(reversed(identity)))
            # Add random and transposed permutations
            for offset in range(1, num_cols):
                shifted = [(i + offset) % num_cols for i in range(num_cols)]
                permutations_to_test.append(shifted)

        col_best_score = -float('inf')
        col_best_text = ""
        col_best_perm: List[int] = []

        for perm in permutations_to_test:
            perm_list = list(perm)
            # Reconstruct columns
            cols = {}
            idx = 0
            for c_idx in perm_list:
                c_len = col_lengths[c_idx]
                cols[c_idx] = clean_alpha[idx:idx + c_len]
                idx += c_len

            # Calculate bigram score
            grid_text = []
            for r in range(num_rows):
                for c in range(num_cols):
                    if r < len(cols.get(c, "")):
                        grid_text.append(cols[c][r])
            dec_text = "".join(grid_text)

            dict_sc = compute_dict_score(dec_text)

            
            # Bigram adjacency score
            bg_sc = 0.0
            for r in range(num_rows):
                for c in range(num_cols - 1):
                    if r < len(cols.get(c, "")) and r < len(cols.get(c + 1, "")):
                        bg = cols[c][r] + cols[c + 1][r]
                        if bg in ENGLISH_COMMON_BIGRAMS:
                            bg_sc += ENGLISH_COMMON_BIGRAMS[bg]

            total_score = (dict_sc * 2.0) + (bg_sc * 1.5)

            if total_score > col_best_score:
                col_best_score = total_score
                col_best_text = dec_text
                col_best_perm = perm_list

        if col_best_perm:
            candidates_list.append({
                "columns": num_cols,
                "permutation": col_best_perm,
                "score": round(col_best_score, 2),
                "plaintext_preview": col_best_text[:60]
            })

            if col_best_score > best_overall_score:
                best_overall_score = col_best_score
                best_candidate_text = col_best_text
                best_col_count = num_cols
                best_permutation = col_best_perm

    # Score final best candidate
    scored = score_candidate(best_candidate_text, "Columnar Transposition Solver", f"Cols={best_col_count}, Order={best_permutation}")

    return {
        "success": True,
        "best_columns": best_col_count,
        "best_permutation": best_permutation,
        "recovered_plaintext": best_candidate_text,
        "confidence_score": scored.score,
        "tested_column_candidates": sorted(candidates_list, key=lambda x: x["score"], reverse=True)[:5]
    }
