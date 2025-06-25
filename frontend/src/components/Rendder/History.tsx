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
    <div className="p-4 sm:p-6 space-y-6 text-[#3e1d0a]">
      {history.length === 0 ? (
        <p className="text-center text-[#6b4c30] italic">ยังไม่มีข้อมูลประกาศย้อนหลัง</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div
              key={item.bundle_id}
              className="bg-[#fff7ec] border border-[#e0c7a3] rounded-2xl shadow-lg p-4 space-y-3 transition hover:scale-[1.015] duration-200"
            >
              <h3 className="font-semibold text-lg text-[#4e2a14]">
                🧺 Bundle: {item.bundle_id}
              </h3>

              {/* รูปภาพ */}
              {item.image_url && item.image_url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                <img
                  src={item.image_url}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border border-[#d6ae82]"
                />
              ) : (
                item.image_url && (
                  <a
                    href={item.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline text-sm flex items-center gap-1"
                  >
                    📎 ดูไฟล์แนบอื่น ๆ
                  </a>
                )
              )}

              <div className="space-y-2">
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
                    className="text-[#8b2c21] underline hover:text-[#7a1e14] font-medium"
                  >
                    🔍 เปิด Metadata เพิ่มเติม
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
