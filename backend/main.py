from dotenv import load_dotenv
load_dotenv() 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import ocr


app = FastAPI(
    title="OCR Service (FastAPI)",
    version="0.1.0"
)

# เปิด CORS (อนุญาตทุกโดเมน หรือเฉพาะ http://localhost:3000)
origins = [
    "http://localhost:3000",  # ถ้าคุณรัน React dev server บน port 3000
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # ถ้าใช้ Vite หรือ Next.js dev
    "http://127.0.0.1:5173",
    "http://my-ocr-frontend.s3-website.ap-southeast-1.amazonaws.com/"
    "http://47.129.43.106",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],    # อนุญาต GET, POST, PUT, DELETE ฯลฯ
    allow_headers=["*"],    # อนุญาตทุก header
)

app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
