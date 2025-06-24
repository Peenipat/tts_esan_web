import './App.css'
import { useState } from "react";
import { TyphoonOCR } from "./components/flow_typhoon/typhoonOCR";
import { TextSummary } from "./components/flow_typhoon/TextSummary";
import { GeminiOCR } from './components/flow_gemini/geminiOCR';
import { TextSummary_gemini } from './components/flow_gemini/TextSummary_gemini';
import VaojaPlayer from './components/flow_gemini/VaojaPlayer';
import { History } from './components/Rendder/History';

function App() {
  const [ocrText, setOcrText] = useState<string>("")
  const [summaryText,setSummaryText] = useState<string>("")
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [selectModel, setSelectModel] = useState<number | "">("")

  const models = [
    { id: 1, label: "📄 อัปโหลดเอกสาร" },
    { id: 2, label: "✍️ กรอกข้อความ" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white py-10 px-4">
      <div className="w-full bg-white shadow-xl rounded-2xl p-8 max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
          ระบบสรุปข้อความอัตโนมัติ
        </h1>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">เลือกวิธีการใช้งาน:</h2>
          <div className="flex flex-wrap gap-4">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectModel(model.id)}
                className={`px-5 py-2 rounded-full border text-sm font-medium transition-all
                ${selectModel === model.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"}`}
              >
                {model.label}
              </button>
            ))}
          </div>
        </div>

        {selectModel === "" && (
          <div className="p-6 text-center text-gray-500 border border-dashed rounded-lg bg-gray-50">
            กรุณาเลือกวิธีการใช้งานก่อนเริ่ม
          </div>
        )}

        {selectModel === 0 && (
          <div className="space-y-6">
            <TyphoonOCR onResult={setOcrText} />
            {ocrText && <TextSummary initialText={ocrText} />}
          </div>
        )}

        {selectModel === 1 && (
          <div className="space-y-6">
            <GeminiOCR onResult={setOcrText} onFile={setUploadedImage} />
            {ocrText && <TextSummary_gemini initialText={ocrText}  uploadedImage={uploadedImage} />}
          </div>
        )}

        {selectModel === 2 && (
          <div className="space-y-6">
            <VaojaPlayer initialText={summaryText} />
            {/* <ModelTwoComponent text={ocrText} /> */}
          </div>
        )}
      </div>

      <History />

      {/* Always visible */}
      {/* <div className="mt-10 max-w-3xl mx-auto">
        <VaojaPlayer initialText={summaryText} />
      </div> */}
    </div>
  )
}

export default App





// import './App.css'
// import { useState } from "react";
// import { GeminiOCR } from './components/flow_gemini/geminiOCR';
// import { TextSummary_gemini } from './components/flow_gemini/TextSummary_gemini';
// import { History } from './components/Rendder/History';

// function App() {
//   const [ocrText, setOcrText] = useState<string>("")
//   const [uploadedImage, setUploadedImage] = useState<File | null>(null);

//   return (
//     <div className="min-h-screen bg-white p-6">


//       <div className="space-y-6">
//         <GeminiOCR onResult={setOcrText} onFile={setUploadedImage} />
//         {ocrText && <TextSummary_gemini initialText={ocrText}  uploadedImage={uploadedImage} />}
//       </div>
//       <History />

//     </div>
//   )
// }

// export default App