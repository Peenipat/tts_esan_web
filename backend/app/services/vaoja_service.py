import requests # type: ignore
from typing import Optional


class Text2SpeechService:
    def __init__(self, base_url: str = "https://vaoja-api.computing.kku.ac.th"):
        self.base_url = base_url
        self.endpoint = "/text2speech"

    def synthesize(
        self,
        text: str,
        speaker: str = "mukda",
        pace: float = 1.0
    ) -> Optional[dict]:
        """
        ส่งข้อความเพื่อแปลงเป็นเสียง (TTS) ผ่าน API

        Args:
            text (str): ข้อความที่ต้องการแปลงเป็นเสียง
            speaker (str): ชื่อ speaker เช่น 'mukda'
            pace (float): ความเร็วในการพูด (เช่น 1.0 = ปกติ)

        Returns:
            dict: Response JSON เช่น {"msg": "...", "wav_url": "...", ...}
        """
        url = f"{self.base_url}{self.endpoint}"
        payload = {
            "text": text,
            "speaker": speaker,
            "pace": pace
        }

        try:
            response = requests.post(
                url,
                headers={"Content-Type": "application/json", "accept": "application/json"},
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            return response.json()

        except requests.RequestException as e:
            print(f"[TTS API Error] {e}")
            return None
