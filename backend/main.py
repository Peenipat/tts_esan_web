# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ocr
from app.api import summary_api  # เพิ่มบรรทัดนี้

app = FastAPI(
    title="OCR & Summary Service (FastAPI)",
    version="0.1.0"
)

# เปิด CORS (อนุญาตทุกโดเมน หรือเฉพาะ http://localhost:3000)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*",  # สำหรับ development เท่านั้น
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OCR endpoint
app.include_router(
    ocr.router,
    prefix="/api/ocr",
    tags=["OCR"]
)

# Summary endpoints
app.include_router(
    summary_api.router,
    prefix="/api",
    tags=["Summary"]
)
