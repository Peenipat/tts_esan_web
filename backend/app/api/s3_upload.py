import json
from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from app.services.s3_uploader import S3Uploader
import boto3
from app.core.config import settings
router = APIRouter()

@router.post("/upload-voice-bundle")
async def upload_voice_bundle(
    wav_file: UploadFile = File(...),
    pdf_file: UploadFile = File(None),
    img_file: UploadFile = File(None)
):
    uploader = S3Uploader()
    result = uploader.upload_voice_bundle(wav_file, pdf_file, img_file)
    return {"status": "success", "data": result}


@router.get("/voice-bundle/{bundle_id}")
def get_voice_bundle_metadata(bundle_id: str):
    s3_client = boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )

    key = f"voices/{bundle_id}/metadata.json"
    try:
        response = s3_client.get_object(Bucket=settings.AWS_BUCKET_NAME, Key=key)
        content = response["Body"].read().decode("utf-8")
        return json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Bundle not found: {str(e)}")
