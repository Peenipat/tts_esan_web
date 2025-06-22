import React, { useState } from "react";
import { combineAudio } from "./combineAudio";

type AudioItem = {
  id: string;
  url: string;
};

interface Props {
  audioList: AudioItem[];
}

const CombineAudioButton: React.FC<Props> = ({ audioList }) => {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleCombine = async () => {
    try {
      setLoading(true);
      const urls = audioList.map((item) => item.url);
      const audioBlob = await combineAudio(urls);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleCombine}
        disabled={loading}
      >
        {loading ? "กำลังรวมเสียง..." : "รวมเสียง"}
      </button>

      {audioUrl && (
        <div className="mt-4">
          <audio controls src={audioUrl} />
          <a href={audioUrl} download="combined.wav" className="ml-4 text-blue-500 underline">
            ดาวน์โหลด
          </a>
        </div>
      )}
    </div>
  );
};

export default CombineAudioButton;
