import { useState } from "react";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';


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
    <div className="bg-[#f8f1e4] text-[#4e2b1d] p-6 rounded-xl space-y-6 border border-[#dab88b] shadow-md">
      <h2 className="text-xl font-semibold">📄 แนบเอกสารเพื่อแปลงข้อความ</h2>

      {/* Preview */}
      <div className="w-full border-2 border-dashed border-[#d6a55c] rounded-xl h-48 flex items-center justify-center text-[#a37745] text-sm bg-[#fcf9f3]">
        {file ? (
          <Zoom>
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="max-h-40 object-contain rounded-md cursor-zoom-in"
            />
          </Zoom>
        ) : (
          <span>📷 ตัวอย่างรูปจะโชว์ตรงนี้</span>
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
        className="bg-[#eab308] hover:bg-[#ca8a04] text-white px-4 py-2 rounded-md cursor-pointer transition text-center inline-block shadow font-semibold"
      >
        📁 เลือกไฟล์
      </label>

      {/* OCR Button */}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className={`w-full py-2 rounded-md text-white font-semibold transition 
          ${!file || loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-[#f59e0b] to-[#b45309] hover:opacity-90 shadow-md"}`}
      >
        {loading ? "กำลังแปลงข้อความ..." : "🔍 เริ่มประมวลผล OCR"}
      </button>

      {/* OCR Result */}
      <div>
        <h3 className="text-lg font-semibold mb-2">📜 ผลลัพธ์ OCR</h3>
        <div className="whitespace-pre-wrap text-[#5c3c22] leading-relaxed text-sm min-h-[6rem] border-t border-[#dab88b] pt-3 bg-[#fdf8f1] p-2 rounded-md">
          {ocrText || "ยังไม่มีข้อความที่แปลงได้"}
        </div>
      </div>

      {/* Error */}
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
}
