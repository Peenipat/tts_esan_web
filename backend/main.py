from dotenv import load_dotenv

from app.api import gemini_full_api
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ocr
from app.api import summary_api
from app.api import iapp_tts_api
from app.api import vaoja_api
app = FastAPI(title="OCR Service & Summary", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://my-ocr-frontend.s3-website.ap-southeast-1.amazonaws.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ocr.router, prefix="/api/typhoon", tags=["typhoon"])
app.include_router( summary_api.router,prefix="/api/summary",tags=["Summary"])
app.include_router(gemini_full_api.router,prefix='/api/gemini',tags=["Gemini"])
app.include_router(iapp_tts_api.router,prefix='/api',tags=["IApp"])
app.include_router(vaoja_api.router,prefix='/api',tags=["vaoja"])