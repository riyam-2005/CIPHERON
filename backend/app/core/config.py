from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal

class Settings(BaseSettings):
    PROJECT_NAME: str = "CIPHERON-X1 Companion Analysis Server"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Host & Port
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Security Profiles
    CURRENT_SECURITY_PROFILE: Literal["STANDARD", "SECURE", "FORTRESS"] = "STANDARD"
    
    # Input size caps (in bytes)
    SIZE_CAP_STANDARD: int = 10 * 1024 * 1024  # 10 MB
    SIZE_CAP_SECURE: int = 2 * 1024 * 1024      # 2 MB
    SIZE_CAP_FORTRESS: int = 500 * 1024         # 500 KB
    
    # Pipeline limits
    MAX_RECURSION_DEPTH: int = 10
    BRANCH_TIMEOUT_SECONDS: float = 3.0
    MAX_CANDIDATES_PER_STAGE: int = 50
    
    # Database
    DATABASE_URL: str = "sqlite:///./cipheron.db"
    
    # Sandboxing & Memory
    MAX_DECOMPRESSION_RATIO: float = 10.0
    MAX_MEMORY_MB: int = 256
    
    model_config = SettingsConfigDict(case_sensitive=True)


settings = Settings()
