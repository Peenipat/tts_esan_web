// src/components/History.tsx
import { useEffect, useState } from "react";
interface VoiceBundle {
  bundle_id: string;
  audio_url: string;
  image_url?: string;
  metadata_url?: string;
}

export function History() {
  const [history, setHistory] = useState<VoiceBundle[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/voice-bundles");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setHistory(json.data);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">ประวัติการอัปโหลด</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <div key={item.bundle_id} className="border rounded-xl p-4 bg-white shadow text-black">
            <h3 className="font-semibold text-lg mb-2">Bundle: {item.bundle_id}</h3>

            {/* รูปภาพ */}
            {item.image_url && item.image_url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
              <img
                src={item.image_url}
                alt="Preview"
                className="w-full h-40 object-cover rounded mb-2"
              />
            ) : (
              item.image_url && (
                <a
                  href={item.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm mb-2 flex flex-col items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-34 h-34 mb-1 text-blue-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                  <span className="text-xs">ดูไฟล์แนบ</span>
                </a>
              )
            )}

            <div className="flex flex-col space-y-2">
              {/* ไฟล์เสียง */}
              {item.audio_url && (
                <audio controls className="w-full">
                  <source src={item.audio_url} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              )}

              {/* Metadata (PDF/JSON/etc.) */}
              {item.metadata_url && (
                <a
                  href={item.metadata_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 underline"
                >
                  🔍 เปิด Metadata
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
