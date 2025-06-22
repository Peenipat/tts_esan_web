from fastapi import APIRouter, UploadFile, File, Form, Response
from app.services.gemini_full_service import ocr_gemini , summarize_gemini

router = APIRouter()

@router.post("/")
async def ocr_endpoint(
    file: UploadFile = File(..., description="ไฟล์ภาพหรือ PDF ที่ต้องการ OCR")
):
    content = await file.read()
    print(f"Received file: {file.filename}, type: {file.content_type}, size: {len(content)} bytes")

    text = await ocr_gemini(
        file_content_bytes=content,
        filename=file.filename 
    )
    return {"text": text}

@router.post("/summary")
async def summary_endpoint(
    text: str = Form(..., description="ข้อความที่ต้องการสรุป"),

):
    summary = await summarize_gemini(text=text)
    return {"summary": summary}
