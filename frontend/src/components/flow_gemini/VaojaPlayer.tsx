import { useEffect, useState } from 'react';

type TtsPlayerProps = {
  initialText: string;
  setText: (text: string) => void;
  onReset?: () => void;
};

function VaojaPlayer({ initialText, setText, onReset }: TtsPlayerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedText = localStorage.getItem('vaojaText');
    if (savedText) {
      setText(savedText);
    }
  }, []);

  useEffect(() => {
    if (initialText.trim()) {
      localStorage.setItem('vaojaText', initialText);
    } else {
      localStorage.removeItem('vaojaText');
    }
  }, [initialText]);

  const handleGenerateSpeech = async () => {
    if (!initialText.trim()) {
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
          text: initialText,
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
    } catch (err: any) {
      setError(err.message ?? 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
    } finally {
      setLoading(false);
    }
  };

  const handleResetText = () => {
    localStorage.removeItem('vaojaText');
    setText('');
    setError(null);
    setAudioUrl(null);
    onReset?.();
  };

  return (
    <div className="bg-[#fff7e6] border border-[#ecd9a5] rounded-xl p-6 shadow-md w-full text-[#4e2b1d] space-y-6">
      <h2 className="text-xl font-bold text-[#6b3e1d]">🗣️ แปลงข้อความเป็นเสียงพ่อใหญ่บ้าน</h2>

      <div className="space-y-2">
        <textarea
          rows={4}
          value={initialText}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 border border-[#e0c090] bg-[#fffaf2] text-[#4e2b1d] rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-[#f59e0b] font-medium"
          placeholder="พิมพ์ข้อความที่อยากให้พ่อใหญ่บ้านประกาศ..."
          disabled={loading}
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleResetText}
            disabled={loading || !initialText.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-white transition 
              ${loading || !initialText.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#facc15] to-[#d97706] hover:brightness-110 shadow'}`}
          >
            ✏️ ล้างข้อความ
          </button>
        </div>
      </div>

      <button
        onClick={handleGenerateSpeech}
        disabled={loading || !initialText.trim()}
        className={`w-full py-2 rounded-md font-medium text-white transition 
          ${loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#eab308] to-[#b45309] hover:brightness-110 shadow'}`}
      >
        {loading ? '🎧 กำลังแปลงเสียงเด้อ...' : '🔊 ฟังเสียงประกาศ'}
      </button>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 border border-red-300 rounded-md">
          ⚠️ {error}
        </div>
      )}

      {loading && !audioUrl && (
        <p className="text-sm italic text-[#a16207]">🔄 กำลังแปลงและโหลดเสียง กรุณารอสักครู่...</p>
      )}

      {audioUrl && (
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-semibold text-[#5c3c1a]">ฟังเสียงที่แปลงได้:</h3>
          <div className="border border-[#e4caa0] bg-[#fffaf4] rounded-xl p-4 shadow-inner">
            <audio
              controls
              src={audioUrl}
              className="w-full accent-[#d97706] rounded-md"
              preload="auto"
            >
              Your browser does not support the audio element.
            </audio>
          </div>

          <div className="text-right mt-2">
            <a
              href={audioUrl}
              download="voiced-announcement.wav"
              className="inline-block px-4 py-2 rounded-md text-white bg-gradient-to-r from-[#4ade80] to-[#16a34a] hover:brightness-110 shadow font-medium text-sm"
            >
              ⬇️ ดาวน์โหลดไฟล์เสียง
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default VaojaPlayer;
