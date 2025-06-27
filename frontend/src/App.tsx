import './App.css';
import { useState, useEffect } from "react";
import { GeminiOCR } from './components/flow_gemini/geminiOCR';
import { TextSummary_gemini } from './components/flow_gemini/TextSummary_gemini';
import VaojaPlayer from './components/flow_gemini/VaojaPlayer';
import { Link } from "react-router-dom";

function App() {
  const [ocrText, setOcrText] = useState<string>("");
  const [summaryText, setSummaryText] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [selectModel, setSelectModel] = useState<number | "">("");

  useEffect(() => {
    const saved = localStorage.getItem("draftText");
    if (saved) setSummaryText(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("draftText", summaryText);
  }, [summaryText]);

  const handleResetText = () => {
    localStorage.removeItem("draftText");
    setSummaryText("");
  };

  const models = [
    { id: 1, label: "📤 แนบเอกสาร" },
    { id: 2, label: "📝 พิมพ์ข้อความ" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a9745c] via-[#eccca2] to-[#debb87] text-brown-900 font-sans px-4 sm:px-6 md:px-12 lg:px-20 pb-16">
      <audio autoPlay loop hidden>
        <source src="/assets/isan_ambient.mp3" type="audio/mp3" />
      </audio>

      <header className="text-center py-12 space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#4e2b1d] drop-shadow-md">
          ระบบกระจายเสียงผู้ใหญ่บ้านด้วย AI เพื่อชุมชนอีสาน
        </h1>
        <p className="text-[#7b3f00] text-lg italic">
          "แปลงข้อความเป็นเสียงผู้ใหญ่บ้าน ฟังม่วน ๆ ยามมีงานบุญ"
        </p>
        <p className="text-[#a64b2a] text-sm italic">
          ฟังข่าว ฟังประกาศ ฟังเสียงบ้านเฮาแบบผู้ใหญ่บ้านบอก
        </p>
        <div className="bg-[#7c2d12] text-white py-2 px-4 rounded-md shadow w-fit mx-auto mt-2 font-medium">
          🔔 ยินดีต้อนรับสู่ “ชุมชนบ้านกอก”
        </div>
        <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
          <Link to="/history">
            <button className="px-5 py-2 bg-[#9a3412] hover:bg-[#7c2d12] text-white rounded-full shadow transition-all">
              📚 ฟังประกาศย้อนหลัง
            </button>
          </Link>
        </div>
      </header>

      <section className="mb-10 space-y-4 text-center">
        <h2 className="text-xl font-semibold text-[#5c2e0e]">เลือกวิธีการใช้งาน</h2>
        <div className="flex justify-center gap-4 flex-wrap">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectModel(model.id)}
              className={`px-6 py-3 rounded-full text-base font-medium transition-all duration-200 transform shadow-md
                ${selectModel === model.id
                  ? "bg-gradient-to-r from-[#f59e0b] to-[#b45309] text-white scale-105"
                  : "bg-[#fefae0] border border-[#e4cfa1] text-[#5a3e1b] hover:bg-[#f5e3bd] hover:scale-105"}`}
            >
              {model.label}
            </button>
          ))}
        </div>
      </section>

      {selectModel === "" && (
        <div className="text-center text-[#6b4c30] mb-12 italic">
          กรุณาเลือกวิธีการใช้งานก่อนเด้อพี่น้อง
        </div>
      )}

      {selectModel === 1 && (
        <section className="space-y-10">
          <GeminiOCR onResult={setOcrText} onFile={setUploadedImage} />
          {ocrText && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#7c3e0f]">
                📄 ข้อความจากเอกสารที่พบ
              </h2>
              <TextSummary_gemini
                initialText={ocrText}
                uploadedImage={uploadedImage}
              />
            </div>
          )}
        </section>
      )}

      {selectModel === 2 && (
        <section className="space-y-6">
          <VaojaPlayer
            initialText={summaryText}
            setText={setSummaryText}
            onReset={handleResetText}
          />
        </section>
      )}
    </div>
  );
}

export default App;
