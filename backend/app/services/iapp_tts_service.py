
import httpx
from fastapi import  HTTPException
from app.core.config import settings
async def tts_iapp(
    text: str,
    language: str = "TH" # กำหนด default เป็น "TH" ตามที่ iApp รองรับ
) -> bytes:
    """
    เรียกใช้ iApp.co.th Thai TTS API เพื่อแปลงข้อความเป็นเสียง
    และคืนค่าเป็น bytes ของไฟล์เสียง WAV
    """
    payload = {
        "text": (None, text), # (None, value) คือรูปแบบสำหรับ form field ใน files ของ requests/httpx
        "language": (None, language)
    }
    headers = {
        "apikey": settings.IAPP_TTS_KEY
    }

    try:
        # ใช้ httpx.AsyncClient สำหรับส่ง request แบบ async
        async with httpx.AsyncClient() as client:
            response = await client.post(settings.IAPP_TTS_URL, headers=headers, files=payload)
            response.raise_for_status() # จะยกเว้น HTTPException ถ้าสถานะไม่ใช่ 2xx

        # ตรวจสอบว่าได้เนื้อหาเสียงกลับมาหรือไม่
        if not response.content:
            raise ValueError("iApp TTS did not return audio data.")

        return response.content # คืนค่า bytes ของไฟล์เสียง

    except httpx.HTTPStatusError as e:
        print(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"iApp TTS API returned an error: {e.response.text}"
        )
    except httpx.RequestError as e:
        print(f"Network or request error occurred: {e}")
        raise HTTPException(
            status_code=503, # Service Unavailable
            detail=f"Could not connect to iApp TTS API: {e}"
        )
    except Exception as e:
        print(f"An unexpected error occurred during TTS generation: {e}")
        raise HTTPException(
            status_code=500, # Internal Server Error
            detail=f"An internal error occurred: {e}"
        )
    
