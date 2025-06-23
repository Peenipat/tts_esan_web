import { useState, useEffect } from "react";
import { parseSummary } from "../parseSummary";
import { generateSpeechForList } from "../generateSpeechForList";
import { combineAudio } from "../combineAudio";
// import type { TextItem, AudioResult } from '../generateSpeechForList'
// import SummaryRenderer from "../Rendder/SummaryRender";
//const API_BASE = import.meta.env.VITE_DEV;
// const API_BASE = import.meta.env.VITE_DEV;
// const API_BASE = import.meta.env.VITE_PRODUCTION;

type TextSummaryProps = {
  initialText: string;
  uploadedImage: File | null
};

interface SummaryItem {
  id: string;
  text: string;
}

type BundleData = {
  bundle_id: string;
  created_at: string;
  files: {
    wav_url: string;
    img_url: string;
  };
};
export function SummaryProcessor({ summary }: { summary: string }) {
  const [summaryList, setSummaryList] = useState<SummaryItem[]>([]);

  useEffect(() => {
    if (!summary) return;

    const items = summary.split(/\n(?=\d+:)/g).map((item) => {
      const match = item.match(/^(\d+):\s*(.*)/s);
      if (!match) return null;

      return {
        id: match[1],
        text: match[2].trim(),
      };
    });

    setSummaryList(items.filter(Boolean) as SummaryItem[]);
  }, [summary]);

  return (
    <div className="space-y-4">
      {summaryList.map((item) => (
        <div key={item.id} className="p-4 border rounded shadow-sm bg-white text-gray-900">
          <h2 className="font-bold">ข้อ {item.id}</h2>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  );
}



export function TextSummary_gemini({ initialText, uploadedImage }: TextSummaryProps) {
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bundleUrl, setBundleUrl] = useState<BundleData | null>(null);


  const handleAllInOne = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Summarize
      const formData = new FormData();
      formData.append("text", text);
      const res = await fetch(`/api/gemini/summary`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Summary failed");
      }
      const { summary } = await res.json();

      // 2. Parse summary → TextItem[]
      const items = parseSummary(summary); // ให้ return [{id, text}, ...]
      if (!items.length) throw new Error("ไม่สามารถแปลง summary เป็นข้อความได้");

      // 3. Generate TTS
      const audioList = await generateSpeechForList(items); // return [{id, url}, ...]

      // 4. Combine + Upload
      const result = await combineAudio(
        audioList.map((a) => a.url),
        undefined,
        uploadedImage ?? undefined
      );
      
      setBundleUrl(result); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded space-y-3 mt-6">
      <h3 className="font-semibold">1. Summarize - Generate - Upload</h3>
      <label className="block mb-1 font-medium">ข้อความจาก OCR (แก้ไขได้):</label>
      <textarea
        className="w-full h-32 border rounded p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleAllInOne}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
      >
        {loading ? "กำลังประมวลผล..." : "สร้างเสียง"}
      </button>
      {error && <div className="text-red-600">{error}</div>}

      {bundleUrl && (
        <div key={bundleUrl.bundle_id} className="border rounded-xl p-4 bg-white shadow text-black">
          <h3 className="font-semibold text-lg mb-2">Bundle: {bundleUrl.bundle_id}</h3>

          {/* รูปภาพ หรือ PDF */}
          {bundleUrl.files.img_url?.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
            <img
              src={bundleUrl.files.img_url}
              alt="Preview"
              className="w-full h-40 object-cover rounded mb-2"
            />
          ) : (
            <a
              href={bundleUrl.files.img_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm mb-2 flex flex-col items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 mb-1 text-blue-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <span className="text-xs">ดูไฟล์แนบ</span>
            </a>
          )}

          {/* เสียง */}
          {bundleUrl.files.wav_url && (
            <audio controls className="w-full mt-2">
              <source src={bundleUrl.files.wav_url} type="audio/wav" />
              เบราว์เซอร์ของคุณไม่รองรับการเล่นเสียง
            </audio>
          )}
        </div>
      )}

    </div>
  );
}

