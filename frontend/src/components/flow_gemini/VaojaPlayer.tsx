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
    <div className="bg-[#1a0f2b] border border-[#3b2b4f] rounded-xl p-6 shadow-lg w-full text-white space-y-6">
      <h2 className="text-xl font-bold text-white">🗣️ Text-to-Speech</h2>

      <textarea
        rows={4}
        value={text}
        onChange={e => setText(e.target.value)}
        className="w-full p-3 border border-[#4a3b5c] bg-[#26183c] text-white rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
        placeholder="กรอกข้อความที่ต้องการแปลงเสียง..."
        disabled={loading}
      />

      <button
        onClick={handleGenerateSpeech}
        disabled={loading || !text.trim()}
        className={`w-full py-2 rounded-md text-white font-medium transition 
          ${loading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-700 to-indigo-800 hover:opacity-90 shadow-md'}`}
      >
        {loading ? 'กำลังแปลงเสียง...' : 'แปลงข้อความเป็นเสียง'}
      </button>

      {error && (
        <div className="p-3 bg-red-700 text-white border border-red-500 rounded-md">
          ⚠️ {error}
        </div>
      )}

      {audioUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-200">ฟังเสียงที่ได้:</h3>
          <audio controls src={audioUrl} className="w-full rounded" />
        </div>
      )}
    </div>
  );
}

export default VaojaPlayer;
