import { useState } from "react";
import { parseSummary } from "../parseSummary";
import { generateSpeechForList } from "../generateSpeechForList";
import { combineAudio } from "../combineAudio";
import TextareaAutosize from 'react-textarea-autosize';


type TextSummaryProps = {
  initialText: string;
  uploadedImage: File | null;
  onSummaryGenerated?: (text: string) => void;
};


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
    <div className="p-6 bg-[#fdf5e6] text-[#4b2b1a] border border-[#e5c89c] rounded-xl shadow-md space-y-6">
      <div>
        <label className="block text-lg font-semibold mb-2 text-[#6b3e1d]">
          📝 แก้ไขข้อความก่อนสร้างเสียง:
        </label>
        <TextareaAutosize
          className="w-full p-4 border border-[#e0c090] rounded-lg bg-[#fffaf2] text-[#40210a]
             focus:outline-none focus:ring-2 focus:ring-[#eab308] transition duration-150 resize-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="พิมพ์หรือแก้ไขข้อความที่ได้จากเอกสารก่อนเด้อ..."
          disabled={loading}
          minRows={5}
        />
      </div>

      <button
        onClick={handleAllInOne}
        disabled={loading}
        className={`w-full py-3 mt-2 rounded-lg font-medium text-white transition 
          ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-[#eab308] to-[#b45309] hover:brightness-110 shadow-md"}`}
      >
        {loading ? "🎧 กำลังแปลงเสียงเด้อ..." : "🎧 แปลงเป็นเสียงพ่อใหญ่บ้าน"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md">
          ❗ {error}
        </div>
      )}

      {bundleUrl && (
        <div className="bg-[#fef7ea] border border-[#e8d6b0] rounded-xl p-4 space-y-4 shadow-inner">
          <h3 className="font-semibold text-lg text-[#8a4b02]">
            🎁 Bundle ID: {bundleUrl.bundle_id}
          </h3>

          {/* รูปภาพ */}
          {bundleUrl.files.img_url?.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
            <img
              src={bundleUrl.files.img_url}
              alt="Preview"
              className="w-full h-56 object-cover rounded-md border border-[#d3a866]"
            />
          ) : (
            <a
              href={bundleUrl.files.img_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[#7c3e00] underline hover:text-[#a8550b]"
            >
              📎 เปิดดูไฟล์แนบ
            </a>
          )}

          {/* เสียง */}
          {bundleUrl.files.wav_url && (
            <div>
              <h4 className="text-[#5c3c1a] font-medium mb-2">🔊 ฟังเสียงประกาศ:</h4>
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
