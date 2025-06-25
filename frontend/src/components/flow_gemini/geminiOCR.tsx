import { useState } from "react";

type OCRUploaderProps = {
  onResult: (text: string) => void;
  onFile: (file: File) => void;
};

export function GeminiOCR({ onResult, onFile }: OCRUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    onFile(selectedFile);
    setError("");
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/gemini/`, {
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
    <div className="bg-[#1a0f2b] text-white p-6 rounded-xl space-y-6 border border-[#3b2b4f] shadow-lg">
      <h2 className="text-xl font-semibold">📄 อัปโหลดเอกสารและดูผล OCR</h2>

      {/* Preview */}
      <div className="w-full border-2 border-dashed border-[#4a3b5c] rounded-xl h-48 flex items-center justify-center text-gray-400 text-sm">
        {file ? (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="max-h-40 object-contain rounded-md"
          />
        ) : (
          <span>📷 Preview will appear here</span>
        )}
      </div>

      {/* File input */}
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
        className="hidden"
        id="upload"
      />
      <label
        htmlFor="upload"
        className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-4 py-2 rounded-md cursor-pointer hover:opacity-90 transition text-center inline-block shadow"
      >
        📁 เลือกไฟล์
      </label>

      {/* OCR Button */}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className={`w-full py-2 rounded-md text-white font-semibold transition 
          ${!file || loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-700 to-indigo-800 hover:opacity-90 shadow-lg"}`}
      >
        {loading ? "กำลังประมวลผล..." : "🔍 ประมวลผล OCR"}
      </button>

      {/* OCR Result */}
      <div>
        <h3 className="text-lg font-semibold mb-2">OCR Result</h3>
        <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-sm min-h-[6rem] border-t border-[#3b2b4f] pt-3">
          {ocrText || "ยังไม่มีผลลัพธ์"}
        </div>
      </div>

      {/* Error */}
      {error && <div className="text-red-400 text-sm">{error}</div>}
    </div>
  );
}
