import { useEffect, useState } from "react";

interface VoiceBundle {
  bundle_id: string;
  audio_url: string;
  image_url?: string;
  metadata_url?: string;
}

export function History() {
  const [history, setHistory] = useState<VoiceBundle[]>([]);
  const [filtered, setFiltered] = useState<VoiceBundle[]>([]);
  const [dateFilter, setDateFilter] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/voice-bundles?date=${dateFilter}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setHistory(json.data);
        setPage(1);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    fetchHistory();
  }, [dateFilter]);

  useEffect(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    setFiltered(history.slice(start, end));
  }, [history, page]);

  const totalPages = Math.ceil(history.length / perPage);

  return (
    <div className="p-4 sm:p-6 space-y-6 text-[#3e1d0a]">
      <div className="bg-[#fffaf0] border border-[#e4caa0] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <h2 className="text-xl font-semibold text-[#4e2a14]">📜 รายการประกาศย้อนหลัง</h2>
        <label className="flex items-center gap-2 text-sm font-medium text-[#4e2a14]">
          📅 เลือกวันที่:
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-[#d6ae82] rounded-md px-3 py-2 bg-[#fffaf4] text-[#4e2a14] focus:outline-none focus:ring-2 focus:ring-[#eab308]"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-[#6b4c30] italic">ไม่พบข้อมูลในวันที่เลือก</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.audio_url}
              className="bg-[#fff7ec] border border-[#e0c7a3] rounded-2xl shadow-lg p-4 space-y-4 transition hover:scale-[1.015] duration-200 flex flex-col justify-between"
            >
              {item.image_url && item.image_url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                <img
                  src={item.image_url}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border border-[#d6ae82]"
                />
              ) : (
                item.image_url && (
                  <div className="text-center">
                    <span className="text-sm text-[#4e2a14] italic">ไม่มีตัวอย่างรูปภาพ</span>
                  </div>
                )
              )}

              {item.audio_url && (
                <div>
                  <h4 className="font-semibold text-[#5b3318] text-sm mb-1">🔊 ตัวอย่างเสียงประกาศ</h4>
                  <audio
                    controls
                    className="w-full rounded-lg border border-[#e4caa0] bg-[#fffaf5]"
                  >
                    <source src={item.audio_url} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-[#e6caa5]">
                {item.image_url && !item.image_url.match(/\.(jpeg|jpg|png|gif|webp)$/i) && (
                  <a
                    href={item.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-3 py-1 rounded-md text-sm font-medium text-white bg-gradient-to-r from-[#facc15] to-[#d97706] hover:brightness-110 transition shadow"
                  >
                    📄 เปิดไฟล์ PDF
                  </a>
                )}
                {item.metadata_url && (
                  <a
                    href={item.metadata_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-3 py-1 rounded-md text-sm font-medium text-white bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:brightness-110 transition shadow"
                  >
                    🔍 เปิด Metadata เพิ่มเติม
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-md bg-[#ecd9b5] text-[#3e1d0a] font-medium disabled:opacity-50"
          >
            ⬅️ ก่อนหน้า
          </button>
          <span className="text-sm text-[#4e2a14] font-medium">
            หน้า {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-md bg-[#ecd9b5] text-[#3e1d0a] font-medium disabled:opacity-50"
          >
            ถัดไป ➡️
          </button>
        </div>
      )}
    </div>
  );
}
