
import './App.css'
import { useState } from "react";
import { OCRUploader } from "./components/OCRUploader";
import { TextSummary } from "./components/Textsummary";

function App() {
  const [ocrText, setOcrText] = useState("");
  const [selectModel, setSelectModel] = useState(0)
  return (
    <>
      <div className="mt-4">
        <label htmlFor="modelSelect" className="mr-2 font-medium">
          เลือกโมเดล:
        </label>
        <select
          id="modelSelect"
          value={selectModel}
          onChange={(e) => setSelectModel(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        >
          <option value={0}>Summary</option>
          <option value={1}>Model One</option>
          <option value={2}>Model Two</option>
        </select>
      </div>
      <div className="min-h-screen bg-white p-6">
        <OCRUploader onResult={setOcrText} />
        {ocrText && <TextSummary initialText={ocrText} />}
      </div>
    </>
  )
}

export default App
