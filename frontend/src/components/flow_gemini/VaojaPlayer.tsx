import { useState } from 'react';

const API_BASE = import.meta.env.VITE_DEV;

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
      const response = await fetch(`${API_BASE}/api/vaoja-tts`, {
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

      if (!wavUrl) throw new Error('ไม่พบลิงก์ไฟล์เสียง');

      setAudioUrl(wavUrl);

      const audio = new Audio(wavUrl);
      await audio.play();
    } catch (err: any) {
      setError(err.message ?? 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm w-full">
      <h2 className="text-xl font-bold mb-4">🔊 Text-to-Speech</h2>

      <textarea
        rows={4}
        value={text}
        onChange={e => setText(e.target.value)}
        className="w-full p-3 border rounded-md mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
        placeholder="กรอกข้อความที่ต้องการแปลงเสียง..."
        disabled={loading}
      />

      <button
        onClick={handleGenerateSpeech}
        disabled={loading}
        className={`w-full py-2 rounded-md text-white font-medium transition 
          ${loading ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {loading ? "กำลังแปลงเสียง..." : "แปลงข้อความเป็นเสียง"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-300 rounded">
          ⚠️ {error}
        </div>
      )}

      {audioUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">ฟังเสียงที่ได้</h3>
          <audio controls src={audioUrl} className="w-full rounded" />
        </div>
      )}
    </div>
  );
}

export default VaojaPlayer;
