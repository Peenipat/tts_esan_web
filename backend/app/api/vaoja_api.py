from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.vaoja_service import Text2SpeechService

router = APIRouter()
tts_service = Text2SpeechService()


class TTSRequest(BaseModel):
    text: str
    speaker: str = "mukda"
    pace: float = 1.0
class TTSResponse(BaseModel):
    message: str
    wav_url: str
    qr_url: str


@router.post("/vaoja-tts"  , response_model=TTSResponse)
def synthesize_tts(request: TTSRequest):
    result = tts_service.synthesize(
        text=request.text,
        speaker=request.speaker,
        pace=request.pace,
    )

    if result is None:
        raise HTTPException(status_code=500, detail="TTS service failed")

    return {
        "message": "success",
        "wav_url": result.get("wav_url"),
        "qr_url": result.get("qr_url"),
    }
