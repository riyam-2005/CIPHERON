import re
from typing import Optional, List
from app.models.schemas import HashAnalysisResult

# Regex patterns for common cryptographic hashes
HASH_PATTERNS = {
    "MD5": (re.compile(r'^[a-fA-F0-9]{32}$'), 128),
    "SHA-1": (re.compile(r'^[a-fA-F0-9]{40}$'), 160),
    "SHA-256": (re.compile(r'^[a-fA-F0-9]{64}$'), 256),
    "SHA-512": (re.compile(r'^[a-fA-F0-9]{128}$'), 512),
    "bcrypt": (re.compile(r'^\$2[aby]\$[0-9]{2}\$[A-Za-z0-9./]{53}$'), None),
    "Argon2": (re.compile(r'^\$argon2(id|i|d)\$v=[0-9]+\$m=[0-9]+,t=[0-9]+,p=[0-9]+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$'), None)
}

def analyze_hash(data: str) -> HashAnalysisResult:
    """
    Identifies structural signatures for cryptographic hashes and
    strictly emits the PRD-mandated one-way integrity statement.
    """
    clean = data.strip()
    detected_algs: List[str] = []
    bit_len: Optional[int] = None
    
    for alg, (pattern, bits) in HASH_PATTERNS.items():
        if pattern.match(clean):
            detected_algs.append(alg)
            if bits:
                bit_len = bits
                
    if detected_algs:
        alg_names = " or ".join(detected_algs)
        notice = (
            f"This input matches the structural signature of {alg_names}. "
            "Cryptographic hashes are one-way functions and cannot be decoded directly."
        )
        return HashAnalysisResult(
            is_hash=True,
            detected_algorithms=detected_algs,
            bit_length=bit_len,
            integrity_notice=notice
        )
    
    return HashAnalysisResult(
        is_hash=False,
        detected_algorithms=[],
        bit_length=None,
        integrity_notice=""
    )
