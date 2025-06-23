import json
from typing import Optional, Union, BinaryIO
from fastapi import UploadFile
from uuid import uuid4
from datetime import datetime
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

    def _upload_file(
        self,
        file: BinaryIO,
        s3_path: str,
        content_type: str = "application/octet-stream"
    ) -> str:
        try:
            file.seek(0)
            self.s3_client.upload_fileobj(
                file,
                self.bucket,
                s3_path,
                ExtraArgs={
                    "ContentType": content_type,
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

    async def upload_voice_bundle(
        self,
        wav_file: Union[UploadFile, BinaryIO],
        pdf_file: Optional[UploadFile] = None,
        img_file: Optional[UploadFile] = None,
        folder: str = "voices"
    ) -> dict:
        bundle_id = uuid4().hex
        base_path = f"{folder}/{bundle_id}"

        metadata = {
            "bundle_id": bundle_id,
            "created_at": datetime.utcnow().isoformat(),
            "files": {}
        }

        # === Handle wav_file (UploadFile or BinaryIO) ===
        if isinstance(wav_file, UploadFile):
            await wav_file.seek(0)
            wav_stream = wav_file.file
            wav_content_type = wav_file.content_type or "audio/wav"
        else:
            wav_file.seek(0)
            wav_stream = wav_file
            wav_content_type = "audio/wav"

        metadata["files"]["wav_url"] = self._upload_file(
            wav_stream,
            f"{base_path}/audio.wav",
            wav_content_type
        )

        # === PDF Upload ===
        if pdf_file:
            await pdf_file.seek(0)
            metadata["files"]["pdf_url"] = self._upload_file(
                pdf_file.file,
                f"{base_path}/document.pdf",
                pdf_file.content_type or "application/pdf"
            )

        # === Image Upload ===
        if img_file:
            await img_file.seek(0)
            extension = img_file.filename.split(".")[-1].lower()
            content_type = img_file.content_type or "application/octet-stream"
            metadata["files"]["img_url"] = self._upload_file(
                img_file.file,
                f"{base_path}/image.{extension}",
                content_type
            )

        # === Metadata JSON ===
        self._upload_metadata_json(metadata, f"{base_path}/metadata.json")

        return metadata
    def list_all_voice_bundles(self) -> list[dict]:
        result = []
        paginator = self.s3_client.get_paginator("list_objects_v2")
        response_iterator = paginator.paginate(
            Bucket=self.bucket,
            Prefix="voices/",
            Delimiter="/"
        )

        for page in response_iterator:
            prefixes = page.get("CommonPrefixes", [])
            for prefix in prefixes:
                bundle_id = prefix["Prefix"].split("/")[1]  # "voices/{id}/" → เอา id
                bundle_path = f"voices/{bundle_id}"

                # สร้างลิงก์ไฟล์
                result.append({
                    "bundle_id": bundle_id,
                    "audio_url": f"https://{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{bundle_path}/audio.wav",
                    "image_url": f"https://{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{bundle_path}/image.jpg",
                    "metadata_url": f"https://{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{bundle_path}/metadata.json",
                })

        return result
