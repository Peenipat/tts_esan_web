// src/components/TtsPlayer.tsx
import { useState } from 'react';

// const API_BASE = import.meta.env.VITE_PRODUCTION;

type TtsPlayerProps = {
  initialText: string;
};

function VaojaPlayer({ initialText }: TtsPlayerProps) {
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setError('กรุณากรอกข้อความ');
      return;
    }

    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch(`/api/vaoja-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          speaker: 'mukda',
          pace: 1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const wavUrl = data.wav_url;

      if (!wavUrl) {
        throw new Error('ไม่พบลิงก์ไฟล์เสียงจาก API');
      }

      setAudioUrl(wavUrl);

      const audio = new Audio(wavUrl);
      await audio.play().catch(e => console.error('Error playing audio:', e));
    } catch (err: any) {
      setError(err.message ?? 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full mx-auto border rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Vaoja TTS Player</h2>

      <textarea
        rows={4}
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={loading}
        className="w-full p-3 mb-4 border rounded-md disabled:opacity-50"
        placeholder="กรอกข้อความที่นี่..."
      />

      <button
        onClick={handleGenerateSpeech}
        disabled={loading}
        className={`w-full py-3 text-white font-medium rounded-md 
          ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        {loading ? 'กำลังสร้างเสียง...' : 'แปลงข้อความเป็นเสียง'}
      </button>

      {error && (
        <p className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          Error: {error}
        </p>
      )}

      {audioUrl && (
        <div className="mt-6 text-center">
          <h3 className="text-xl font-semibold mb-3">ฟังเสียง:</h3>
          <audio controls src={audioUrl} className="w-full mb-2">
            เบราว์เซอร์ไม่รองรับการเล่นเสียง
          </audio>
          <p className="text-sm text-gray-500">
            สามารถดาวน์โหลดไฟล์ได้ที่ปุ่มดาวน์โหลดด้านขวา
          </p>
        </div>
      )}
    </div>
  );
}

export default VaojaPlayer;
