import json
from typing import Annotated
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import subprocess, tempfile, requests, os, shutil, uuid
from app.services.s3_uploader import S3Uploader
from tempfile import SpooledTemporaryFile

router = APIRouter()
@router.post("/combine-upload")
async def combine_and_upload(
    audio_urls: Annotated[str, Form()],
    pdf_file: UploadFile = File(None),
    img_file: UploadFile = File(None),
):
    urls = json.loads(audio_urls)
    tmp_dir = tempfile.mkdtemp()

    try:
        # 1. ดาวน์โหลดไฟล์เสียงทั้งหมด
        input_paths = []
        for i, url in enumerate(urls):
            r = requests.get(url)
            if r.status_code != 200:
                raise HTTPException(400, f"Cannot download {url}")
            path = os.path.join(tmp_dir, f"audio{i}.wav")
            with open(path, "wb") as f:
                f.write(r.content)
            input_paths.append(path)

        # 2. เขียนไฟล์ list.txt สำหรับ ffmpeg concat
        list_path = os.path.join(tmp_dir, "list.txt")
        with open(list_path, "w") as f:
            for path in input_paths:
                f.write(f"file '{path}'\n")

        # 3. รวมเสียง
        output_path = os.path.join(tmp_dir, "combined.wav")
        subprocess.run([
            "ffmpeg", "-f", "concat", "-safe", "0", "-i", list_path, "-c", "copy", output_path
        ], check=True)

        # 4. เตรียมไฟล์สำหรับอัปโหลด
        uploader = S3Uploader()
        with open(output_path, "rb") as f:
            temp_file = SpooledTemporaryFile()
            temp_file.write(f.read())
            temp_file.seek(0)

    # ❌ อย่าใช้ UploadFile(...) ปลอม
    # ✅ ส่ง BinaryIO ตรง ๆ แทน พร้อมระบุ content_type เอง
            metadata = await uploader.upload_voice_bundle(
                wav_file=temp_file,         # BinaryIO
                pdf_file=pdf_file,
                img_file=img_file
            )

        return {"status": "success", "data": metadata}

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
