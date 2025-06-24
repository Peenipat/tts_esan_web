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
      const items = parseSummary(summary);
      if (!items.length) throw new Error("ไม่สามารถแปลง summary เป็นข้อความได้");

      const audioList = await generateSpeechForList(items);
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
    <div className="p-6 bg-white border rounded-xl shadow-md space-y-6">
      <div>
        <label className="block text-lg font-semibold mb-2">ข้อความจาก OCR (แก้ไขได้):</label>
        <textarea
          className="w-full h-36 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        onClick={handleAllInOne}
        disabled={loading}
        className={`w-full py-3 rounded-lg text-white font-medium transition
          ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
        `}
      >
        {loading ? "กำลังประมวลผล..." : "🎧 สร้างเสียงจากข้อความ"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-md">
          ❗ {error}
        </div>
      )}

      {bundleUrl && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4 shadow-inner">
          <h3 className="font-semibold text-lg text-gray-800">Bundle ID: {bundleUrl.bundle_id}</h3>

          {/* แสดงภาพ */}
          {bundleUrl.files.img_url?.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
            <img
              src={bundleUrl.files.img_url}
              alt="Preview"
              className="w-full h-56 object-cover rounded-md border"
            />
          ) : (
            <a
              href={bundleUrl.files.img_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-white border rounded hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <span className="text-sm text-blue-600 underline">เปิดดูไฟล์แนบ</span>
            </a>
          )}

          {/* แสดงเสียง */}
          {bundleUrl.files.wav_url && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">ฟังเสียง:</h4>
              <audio controls className="w-full">
                <source src={bundleUrl.files.wav_url} type="audio/wav" />
                เบราว์เซอร์ของคุณไม่รองรับการเล่นเสียง
              </audio>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

