from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import subprocess
import tempfile
import requests
import os
import shutil
import uuid
import boto3
router = APIRouter()

@router.post("/combine")
async def combine_audio(audio_urls: list[str]):
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            input_files = []

            # 1. ดาวน์โหลดไฟล์เสียง
            for i, url in enumerate(audio_urls):
                r = requests.get(url)
                if r.status_code != 200:
                    raise Exception(f"Failed to download file: {url}")
                file_path = os.path.join(tmpdir, f"audio{i}.wav")
                with open(file_path, "wb") as f:
                    f.write(r.content)
                input_files.append(file_path)

            # 2. สร้าง list.txt
            list_file = os.path.join(tmpdir, "list.txt")
            with open(list_file, "w") as f:
                for path in input_files:
                    f.write(f"file '{path}'\n")

            # 3. รวมไฟล์ด้วย ffmpeg
            temp_output = os.path.join(tmpdir, "combined.wav")
            subprocess.run([
                "ffmpeg", "-f", "concat", "-safe", "0", "-i", list_file, "-c", "copy", temp_output
            ], check=True)

            # ✅ 4. ย้ายไฟล์ออกมานอก temp ก่อน return
            final_path = f"/tmp/combined_{uuid.uuid4().hex}.wav"
            shutil.copyfile(temp_output, final_path)

        # return หลังออกจาก with-block แล้ว (ไฟล์ยังอยู่)
        return FileResponse(final_path, media_type="audio/wav", filename="combined.wav")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Combine failed: {str(e)}")
