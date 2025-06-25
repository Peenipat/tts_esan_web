import './App.css';
import { useState, useEffect } from "react";
import { GeminiOCR } from './components/flow_gemini/geminiOCR';
import { TextSummary_gemini } from './components/flow_gemini/TextSummary_gemini';
import VaojaPlayer from './components/flow_gemini/VaojaPlayer';
import { History } from './components/Rendder/History';

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

  const models = [
    { id: 1, label: "Upload Document" },
    { id: 2, label: "Enter Text" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#100519] via-[#1a0f2b] to-[#090214] text-white font-sans px-4 sm:px-6 md:px-12 lg:px-20 pb-16">

      {/* Header */}
      <header className="text-center py-12 space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">
          ระบบเสียงประกาศในชุมชน
        </h1>
        <p className="text-purple-300 text-lg">
          Summarize, Convert to Voice, and Preview in Seconds
        </p>
      </header>

      {/* Mode Selection */}
      <section className="mb-10 space-y-4 text-center">
        <h2 className="text-xl font-semibold text-purple-200">เลือกวิธีใช้งาน</h2>
        <div className="flex justify-center gap-4 flex-wrap">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectModel(model.id)}
              className={`px-6 py-3 rounded-full text-base font-medium transition-all duration-200 transform shadow-md
                ${selectModel === model.id
                  ? "bg-gradient-to-r from-purple-700 to-indigo-700 text-white scale-105"
                  : "bg-[#1e1330] border border-[#3a2b4d] text-gray-300 hover:bg-[#2a1f44] hover:scale-105"}`}
            >
              {model.label}
            </button>
          ))}
        </div>
      </section>

      {/* Default Notice */}
      {selectModel === "" && (
        <div className="text-center text-gray-400 mb-12 italic">
          กรุณาเลือกวิธีใช้งานเพื่อเริ่มต้น
        </div>
      )}

      {/* Upload Document Mode */}
      {selectModel === 1 && (
        <section className="space-y-10">
          <GeminiOCR onResult={setOcrText} onFile={setUploadedImage} />
          {ocrText && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-purple-200">
                📄 ข้อความที่ตรวจพบจากเอกสาร
              </h2>
              <TextSummary_gemini
                initialText={ocrText}
                uploadedImage={uploadedImage}
              />
            </div>
          )}
        </section>
      )}

      {/* Enter Text Mode */}
      {selectModel === 2 && (
        <section className="space-y-6">
          <VaojaPlayer initialText={summaryText} />
        </section>
      )}

      {/* History */}
      <footer className="mt-20 max-w-4xl mx-auto">
        <History />
      </footer>
    </div>
  );
}

export default App;
