import  { useState } from "react";
const API_BASE = import.meta.env.VITE_DEV;
// const API_BASE = import.meta.env.VITE_PRODUCTION;

type TextSummaryProps = {
  initialText: string;
};

export function TextSummary({ initialText }: TextSummaryProps) {
  const [text, setText] = useState(initialText);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/summary/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, use_cache: true }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Summary failed");
      }
      const { summary: sum } = await res.json();
      setSummary(sum);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded space-y-3 mt-6">
      <h3 className="font-semibold">2. Edit & Summarize</h3>
      <label className="block mb-1 font-medium">ข้อความจาก OCR (แก้ไขได้):</label>
      <textarea
        className="w-full h-32 border rounded p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleSummarize}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "กำลังสรุป..." : "สรุปข้อความนี้"}
      </button>
      {error && <div className="text-red-600">{error}</div>}
      {summary && (
        <>
          <label className="block mt-4 mb-1 font-medium">ผลลัพธ์สรุป:</label>
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
