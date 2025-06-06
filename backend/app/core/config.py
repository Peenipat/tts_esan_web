# backend/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    TYPHOON_OCR_API_KEY: str
    REDIS_URL: str = "redis://localhost:6379/0"
    OPENAI_API_KEY: str      

    class Config:
        env_file = ".env"    

settings = Settings()
