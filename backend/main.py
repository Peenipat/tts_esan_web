from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ocr
from app.api import summary_api

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

app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router( summary_api.router,prefix="/api/summary",tags=["Summary"])
