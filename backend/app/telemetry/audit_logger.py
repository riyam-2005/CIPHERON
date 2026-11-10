import time
import uuid
import datetime
from typing import Dict, Any, List
from app.storage.database import insert_audit_entry, get_recent_audit_logs, vacuum_database
from app.core.logging_config import hash_payload
from app.models.schemas import AuditLogEntry

class AuditTelemetry:
    """
    Provenance audit logger storing zero plaintext telemetry.
    Strictly records cryptographic hashes of inputs and transformation metadata.
    """
    @staticmethod
    def record_event(
        event_type: str,
        raw_data: str | bytes,
        profile: str,
        status: str,
        duration_ms: float,
        details: str
    ) -> AuditLogEntry:
        entry_id = f"aud_{uuid.uuid4().hex[:12]}"
        ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
        sha256_hash = hash_payload(raw_data)
        
        entry = {
            "id": entry_id,
            "timestamp": ts,
            "event_type": event_type,
            "input_sha256": sha256_hash,
            "security_profile": profile,
            "status": status,
            "duration_ms": round(duration_ms, 2),
            "details": details
        }
        
        # Don't persist on disk in FORTRESS mode (zero disk policy)
        if profile != "FORTRESS":
            insert_audit_entry(entry)
            
        return AuditLogEntry(**entry)

    @staticmethod
    def get_logs(limit: int = 50) -> List[AuditLogEntry]:
        rows = get_recent_audit_logs(limit)
        return [AuditLogEntry(**r) for r in rows]

    @staticmethod
    def wipe_audit_cache():
        vacuum_database()
