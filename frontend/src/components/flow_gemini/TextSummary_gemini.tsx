import { useState, useEffect } from "react";
import SummaryRenderer from "../Rendder/SummaryRender";
//const API_BASE = import.meta.env.VITE_DEV;
// const API_BASE = import.meta.env.VITE_DEV;
// const API_BASE = import.meta.env.VITE_PRODUCTION;

type TextSummaryProps = {
  initialText: string;
  onResult: (text: string) => void;
};

interface SummaryItem {
  id: string;
  text: string;
}
export function SummaryProcessor({ summary }: { summary: string }) {
  const [summaryList, setSummaryList] = useState<SummaryItem[]>([]);

  useEffect(() => {
    if (!summary) return;

    const items = summary.split(/\n(?=\d+:)/g).map((item) => {
      const match = item.match(/^(\d+):\s*(.*)/s);
      if (!match) return null;

      return {
        id: match[1],
        text: match[2].trim(),
      };
    });

    setSummaryList(items.filter(Boolean) as SummaryItem[]);
  }, [summary]);

  return (
    <div className="space-y-4">
      {summaryList.map((item) => (
        <div key={item.id} className="p-4 border rounded shadow-sm bg-white text-gray-900">
          <h2 className="font-bold">ข้อ {item.id}</h2>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  );
}


export function TextSummary_gemini({ initialText, onResult }: TextSummaryProps) {
  const [text, setText] = useState(initialText);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("text", text);

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
          <div className="container mx-auto px-4 py-6">
            <SummaryRenderer summary={summary} />
          </div>
        </>
      )}
    </div>
  );
}
