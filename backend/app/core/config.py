from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    TYPHOON_OCR_API_KEY: str
    REDIS_URL: str = "redis://localhost:6379/0"
    OPENAI_API_KEY: str 
    GEMINI_API_KEY:str   
    GEMINI_MODEL: str = "gemini-2.0-flash"  

    class Config:
        env_file = ".env"    

settings = Settings()
