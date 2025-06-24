import { useState } from "react";

const API_BASE = import.meta.env.VITE_DEV;

type OCRUploaderProps = {
  onResult: (text: string) => void;
};

export function GeminiOCR({ onResult }: OCRUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setFile(e.target.files[0]);
    setError("");
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/gemini/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Unknown server error");
      }

      const { text } = await res.json();
      setOcrText(text);
      onResult(text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 bg-[#fdfaf6] p-6 rounded-xl shadow-md border">
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center space-y-4 w-full">
        <h2 className="text-xl font-semibold">Upload Image</h2>
        <div className="w-full border-2 border-dashed rounded-xl h-48 flex items-center justify-center text-gray-400">
          <span>📷 Image Preview</span>
        </div>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={handleFileChange}
          className="hidden"
          id="upload"
        />
        <label
          htmlFor="upload"
          className="bg-[#88c2c3] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#76b3b4] transition"
        >
          เลือกไฟล์
        </label>

        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className={`w-full py-2 rounded-md text-white font-medium transition 
            ${!file || loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "กำลังประมวลผล..." : "ประมวลผล OCR"}
        </button>

        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      {/* OCR Result */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-2">OCR Result</h2>
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {ocrText || "ยังไม่มีผลลัพธ์"}
        </div>
      </div>
    </div>
  );
}
