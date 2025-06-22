import CombineAudioButton from "../CombineAudioButton";
import { generateSpeechForList} from "../generateSpeechForList";
import type { TextItem, AudioResult } from '../generateSpeechForList'
import { useState } from "react";

export default function BatchSpeechGenerator({ items }: { items: TextItem[] }) {
  const [results, setResults] = useState<AudioResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateAll = async () => {
    setLoading(true);
    const urls = await generateSpeechForList(items);
    setResults(urls);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleGenerateAll} disabled={loading}>
        {loading ? "กำลังสร้างเสียง..." : "สร้างเสียงทั้งหมด"}
      </button>

      <ul className="mt-4 space-y-4">
        {results.map((r) => (
          <li key={r.id}>
            <p>ข้อ {r.id}</p>
            <audio controls src={r.url}></audio>
          </li>
        ))}
      </ul>
      <CombineAudioButton audioList={results}/>
    </div>
  );
}
