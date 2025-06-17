import React, { useState } from "react";
//const API_BASE = import.meta.env.VITE_DEV;
// const API_BASE = import.meta.env.VITE_DEV;
const API_BASE = import.meta.env.VITE_PRODUCTION;

type OCRUploaderProps = {
  onResult: (text: string) => void;
};

export function GeminiOCR({ onResult }: OCRUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("")

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
      formData.append("prompt", prompt)

      const res = await fetch(`${API_BASE}/api/gemini/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Unknown server error");
      }
      const { text } = await res.json();
      onResult(text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded space-y-3">
      <label className="font-semibold">1. OCR (gemini)</label>
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
        className="w-full border px-2 py-1 rounded"
      />
      <div>
        <label htmlFor="prompt" className="font-semibold">2. Set prompt</label>
        <input type="text" onChange={(e) => {
          const value = e.target.value
          setPrompt(value)
        }} 
        placeholder="กรอก prompt"
        className="w-full border px-2 py-1 rounded" />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className={`px-4 py-2 rounded text-white ${!file || loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
      >
        {loading ? "กำลังประมวลผล..." : "ประมวลผล OCR"}
      </button>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
