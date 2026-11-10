import zlib
import gzip
import zipfile
import io
from typing import Optional, Tuple, Dict, Any

def detect_compression_header(data_bytes: bytes) -> Optional[str]:
    """Detects compression header signatures."""
    if len(data_bytes) < 2:
        return None
    if data_bytes.startswith(b'\x1f\x8b'):
        return "GZIP"
    if data_bytes[:2] in [b'\x78\x01', b'\x78\x9c', b'\x78\xda']:
        return "ZLIB"
    if data_bytes.startswith(b'PK\x03\x04'):
        return "ZIP"
    return None

def safe_decompress(data_bytes: bytes, max_ratio: float = 10.0, max_size_bytes: int = 5 * 1024 * 1024) -> Tuple[bool, Optional[str], str]:
    """
    Safely decompresses data while enforcing strict 10:1 ratio limit
    and memory ceiling to defend against decompression bombs.
    """
    header = detect_compression_header(data_bytes)
    if not header:
        return False, None, "No recognized compression header"
    
    input_size = len(data_bytes)
    allowed_max = min(max_size_bytes, int(input_size * max_ratio))
    
    try:
        if header == "GZIP":
            with gzip.GzipFile(fileobj=io.BytesIO(data_bytes)) as gz:
                decompressed = gz.read(allowed_max + 1)
        elif header == "ZLIB":
            decompressed = zlib.decompress(data_bytes, max_length=allowed_max + 1)
        elif header == "ZIP":
            with zipfile.ZipFile(io.BytesIO(data_bytes)) as zf:
                file_names = zf.namelist()
                if not file_names:
                    return False, None, "Empty Zip archive"
                with zf.open(file_names[0]) as zf_first:
                    decompressed = zf_first.read(allowed_max + 1)
        else:
            return False, None, "Unsupported compression"
            
        if len(decompressed) > allowed_max:
            return False, None, f"ERR_RATIO_EXCEEDED: Exceeded {max_ratio}:1 decompression limit (Potential Bomb)"
            
        text = decompressed.decode('utf-8', errors='replace')
        return True, text, f"Successfully decompressed {header} ({len(decompressed)} bytes extracted)"
    except Exception as e:
        return False, None, f"Decompression error: {str(e)}"
