# backend/main.py
import uvicorn
from fastapi import FastAPI
from app.api import ocr    # import router จากโฟลเดอร์ app/api/ocr.py

app = FastAPI(
    title="OCR Service (FastAPI)",
    version="0.1.0"
)

# สมมติใน app/api/ocr.py มีโค้ดประมาณนี้:
# from fastapi import APIRouter, UploadFile, File, HTTPException
# from app.services.ocr_service import ocr_with_cache
#
# router = APIRouter()
#
# @router.post("/")
# async def ocr_endpoint(file: UploadFile = File(...), task_type: str = "default", page_num: int = 1):
#     content = await file.read()
#     try:
#         result = await ocr_with_cache(content, file.filename, task_type, page_num)
#         return {"result": result}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#
# ….
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])

if __name__ == "__main__":
    # ใช้ reload=True เพื่อให้ auto-reload เวลามีการแก้โค้ด
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
