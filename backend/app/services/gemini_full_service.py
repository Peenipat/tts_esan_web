# backend/app/services/ocr_service.py
from google import genai
from fastapi import HTTPException 
from app.core.config import settings
import tempfile
import os
import io 
import wave


client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def ocr_gemini(
    file_content_bytes: bytes,  
    filename: str
) -> str:
    import os
    import tempfile
    from fastapi import HTTPException

    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as temp_file:
            temp_file.write(file_content_bytes) 
            temp_file_path = temp_file.name 

        uploaded = client.files.upload(
            file=temp_file_path
        )

        fixed_prompt = """
        แสกนข้อความในภาพหรือไฟล์นี้และสรุปเป็นข้อความให้อ่านเข้าใจง่าย 
        เอาเป็นแบบเรื่องเล่าที่มีเนื้อความอารมณ์เหมือนผู้ประกาศคุยกับผู้ฟัง เดี่ยวให้แทนตัวเองด้วยผม และ แทนผู้ฟังว่าพี่น้อง 
        ห้ามปรุงแต่งเพิ่มเอาขึ้นใหม่เฉพาะเนื้อความที่มีในไฟล์หรือรูป เพิ่มได้เฉพาะคำเชื่อมประโยค 
        ตัดพักอักขระพิเศษออก ให้เป็นเนื้อความเดียว มีแบ่งช่วงจังหวะหายใจ หากมีคำภาษาอังกฤษให้แปลเป็นไทยและสรุปมาเลย พยายามใช้คำไทย ห้ามทับศัพท์หรือจำเป็น จริง ๆ ก็อยากให้เยอะ
        หากเป็นตัวอักษรอังกฤษหรือตัวเลข ให้เป็นเป็นคำอ่านแทน
        และเมื่อจบให้ปิดท้าย ขอบคุณที่รับฟังครับพี่น้อง
        โดย format เป็นประมาณนี้
        ข้อความที่สรุปได้ : (......)
        """

        resp = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[fixed_prompt, uploaded]
        )
        return resp.text

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OCR process failed: {e}")
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"Temporary file deleted: {temp_file_path}")

async def summarize_gemini(
    text: str,
    model: str = settings.GEMINI_MODEL
) -> str:
    try:
        fixed_prompt = """แบ่งข้อความเป็นช่วง ๆ เป็นช่วงละ 300-400 ตัวอักษร ห้ามแบ่งให้คำขาด แบ่งให้ได้ใจความเป็นท่อน ๆ ไป โดย format ที่ผมอยากได้คือ 
        แบ่งเป็นข้อ ๆ โดยจะเป็นประมาณนี้
        1:.....
        2:.....
        3:.....
        """
        
        contents = [fixed_prompt, text]
        resp = client.models.generate_content(
            model=model,
            contents=contents
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Summarization failed: {e}")

    return resp.text


