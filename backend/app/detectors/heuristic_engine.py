import time
import re
from typing import List, Tuple
from app.models.schemas import DetectionResponse, Hypothesis, StatisticalMetrics
from app.detectors.statistics import extract_statistical_metrics
from app.parsers.hash_detector import analyze_hash
from app.parsers.compression import detect_compression_header
from app.code_analysis.code_inspector import detect_programming_language

def detect_hypotheses(text: str) -> DetectionResponse:
    """
    Deterministically evaluates input using mathematical statistics,
    character set bounding, and structural pattern matching.
    Returns ranked hypotheses with confidence percentages (0.0% to 100.0%).
    """
    start_time = time.perf_counter()
    metrics = extract_statistical_metrics(text)
    hypotheses: List[Hypothesis] = []
    
    clean = text.strip()
    length = len(clean)
    
    if length == 0:
        return DetectionResponse(
            metrics=metrics,
            hypotheses=[],
            execution_time_ms=0.0
        )

    # 1. Check for Hash Structural Signatures
    hash_result = analyze_hash(clean)
    if hash_result.is_hash:
        algs = "/".join(hash_result.detected_algorithms)
        hypotheses.append(Hypothesis(
            family="HASH",
            name=f"Cryptographic Hash ({algs})",
            confidence=98.0,
            details=f"Matches strict {algs} hexadecimal character length ({length} chars). One-way function.",
            decoder_id="hash_identifier"
        ))

    # 2. Check for Binary Encoding
    if "BINARY" in metrics.detected_charsets:
        no_spaces = clean.replace(" ", "").replace("\n", "")
        conf = 98.0 if len(no_spaces) % 8 == 0 else 85.0
        hypotheses.append(Hypothesis(
            family="ENCODING",
            name="Binary (Base2)",
            confidence=conf,
            details=f"Only 0/1 bits detected. Length: {len(no_spaces)} bits.",
            decoder_id="decode_binary"
        ))

    # 3. Check for Hexadecimal Encoding
    if "HEXADECIMAL" in metrics.detected_charsets and not hash_result.is_hash:
        clean_hex = re.sub(r'0x|[\s:,]', '', clean)
        if len(clean_hex) % 2 == 0 and len(clean_hex) >= 2:
            conf = 96.0 if (clean.startswith("0x") or " " in clean or len(clean_hex) <= 64) else 88.0
            hypotheses.append(Hypothesis(
                family="ENCODING",
                name="Hexadecimal (Base16)",
                confidence=conf,
                details=f"Valid byte-aligned hex sequence ({len(clean_hex)} nibbles).",
                decoder_id="decode_hex"
            ))

    # 4. Check for Base64 Encoding
    if "BASE64" in metrics.detected_charsets or "BASE64_URL" in metrics.detected_charsets:
        no_space = clean.replace(" ", "").replace("\n", "").replace("\r", "")
        if len(no_space) >= 4 and len(no_space) % 4 == 0:
            has_padding = no_space.endswith("=")
            conf = 97.0 if has_padding else (92.0 if metrics.shannon_entropy > 3.8 else 75.0)
            hypotheses.append(Hypothesis(
                family="ENCODING",
                name="Base64 (RFC 4648)",
                confidence=conf,
                details=f"4-byte aligned Base64 alphabet. Entropy: {metrics.shannon_entropy}.",
                decoder_id="decode_base64"
            ))

    # 5. Check for Base32
    if "BASE32" in metrics.detected_charsets:
        no_space = clean.replace(" ", "")
        if len(no_space) >= 8 and (len(no_space) % 8 == 0 or no_space.endswith("=")):
            hypotheses.append(Hypothesis(
                family="ENCODING",
                name="Base32 (RFC 4648)",
                confidence=85.0,
                details="Strict Base32 alphabet (A-Z, 2-7).",
                decoder_id="decode_base32"
            ))

    # 6. Check for Morse Code
    if "MORSE_CODE" in metrics.detected_charsets:
        hypotheses.append(Hypothesis(
            family="ENCODING",
            name="International Morse Code",
            confidence=95.0,
            details="Pattern composed exclusively of dots, dashes, and delimiters.",
            decoder_id="decode_morse"
        ))

    # 7. Check for Decimal ASCII Codes
    if "DECIMAL_CODES" in metrics.detected_charsets:
        hypotheses.append(Hypothesis(
            family="ENCODING",
            name="Decimal / ASCII Byte Codes",
            confidence=90.0,
            details="Space-delimited integer sequence in ASCII byte range (0-255).",
            decoder_id="decode_decimal_ascii"
        ))

    # 8. Check for Classical Ciphers (Caesar, ROT13, Atbash, Vigenere)
    if metrics.printable_ratio > 0.90 and "PRINTABLE_ASCII" in metrics.detected_charsets:
        letters_only = re.sub(r'[^a-zA-Z]', '', clean)
        if len(letters_only) >= 5:
            # If IC is high (~0.0667), it might be a monoalphabetic substitution or Caesar
            if metrics.index_of_coincidence >= 0.055:
                # If chi^2 is high, letters are shifted away from normal English
                if metrics.chi_squared_english > 25.0:
                    hypotheses.append(Hypothesis(
                        family="ENCRYPTION",
                        name="Caesar / Shift Cipher",
                        confidence=88.0,
                        details=f"High monoalphabetic IC ({metrics.index_of_coincidence}) with shifted distribution (Chi²={metrics.chi_squared_english}).",
                        decoder_id="caesar_bruteforce"
                    ))
                    hypotheses.append(Hypothesis(
                        family="ENCRYPTION",
                        name="ROT13 / ROT Variants",
                        confidence=85.0,
                        details="Fixed rotation substitution.",
                        decoder_id="rot13"
                    ))
                else:
                    # Low chi^2 means already likely English plaintext
                    hypotheses.append(Hypothesis(
                        family="STRUCTURED",
                        name="English Plaintext",
                        confidence=92.0,
                        details=f"Natural English letter distribution (Chi²={metrics.chi_squared_english}, IC={metrics.index_of_coincidence}).",
                        decoder_id=None
                    ))
            elif 0.035 <= metrics.index_of_coincidence < 0.055:
                # Low/Flat IC suggests polyalphabetic cipher (Vigenère or Beaufort)
                hypotheses.append(Hypothesis(
                    family="ENCRYPTION",
                    name="Vigenère / Polyalphabetic Cipher",
                    confidence=82.0,
                    details=f"Suppressed Index of Coincidence ({metrics.index_of_coincidence}) indicating periodic key rotation.",
                    decoder_id="vigenere_solver"
                ))

    # 9. Check for Source Code
    lang = detect_programming_language(clean)
    if lang:
        hypotheses.append(Hypothesis(
            family="SOURCE_CODE",
            name=f"Source Code ({lang})",
            confidence=92.0,
            details=f"Matched language syntax signatures for {lang}.",
            decoder_id="code_analysis"
        ))

    # 10. Check for JSON / XML structured text
    if clean.startswith(("{", "[")) and clean.endswith(("}", "]")):
        hypotheses.append(Hypothesis(
            family="STRUCTURED",
            name="JSON Payload",
            confidence=95.0,
            details="Valid JSON envelope boundaries.",
            decoder_id=None
        ))
    elif clean.startswith("<") and clean.endswith(">"):
        hypotheses.append(Hypothesis(
            family="STRUCTURED",
            name="XML / HTML Structure",
            confidence=90.0,
            details="Markup tags detected.",
            decoder_id=None
        ))

    # 11. Single-byte XOR candidate check
    if metrics.shannon_entropy > 3.0 and ("HEXADECIMAL" in metrics.detected_charsets or metrics.printable_ratio < 0.7):
        hypotheses.append(Hypothesis(
            family="ENCRYPTION",
            name="Single-Byte XOR",
            confidence=70.0,
            details="Bitwise mask substitution candidate.",
            decoder_id="xor_bruteforce"
        ))

    # Sort hypotheses by confidence descending
    hypotheses.sort(key=lambda h: h.confidence, reverse=True)
    
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    return DetectionResponse(
        metrics=metrics,
        hypotheses=hypotheses,
        execution_time_ms=round(elapsed_ms, 2)
    )
