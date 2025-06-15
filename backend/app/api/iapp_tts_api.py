from fastapi import APIRouter, Form, Response
from app.services.iapp_tts_service import tts_iapp

router = APIRouter()

@router.post("/iapp-tts")
async def iapp_tts_endpoint(
    text: str = Form(..., description="ข้อความที่ต้องการแปลงเป็นเสียง"),
    language: str = Form("TH", description="ภาษาของข้อความ (เช่น TH)")
):
    """
    ■ รับ form-data:
      - text     : ข้อความต้นฉบับ
      - language : ภาษา (optional, default: TH)
    ■ คืนไฟล์เสียง WAV
    """

    audio_bytes = await tts_iapp(text=text, language=language)

    # ส่งไฟล์เสียง WAV กลับไปให้ client
    # media_type="audio/wav" สำคัญมากเพื่อให้ browser รู้ว่าเป็นไฟล์เสียง
    return Response(content=audio_bytes, media_type="audio/wav")