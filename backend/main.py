from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import ocr

app = FastAPI(title="OCR Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    # ใส่แค่ domain ที่เราใช้จริง (เอา slash ท้ายออก)
    allow_origins=[
      "http://my-ocr-frontend.s3-website.ap-southeast-1.amazonaws.com"
    ],
    allow_credentials=False,  
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
