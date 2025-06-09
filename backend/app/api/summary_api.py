# backend/app/api/summary_api.py

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.services.summary_service import summarize_text

router = APIRouter(
    prefix="/summary",
    tags=["summary"],
)

class SummaryRequest(BaseModel):
    text: str = Field(..., description="ข้อความต้นฉบับที่ต้องการสรุป")
    use_cache: bool = Field(True, description="เปิดใช้ cache หรือไม่")

class SummaryResponse(BaseModel):
    summary: str = Field(..., description="ข้อความสรุปจาก LLM")

@router.post("/text", response_model=SummaryResponse, summary="Summarize raw text")
async def summary_text_endpoint(req: SummaryRequest):
    """
    รับข้อความ raw มาแล้วสรุปด้วย Gemini (ผ่าน summary_service)
    """
    try:
        result = await summarize_text(text=req.text, use_cache=req.use_cache)
        return JSONResponse(status_code=200, content={"summary": result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
