import json
from typing import Optional
from fastapi import UploadFile
from uuid import uuid4
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from app.core.config import settings


class S3Uploader:
    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )
        self.bucket = settings.AWS_S3_BUCKET_NAME

    def _upload_file(self, file: UploadFile, s3_path: str) -> str:
        try:
            self.s3_client.upload_fileobj(
                file.file,
                self.bucket,
                s3_path,
                ExtraArgs={
                    "ContentType": file.content_type,
                    "ACL": "public-read"
                }
            )
            return f"https://{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_path}"
        except (BotoCoreError, ClientError) as e:
            raise RuntimeError(f"Failed to upload to S3: {e}")

    def _upload_metadata_json(self, metadata: dict, s3_path: str):
        try:
            json_bytes = json.dumps(metadata, indent=2).encode("utf-8")
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=s3_path,
                Body=json_bytes,
                ContentType="application/json",
                ACL="public-read"
            )
        except (BotoCoreError, ClientError) as e:
            raise RuntimeError(f"Failed to upload metadata JSON: {e}")

    def upload_voice_bundle(
        self,
        wav_file: UploadFile,
        pdf_file: Optional[UploadFile] = None,
        img_file: Optional[UploadFile] = None,
        folder: str = "voices"
    ) -> dict:
        bundle_id = uuid4().hex
        base_path = f"{folder}/{bundle_id}"

        metadata = {
            "bundle_id": bundle_id,
            "files": {}
        }

        metadata["files"]["wav_url"] = self._upload_file(wav_file, f"{base_path}/audio.wav")

        if pdf_file:
            metadata["files"]["pdf_url"] = self._upload_file(pdf_file, f"{base_path}/document.pdf")

        if img_file:
            metadata["files"]["img_url"] = self._upload_file(img_file, f"{base_path}/image.png")

        # Save metadata JSON
        self._upload_metadata_json(metadata, f"{base_path}/metadata.json")

        return metadata
