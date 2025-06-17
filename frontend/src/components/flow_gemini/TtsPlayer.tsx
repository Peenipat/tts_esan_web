// src/components/TtsPlayer.tsx
import { useState } from 'react';

const API_BASE = import.meta.env.VITE_PRODUCTION;
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
      setError('Please enter some text.');
      return;
    }

    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('language', language);

      const response = await fetch(`${API_BASE}/api/iapp-tts`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorDetail}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      const audio = new Audio(url);
      await audio.play().catch(e => console.error('Error playing audio:', e));
    } catch (err: any) {
      console.error('Failed to generate speech:', err);
      setError(err?.message ?? 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full mx-auto  border  rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">iApp TTS Player</h2>

      <div className="mb-6">
        <label htmlFor="text-input" className="block mb-2 font-medium">
          คำที่จะสร้างเสียง:
        </label>
        <textarea
          id="text-input"
          rows={4}
          cols={50}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter text here..."
          disabled={loading}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="language-select" className="block mb-2 font-medium">
          เลือกภาษา:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          disabled={loading}
          className="w-full p-3 border  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >
          <option value="TH">Thai (TH)</option>
          <option value="EN">English (EN)</option>
        </select>
      </div>

      <button
        onClick={handleGenerateSpeech}
        disabled={loading}
        className={`w-full py-3 text-white font-medium rounded-md 
          ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        {loading ? 'Generating...' : 'Generate and Play Speech'}
      </button>

      {error && (
        <p className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          Error: {error}
        </p>
      )}

      {audioUrl && (
        <div className="mt-6 text-center">
          <h3 className="text-xl font-semibold mb-3">Listen to Speech:</h3>
          <audio controls src={audioUrl} className="w-full mb-2">
            Your browser does not support the audio element.
          </audio>
          <p className="text-sm text-gray-500">
            สามารถดาวโหลดไฟล์ที่ Icon ด้านขวามือ
          </p>
        </div>
      )}
    </div>
  );
}

export default TtsPlayer;
