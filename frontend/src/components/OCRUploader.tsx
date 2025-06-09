import React, { useState } from "react";

function OCRUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<string>("");
  const [editedResult, setEditedResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // สเตตใหม่สำหรับ summary
  const [summary, setSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setOcrResult("");
      setEditedResult("");
      setError("");
      setSummary("");
      setSummaryError("");
    }
  };

  const handleSubmitOCR = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setOcrResult("");
    setEditedResult("");
    setSummary("");
    setSummaryError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("task_type", "default");
      formData.append("page_num", "1");

      const res = await fetch("http://localhost:8000/api/ocr/?task_type=default&page_num=1", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.detail || "Unknown error from server");
      }

      const json = await res.json();
      setOcrResult(json.result);
      setEditedResult(json.result);
    } catch (err: any) {
      setError(err.message || "Error while processing OCR");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdits = async () => {
    // เมื่อบันทึกการแก้ไขแล้ว ให้เรียก summary
    if (!editedResult) return;

    setSummaryLoading(true);
    setSummaryError("");
    setSummary("");

    try {
      const res = await fetch("http://localhost:8000/api/summary/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: editedResult,
          use_cache: true
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to summarize");
      }
      const data = await res.json();
      setSummary(data.summary);
    } catch (err: any) {
      setSummaryError(err.message || "Error while summarizing");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* OCR Uploader */}
      <h2 className="text-2xl font-semibold mb-4">OCR Demo</h2>

      <label className="block mb-2 font-medium">เลือกไฟล์ (PDF/ภาพ):</label>
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
        className="block w-full border rounded px-2 py-1"
      />

      <button
        onClick={handleSubmitOCR}
        disabled={loading || !file}
        className={`mt-4 px-5 py-2 rounded text-white ${
          loading || !file ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "กำลังประมวลผล..." : "ประมวลผล OCR"}
      </button>

      {error && <div className="mt-4 text-red-600">Error: {error}</div>}

      {/* Editable OCR Result */}
      {ocrResult && (
        <div className="mt-6">
          <label className="block mb-2 font-medium">ผลลัพธ์ OCR (แก้ไขได้):</label>
          <textarea
            value={editedResult}
            onChange={(e) => setEditedResult(e.target.value)}
            className="w-full h-64 border rounded p-3 bg-gray-50 resize-y"
          />

          <button
            onClick={handleSaveEdits}
            disabled={summaryLoading}
            className={`mt-4 px-5 py-2 rounded text-white ${
              summaryLoading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {summaryLoading ? "กำลังสรุป..." : "สรุปข้อความนี้"}
          </button>
        </div>
      )}

      {/* Summary Result */}
      {summaryError && <div className="mt-4 text-red-600">Error: {summaryError}</div>}
      {summary && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">ผลลัพธ์สรุป (แก้ไขได้):</h3>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}  // ถ้าไม่ให้แก้ ก็ลบ onChange ออก
            className="w-full h-64 border border-gray-300 rounded p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y whitespace-pre-wrap"
          />
        </div>
      )}
    </div>
  );
}

export default OCRUploader;
