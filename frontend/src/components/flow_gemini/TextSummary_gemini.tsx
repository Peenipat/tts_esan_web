import { useState, useEffect } from "react";
import { parseSummary } from "../parseSummary";
import { generateSpeechForList } from "../generateSpeechForList";
import { combineAudio } from "../combineAudio";

type TextSummaryProps = {
  initialText: string;
  uploadedImage: File | null;
  onSummaryGenerated?: (text: string) => void;
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

export function TextSummary_gemini({
  initialText,
  uploadedImage,
  onSummaryGenerated,
}: TextSummaryProps) {
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
      onSummaryGenerated?.(summary);

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
    <div className="p-6 bg-white text-black border border-gray-300 rounded-xl shadow-md space-y-6">
      <div>
        <label className="block text-lg font-semibold mb-2 text-gray-800">
          📝 ข้อความจาก OCR (แก้ไขได้):
        </label>
        <textarea
          className="w-full min-h-[200px] p-4 border border-gray-400 rounded-lg bg-gray-50 text-black resize-y
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="กรุณาแก้ไขข้อความก่อนสร้างเสียง..."
          disabled={loading}
        />
      </div>

      <button
        onClick={handleAllInOne}
        disabled={loading}
        className={`w-full py-3 mt-2 rounded-lg font-medium text-white transition 
          ${loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:brightness-110"}`}
      >
        {loading ? "🎧 กำลังประมวลผล..." : "🎧 สร้างเสียงจากข้อความ"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md">
          ❗ {error}
        </div>
      )}

      {bundleUrl && (
        <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 space-y-4 shadow-inner">
          <h3 className="font-semibold text-lg text-blue-700">
            🎁 Bundle ID: {bundleUrl.bundle_id}
          </h3>

          {/* รูปภาพ */}
          {bundleUrl.files.img_url?.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
            <img
              src={bundleUrl.files.img_url}
              alt="Preview"
              className="w-full h-56 object-cover rounded-md border border-gray-400"
            />
          ) : (
            <a
              href={bundleUrl.files.img_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 underline hover:text-blue-800"
            >
              📎 เปิดดูไฟล์แนบ
            </a>
          )}

          {/* เสียง */}
          {bundleUrl.files.wav_url && (
            <div>
              <h4 className="text-gray-700 font-medium mb-2">🔊 ฟังเสียงที่สร้าง:</h4>
              <audio controls className="w-full">
                <source src={bundleUrl.files.wav_url} type="audio/wav" />
                ไม่สามารถเล่นเสียงในเบราว์เซอร์ของคุณได้
              </audio>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
