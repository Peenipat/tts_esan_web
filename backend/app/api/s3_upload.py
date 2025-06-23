import json
from fastapi import APIRouter, File, HTTPException, UploadFile
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
    result = await uploader.upload_voice_bundle(wav_file, pdf_file, img_file)  # ✅ ใส่ await
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
        response = s3_client.get_object(Bucket=settings.AWS_S3_BUCKET_NAME, Key=key)
        content = response["Body"].read().decode("utf-8")
        return json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Bundle not found: {str(e)}")

@router.get("/voice-bundles")
def list_voice_bundles():
    s3_client = boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )

    bucket_name = settings.AWS_S3_BUCKET_NAME
    prefix = "voices/"
    try:
        # ดึงรายการโฟลเดอร์ bundle ทั้งหมด
        result = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=prefix, Delimiter="/")

        bundles = []
        for obj in result.get("CommonPrefixes", []):
            bundle_id = obj["Prefix"].split("/")[1]
            key = f"{prefix}{bundle_id}/metadata.json"
            try:
                res = s3_client.get_object(Bucket=bucket_name, Key=key)
                content = res["Body"].read().decode("utf-8")
                meta = json.loads(content)

                bundles.append({
                    "bundle_id": meta["bundle_id"],
                    "audio_url": meta["files"].get("wav_url"),
                    "image_url": meta["files"].get("img_url"),
                    "metadata_url": f"https://{bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
                })
            except Exception as e:
                # ข้าม bundle นี้ถ้าอ่าน metadata ไม่ได้
                continue

        return { "status": "success", "data": bundles }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bundles: {str(e)}")