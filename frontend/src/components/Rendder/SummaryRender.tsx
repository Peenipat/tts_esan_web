// components/SummaryRenderer.tsx
import { useEffect, useState } from "react";
import { parseSummary } from "../parseSummary";
import type {SummaryItem} from '../parseSummary'
import BatchSpeechGenerator from "./UrlRedder";

interface Props {
  summary: string;
}

export default function SummaryRenderer({ summary }: Props) {
  const [summaryList, setSummaryList] = useState<SummaryItem[]>([]);

  useEffect(() => {
    const parsed = parseSummary(summary);
    setSummaryList(parsed);
  }, [summary]);

  return (
    <div className="space-y-4">
      {summaryList.map((item) => (
        <div
          key={item.id}
          className="p-4 border border-gray-300 rounded-md bg-white shadow-sm"
        >
          <h2 className="font-bold text-lg text-primary-600">ข้อ {item.id}</h2>
          <p className="text-gray-800">{item.text}</p>
        </div>
      ))}
      <BatchSpeechGenerator items={summaryList}/>
    </div>
  );
}
