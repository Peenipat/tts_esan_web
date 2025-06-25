import { useState } from 'react';

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
    <div className="bg-[#fff7e6] border border-[#ecd9a5] rounded-xl p-6 shadow-md w-full text-[#4e2b1d] space-y-6">
      <h2 className="text-xl font-bold text-[#6b3e1d]">🗣️ แปลงข้อความเป็นเสียงพ่อใหญ่บ้าน</h2>

      <textarea
        rows={4}
        value={text}
        onChange={e => setText(e.target.value)}
        className="w-full p-3 border border-[#e0c090] bg-[#fffaf2] text-[#4e2b1d] rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-[#f59e0b] font-medium"
        placeholder="พิมพ์ข้อความที่อยากให้พ่อใหญ่บ้านประกาศ..."
        disabled={loading}
      />

      <button
        onClick={handleGenerateSpeech}
        disabled={loading || !text.trim()}
        className={`w-full py-2 rounded-md font-medium text-white transition 
          ${loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#eab308] to-[#b45309] hover:brightness-110 shadow'}`}
      >
        {loading ? 'กำลังแปลงเสียงเด้อ...' : '🔊 ฟังเสียงประกาศ'}
      </button>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 border border-red-300 rounded-md">
          ⚠️ {error}
        </div>
      )}

      {audioUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-[#5c3c1a]">ฟังเสียงที่แปลงได้:</h3>
          <audio controls src={audioUrl} className="w-full rounded border border-[#e2c68c]" />
        </div>
      )}
    </div>
  );
}

export default VaojaPlayer;
