// src/components/OCRUploader.tsx
import React, { useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE;

function OCRUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<string>("");
  const [editedResult, setEditedResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setOcrResult("");
      setEditedResult("");
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setOcrResult("");
    setEditedResult("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("task_type", "default");
      formData.append("page_num", "1");

      const res = await fetch(`${API_BASE}/api/ocr/?task_type=default&page_num=1`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.detail || "Unknown error from server");
      }

      const json = await res.json();
      const extractedText = json.result;
      setOcrResult(extractedText);
      setEditedResult(extractedText);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error while processing OCR");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdits = () => {
    console.log("Edited text:", editedResult);
    alert("บันทึกข้อความที่แก้ไขแล้ว");
    // ถ้ามี API endpoint เพิ่มเติม ให้ fetch ส่ง editedResult ไปที่นั่นได้เลย
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">OCR Demo</h2>

      <label className="block mb-2 font-medium text-gray-700">
        เลือกไฟล์ (PDF/ภาพ):
      </label>
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
        className="block w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !file}
        className={`mt-4 px-5 py-2 rounded text-white ${
          loading || !file
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "กำลังประมวลผล..." : "ประมวลผล OCR"}
      </button>

      {error && (
        <div className="mt-4 text-red-600 font-medium">Error: {error}</div>
      )}

      {ocrResult && (
        <div className="mt-6">
          <label className="block mb-2 font-medium text-gray-700">
            ผลลัพธ์ OCR (แก้ไขได้):
          </label>
          <textarea
            value={editedResult}
            onChange={(e) => setEditedResult(e.target.value)}
            className="w-full h-64 border border-gray-300 rounded p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
          />
          {/* 
            - w-full: ให้กว้างเต็มพื้นที่ที่ parent กำหนด (max-w-3xl)
            - h-64: กำหนดความสูงประมาณ 16rem (ปรับเป็น h-80, h-96 หรือตัวเลข custom ได้)
            - resize-y: อนุญาตให้ผู้ใช้ปรับขนาดแนวตั้งได้ถ้าต้องการ
          */}

          <button
            onClick={handleSaveEdits}
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            บันทึกข้อความที่แก้ไข
          </button>
        </div>
      )}
    </div>
  );
}

export default OCRUploader;
