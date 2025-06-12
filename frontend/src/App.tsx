
import './App.css'
import { useState } from "react";
import { TyphoonOCR } from "./components/flow_typhoon/typhoonOCR";
import { TextSummary } from "./components/flow_typhoon/TextSummary";
import { GeminiOCR } from './components/flow_gemini/geminiOCR';

function App() {
  // เปลี่ยนจาก number|null เป็น number|"" 
  const [ocrText, setOcrText] = useState<string>("")
  const [selectModel, setSelectModel] = useState<number | "">("")
  console.log(ocrText)

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mt-4 mb-6">
        <label htmlFor="modelSelect" className="mr-2 font-medium">
          เลือกโมเดล:
        </label>
        <select
          id="modelSelect"
          value={selectModel}
          onChange={(e) => {
            const v = e.target.value === "" ? "" : Number(e.target.value)
            setSelectModel(v)
          }}
          className="border px-2 py-1 rounded"
        >
          <option value="">-- กรุณาเลือกโมเดล --</option>
          <option value={0}>Typhoon + Gemini</option>
          <option value={1}>Gemini</option>
          <option value={2}>Model Two</option>
        </select>
      </div>

      {selectModel === "" && (
        <div className="p-6 text-gray-500">
          กรุณาเลือกโมเดลก่อนเริ่มใช้งาน
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
          <GeminiOCR onResult={setOcrText}/>
          {ocrText && <TextSummary initialText={ocrText} />}
        </div>
      )}

      {selectModel === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">ผลลัพธ์จาก Model Two</h2>
          {/* <ModelTwoComponent text={ocrText} /> */}
        </div>
      )}
    </div>
  )
}

export default App