import re
import math
import httpx
from typing import Dict, Any, List, Tuple
from app.detectors.statistics import calculate_shannon_entropy

class SecretSanitizer:
    """
    High-Entropy Secret & Key Masking Sanitizer (suggestion-v2.md Section 7.1).
    Scans cryptanalysis artifacts and replaces high-entropy secrets and keys with
    deterministic placeholders [REDACTED_KEY_XX] before external or LLM processing.
    """
    def __init__(self, entropy_threshold: float = 3.8):
        self.entropy_threshold = entropy_threshold
        # Common secret patterns
        self.secret_patterns = [
            (re.compile(r'(?i)(?:key|token|secret|password|bearer|auth|private_key)\s*[:=]\s*["\']?([A-Za-z0-9+/=_\-]{8,})["\']?'), "KEY"),
            (re.compile(r'(?:0x[a-fA-F0-9]{32,})'), "HEX_SECRET"),
            (re.compile(r'(?:ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})'), "JWT_SECRET")
        ]

    def sanitize_text(self, text: str) -> Tuple[str, Dict[str, str]]:
        """
        Sanitizes raw text, replacing sensitive tokens with redaction tags.
        Returns (sanitized_text, redaction_mapping).
        """
        if not text:
            return text, {}

        mapping: Dict[str, str] = {}
        redacted_counter = 1
        sanitized = text

        # 1. Regex pattern matching
        for pattern, tag in self.secret_patterns:
            matches = list(pattern.finditer(sanitized))
            for m in matches:
                # Capture group or full match
                val = m.group(1) if m.groups() else m.group(0)
                if val not in mapping and len(val) >= 8:
                    tag_name = f"[REDACTED_{tag}_{redacted_counter:02d}]"
                    mapping[val] = tag_name
                    sanitized = sanitized.replace(val, tag_name)
                    redacted_counter += 1

        # 2. Word-by-word Shannon entropy screening
        words = sanitized.split()
        for w in words:
            clean_word = re.sub(r'[^A-Za-z0-9]', '', w)
            if len(clean_word) >= 16:
                entropy = calculate_shannon_entropy(clean_word)
                if entropy >= self.entropy_threshold and clean_word not in mapping:
                    tag_name = f"[REDACTED_HIGH_ENTROPY_{redacted_counter:02d}]"
                    mapping[clean_word] = tag_name
                    sanitized = sanitized.replace(clean_word, tag_name)
                    redacted_counter += 1

        return sanitized, mapping

    def desanitize_text(self, sanitized_text: str, mapping: Dict[str, str]) -> str:
        """Reverses the redaction mapping if needed for local display."""
        restored = sanitized_text
        for original, placeholder in mapping.items():
            restored = restored.replace(placeholder, original)
        return restored


class LocalLLMExplainer:
    """
    Connects to local Ollama (Phi-3-Mini-4K-GGUF) or delivers deterministic breakdown
    adhering to Zero-Plaintext and Secret Masking guardrails.
    """
    def __init__(self, ollama_url: str = "http://127.0.0.1:11434"):
        self.ollama_url = ollama_url
        self.sanitizer = SecretSanitizer()

    async def generate_explanation(self, stages: List[Dict[str, Any]], raw_preview: str) -> Dict[str, Any]:
        # 1. Sanitize input preview and stage artifacts
        sanitized_preview, mapping = self.sanitizer.sanitize_text(raw_preview)
        sanitized_stages = []
        for s in stages:
            desc = s.get("transformation", "")
            san_desc, _ = self.sanitizer.sanitize_text(desc)
            sanitized_stages.append({
                "step": s.get("step", 1),
                "detector": s.get("detector", "UNKNOWN"),
                "transformation": san_desc,
                "confidence": s.get("confidence", 0.9)
            })

        # 2. Attempt local Ollama endpoint query
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                prompt = (
                    "Explain this step-by-step cryptographic decoding process concisely:\n"
                    f"Input: {sanitized_preview}\n"
                    f"Stages: {sanitized_stages}\n"
                )
                resp = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": "phi3:mini",
                        "prompt": prompt,
                        "stream": False
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "source": "OLLAMA_PHI3_MINI",
                        "explanation": data.get("response", "").strip(),
                        "redactions_applied": len(mapping),
                        "sanitized": True
                    }
        except Exception:
            pass  # Fall back to local deterministic explainer

        # 3. Deterministic Local Educational Breakdown
        steps_summary = []
        for i, st in enumerate(sanitized_stages, start=1):
            det = st["detector"].upper()
            trans = st["transformation"]
            if "BASE64" in det or "B64" in trans.upper():
                steps_summary.append(f"Step {i}: Identified Base64 padding and encoding matrix. Decoded to ASCII byte stream.")
            elif "HEX" in det or "HEX" in trans.upper():
                steps_summary.append(f"Step {i}: Parsed 2-digit hex octets and normalized endianness.")
            elif "ROT" in det or "CAESAR" in det:
                steps_summary.append(f"Step {i}: Detected alphabetic rotation. Chi-square minimization aligned character frequencies with natural language.")
            elif "VIGENERE" in det:
                steps_summary.append(f"Step {i}: Detected polyalphabetic substitution. Kasiski examination and coset frequency alignment recovered key.")
            elif "COLUMNAR" in det:
                steps_summary.append(f"Step {i}: Detected transposition cipher. Bigram adjacency score maximized column permutation order.")
            else:
                steps_summary.append(f"Step {i}: Applied deterministic transformation '{trans}'.")

        explanation_text = " -> ".join(steps_summary) if steps_summary else "Direct deterministic evaluation completed."

        return {
            "source": "DETERMINISTIC_EXPLAINER",
            "explanation": explanation_text,
            "steps": steps_summary,
            "redactions_applied": len(mapping),
            "sanitized": True
        }


secret_sanitizer = SecretSanitizer()
llm_explainer = LocalLLMExplainer()
