import sqlite3
import os
from typing import List, Dict, Any, Optional

DB_FILE = "cipheron.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            event_type TEXT NOT NULL,
            input_sha256 TEXT NOT NULL,
            security_profile TEXT NOT NULL,
            status TEXT NOT NULL,
            duration_ms REAL NOT NULL,
            details TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Auto-initialize on import
init_db()


def insert_audit_entry(entry: Dict[str, Any]):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO audit_logs (id, timestamp, event_type, input_sha256, security_profile, status, duration_ms, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        entry["id"],
        entry["timestamp"],
        entry["event_type"],
        entry["input_sha256"],
        entry["security_profile"],
        entry["status"],
        entry["duration_ms"],
        entry["details"]
    ))
    conn.commit()
    conn.close()

def get_recent_audit_logs(limit: int = 50) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY rowid DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    logs = [dict(row) for row in rows]
    conn.close()
    return logs

def vacuum_database():
    """Wipes ephemeral data and vacuums database for secure cleanup."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # In secure/fortress mode, clear table
    cursor.execute("DELETE FROM audit_logs WHERE security_profile = 'FORTRESS'")
    conn.commit()
    cursor.execute("VACUUM")
    conn.close()
