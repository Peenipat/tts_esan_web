import { useState } from "react";
//const API_BASE = import.meta.env.VITE_DEV;
// const API_BASE = import.meta.env.VITE_DEV;
// const API_BASE = import.meta.env.VITE_PRODUCTION;

type TextSummaryProps = {
  initialText: string;
  onResult: (text: string) => void;
};

export function TextSummary_gemini({ initialText,onResult }: TextSummaryProps) {
  const [text, setText] = useState(initialText);
  const [summary, setSummary] = useState("");
  const [prompt, setPrompt] = useState<string>("")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("text", text);
      if (prompt === "") {
        formData.append("prompt", "สรุปข้อความที่ให้ไปเป็นข้อความสั้น ๆ : ")
      } else {
        formData.append("prompt", prompt)
      }

      const res = await fetch(`/api/gemini/summary`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Summary failed");
      }
      const { summary } = await res.json();
      setSummary(summary);
      onResult(summary)
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded space-y-3 mt-6">
      <h3 className="font-semibold">1. Edit & Summarize</h3>
      <label className="block mb-1 font-medium">ข้อความจาก OCR (แก้ไขได้):</label>
      <textarea
        className="w-full h-32 border rounded p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
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
        onClick={handleSummarize}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
      >
        {loading ? "กำลังปรับแต่ง..." : "ปรับแต่งข้อความ"}
      </button>
      {error && <div className="text-red-600">{error}</div>}
      {summary && (
        <>
          <label className="block mt-4 mb-1 font-medium">ผลลัพธ์:</label>
          <textarea
            className="w-full h-32 border rounded p-2 bg-gray-50"
            value={summary}
            readOnly
          />
        </>
      )}
    </div>
  );
}
