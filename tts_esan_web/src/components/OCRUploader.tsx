// src/components/OCRUploader.tsx
import React, { useState } from "react";

function OCRUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult("");    // ล้างผลลัพธ์เก่า
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("task_type", "default");   // เปลี่ยนได้ถ้าคุณมีโหมดอื่น
      formData.append("page_num", "1");

      const res = await fetch("http://localhost:8000/api/ocr/?task_type=default&page_num=1", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        // อ่านข้อความ error ที่ FastAPI คืนให้ (detail)
        const errorJson = await res.json();
        throw new Error(errorJson.detail || "Unknown error from server");
      }

      const json = await res.json();
      setResult(json.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error while processing OCR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <label className="block mb-2 font-medium text-gray-700">เลือกไฟล์ (PDF/ภาพ):</label>
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
        className="border border-gray-300 rounded px-2 py-1 w-full"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !file}
        className={`mt-4 px-4 py-2 rounded text-white ${
          loading || !file ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "กำลังประมวลผล..." : "ประมวลผล OCR"}
      </button>

      {error && (
        <div className="mt-4 text-red-600 font-medium">
          เกิดข้อผิดพลาด: {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <label className="block mb-2 font-medium text-gray-700">ผลลัพธ์ OCR:</label>
          <div className="p-4 bg-gray-100 rounded whitespace-pre-wrap overflow-x-auto">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

export default OCRUploader;
