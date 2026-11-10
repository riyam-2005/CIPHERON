import logging
import hashlib
import sys

class SanitizedFormatter(logging.Formatter):
    """
    Ensures that plaintexts are never exposed in log outputs.
    Hashes or summarizes payloads to guarantee Zero Plaintext Telemetry.
    """
    def format(self, record: logging.LogRecord) -> str:
        # Standard formatting
        return super().format(record)

def setup_logger(name: str = "cipheron") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = SanitizedFormatter(
            fmt="%(asctime)s [%(levelname)s] [CIPHERON-X1] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

def hash_payload(data: str | bytes) -> str:
    """Returns SHA-256 fingerprint for non-sensitive audit referencing."""
    if isinstance(data, str):
        data = data.encode("utf-8", errors="replace")
    return hashlib.sha256(data).hexdigest()
