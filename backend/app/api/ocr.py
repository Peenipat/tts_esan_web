from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from app.services.ocr_service import ocr_with_cache

router = APIRouter()

@router.post("/")
async def ocr_endpoint(
    file: UploadFile = File(...),
    task_type: str = "default",
    page_num: int = 1
):
    try:
        # อ่านไฟล์เป็น bytes
        file_bytes = await file.read()

        # เรียก OCR + Cache
        result = await ocr_with_cache(file_bytes, file.filename, task_type, page_num)

        return JSONResponse(status_code=200, content={"result": result})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
