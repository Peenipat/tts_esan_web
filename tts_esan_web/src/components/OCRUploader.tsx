// src/components/OCRUploader.tsx
import React, { useState } from "react";

function OCRUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("task_type", "default");
    formData.append("page_num", "1");

    try {
      const res = await fetch("http://localhost:8000/api/ocr/", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      setResult(json.result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
      />
      <button
        onClick={handleSubmit}
        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        ประมวลผล OCR
      </button>
      <div className="mt-4 whitespace-pre-wrap bg-gray-100 p-2 rounded">
        {result}
      </div>
    </div>
  );
}

export default OCRUploader;
