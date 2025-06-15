# backend/app/services/ocr_service.py
from google import genai
from fastapi import HTTPException 
from app.core.config import settings
import tempfile
import os
import io 
import wave


client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def ocr_gemini(
    prompt: str,
    file_content_bytes: bytes,  
    filename: str
) -> str:

    temp_file_path = None
    try:
     
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as temp_file:
            temp_file.write(file_content_bytes) 
            temp_file_path = temp_file.name 

        uploaded = client.files.upload(
            file=temp_file_path
        )

        resp = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[prompt, uploaded]
        )
        return resp.text

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OCR process failed: {e}")
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"Temporary file deleted: {temp_file_path}")

async def summarize_gemini(
    text: str,
    prompt: str = "Please provide a concise summary in Thai of the following text:",
    model: str = settings.GEMINI_MODEL
) -> str:
    """
    สรุปข้อความด้วย Gemini generate_content

    - text: ข้อความต้นฉบับที่ต้องการให้สรุป
    - prompt: ข้อความคำสั่ง (สามารถปรับเป็นภาษาอังกฤษหรือไทยก็ได้)
    - model: ชื่อโมเดล (default มาจาก settings.GEMINI_MODEL)

    คืนค่าเป็นข้อความสรุป
    """
    try:
        # ผสาน prompt + text เข้าไปใน contents
        contents = [prompt, text]
        resp = client.models.generate_content(
            model=model,
            contents=contents
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Summarization failed: {e}")

    return resp.text

