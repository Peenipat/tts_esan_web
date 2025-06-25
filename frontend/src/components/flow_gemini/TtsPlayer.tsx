import { useState } from 'react';

type TtsPlayerProps = {
  initialText: string;
};

function TtsPlayer({ initialText }: TtsPlayerProps) {
  const [text, setText] = useState<string>(initialText);
  const [language, setLanguage] = useState<string>('TH');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setError('กรุณากรอกข้อความก่อน');
      return;
    }

    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('language', language);

      const response = await fetch(`/api/iapp-tts`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorDetail}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      const audio = new Audio(url);
      await audio.play().catch(e => console.error('Error playing audio:', e));
    } catch (err: any) {
      console.error('Failed to generate speech:', err);
      setError(err?.message ?? 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e2233] text-white p-6 rounded-xl space-y-6 border border-gray-600 shadow-md">
      <h2 className="text-2xl font-semibold">🗣️ สร้างเสียงจากข้อความ (TTS)</h2>

      <div>
        <label htmlFor="text-input" className="block mb-2 font-medium text-gray-200">
          📝 คำที่ต้องการให้พูด:
        </label>
        <textarea
          id="text-input"
          rows={4}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="พิมพ์ข้อความที่นี่..."
          disabled={loading}
          className="w-full p-3 rounded-md bg-[#2a2f45] text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="language-select" className="block mb-2 font-medium text-gray-200">
          🌐 เลือกภาษา:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          disabled={loading}
          className="w-full p-3 rounded-md bg-[#2a2f45] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="TH">🇹🇭 ภาษาไทย (TH)</option>
          <option value="EN">🇺🇸 ภาษาอังกฤษ (EN)</option>
        </select>
      </div>

      <button
        onClick={handleGenerateSpeech}
        disabled={loading}
        className={`w-full py-3 rounded-md font-semibold text-white transition 
          ${loading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110'}`}
      >
        {loading ? '⏳ กำลังประมวลผลเสียง...' : '🔊 สร้างเสียงและเล่นทันที'}
      </button>

      {error && (
        <p className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          ⚠️ {error}
        </p>
      )}

      {audioUrl && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">🎧 ฟังเสียงที่สร้าง:</h3>
          <audio controls src={audioUrl} className="w-full mb-1" />
          <p className="text-sm text-gray-400">สามารถกดไอคอนด้านขวาเพื่อดาวน์โหลดไฟล์เสียง</p>
        </div>
      )}
    </div>
  );
}

export default TtsPlayer;
