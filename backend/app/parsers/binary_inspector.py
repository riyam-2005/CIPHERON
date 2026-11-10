from collections import Counter
from typing import List, Dict, Tuple, Optional
from app.models.schemas import BinaryAnalysisResult

MAGIC_SIGNATURES: List[Tuple[bytes, str, str]] = [
    (b'\x89PNG\r\n\x1a\n', "PNG Image", "image/png"),
    (b'\xff\xd8\xff', "JPEG Image", "image/jpeg"),
    (b'GIF87a', "GIF Image (87a)", "image/gif"),
    (b'GIF89a', "GIF Image (89a)", "image/gif"),
    (b'%PDF-', "PDF Document", "application/pdf"),
    (b'\x7fELF', "ELF Executable/Binary", "application/x-executable"),
    (b'MZ', "Windows PE Executable / DLL", "application/x-dosexec"),
    (b'PK\x03\x04', "ZIP Archive", "application/zip"),
    (b'\x1f\x8b', "GZIP Archive", "application/gzip"),
    (b'SQLite format 3\x00', "SQLite 3 Database", "application/x-sqlite3"),
    (b'\x00asm', "WebAssembly Binary", "application/wasm"),
    (b'{\n', "JSON Document", "application/json"),
    (b'<?xml', "XML Document", "application/xml")
]

def analyze_binary_data(data_bytes: bytes, max_dump_rows: int = 32) -> BinaryAnalysisResult:
    """
    Extracts magic bytes, file type, 256-bin histogram, and formatted Hex dump.
    """
    # 1. Identify Magic Bytes
    detected_type = "Generic Binary / Unknown"
    mime_type = "application/octet-stream"
    for sig, f_type, mime in MAGIC_SIGNATURES:
        if data_bytes.startswith(sig):
            detected_type = f_type
            mime_type = mime
            break
            
    # Magic Hex string (first 16 bytes)
    magic_hex = ' '.join(f"{b:02X}" for b in data_bytes[:16])
    
    # 2. Histogram (256 bins)
    counts = Counter(data_bytes)
    histogram = [counts.get(i, 0) for i in range(256)]
    
    # 3. Formatted Hex Dump
    hex_dump = []
    chunk_size = 16
    total_len = len(data_bytes)
    rows_to_render = min(max_dump_rows, (total_len + chunk_size - 1) // chunk_size)
    
    for row in range(rows_to_render):
        start = row * chunk_size
        chunk = data_bytes[start:start+chunk_size]
        offset_str = f"{start:08X}"
        hex_parts = [f"{b:02X}" for b in chunk]
        # Pad if short chunk
        while len(hex_parts) < 16:
            hex_parts.append("  ")
        hex_str = ' '.join(hex_parts[:8]) + "  " + ' '.join(hex_parts[8:])
        ascii_str = ''.join(chr(b) if 32 <= b <= 126 else '.' for b in chunk)
        
        hex_dump.append({
            "offset": offset_str,
            "hex": hex_str,
            "ascii": ascii_str
        })
        
    return BinaryAnalysisResult(
        magic_hex=magic_hex,
        file_type=detected_type,
        mime_type=mime_type,
        size_bytes=len(data_bytes),
        byte_histogram=histogram,
        hex_dump=hex_dump
    )
