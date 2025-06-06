import os
import time, random, hashlib
from typhoon_ocr import ocr_document
from app.utils.cache import get_cached_result, set_cached_result
from app.core.config import settings

def make_cache_key(file_bytes: bytes, task_type: str, page_num: int) -> str:
    h = hashlib.sha256()
    h.update(file_bytes)
    h.update(task_type.encode())
    h.update(str(page_num).encode())
    return h.hexdigest()

async def perform_ocr(file_path: str, task_type: str, page_num: int) -> str:
    max_retries = 5
    retries = 0
    while True:
        try:
            result = ocr_document(
                pdf_or_image_path=file_path,
                task_type=task_type,
                page_num=page_num
            )
            return result

        except Exception as e:
            # ไม่แยก RateLimitError แล้ว จับทุก exception แล้ว retry (ถ้าอยากเฉพาะ RateLimit ให้ดู message ช่วย)
            retries += 1
            if retries > max_retries:
                raise e
            backoff = (2 ** retries) + random.random()
            print(f"Error from typhoon_ocr; retrying in {backoff:.2f} seconds…")
            time.sleep(backoff)

async def ocr_with_cache(file_bytes: bytes, original_filename: str, task_type: str, page_num: int) -> str:
    cache_key = make_cache_key(file_bytes, task_type, page_num)
    cached = await get_cached_result(cache_key)
    if cached:
        return cached

    temp_path = f"/tmp/{original_filename}"
    with open(temp_path, "wb") as f:
        f.write(file_bytes)

    result = await perform_ocr(temp_path, task_type, page_num)
    await set_cached_result(cache_key, result, expire=3600)
    try:
        os.remove(temp_path)
    except OSError:
        pass

    return result
