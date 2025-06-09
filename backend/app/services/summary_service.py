import hashlib
from typing import Optional

from google import genai

from app.utils.cache import get_cached_result, set_cached_result
from app.core.config import settings

# กำหนด client แบบ singleton
_client: Optional[genai.Client] = None
def get_genai_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client

CACHE_EXPIRE_SECONDS = 60 * 60 * 24  # เก็บสรุปไว้ 1 วัน

def make_summary_cache_key(text: str) -> str:
    h = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return f"summary:{h}"

async def summarize_text(text: str, use_cache: bool = True) -> str:
    """
    สรุปข้อความด้วย Gemini ผ่าน google-genai SDK พร้อม cache
    """
    cache_key = make_summary_cache_key(text)

    # 1. ดูใน cache ก่อน
    if use_cache:
        cached = await get_cached_result(cache_key)
        if cached:
            return cached

    # 2. ถ้าไม่เจอใน cache → เรียก Gemini
    prompt = (
        "คุณช่วยสรุปข้อความที่ผมให้หน่อยเอาเป็นภาษาไทย ต้องสรุปโดยละเอียดและห้ามแต่งเติม และรักษาชื่อเฉพาะเอาไว้ด้วย ข้อความมีดังนี้:\n\n"
        f"{text}"
    )

    client = get_genai_client()
    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,   # กำหนดใน settings เช่น "gemini-2.0-flash"
        contents=prompt,
    )

    summary = response.text

    # 3. เก็บผลลัพธ์ลง cache
    if use_cache:
        await set_cached_result(cache_key, summary, expire=CACHE_EXPIRE_SECONDS)

    return summary
