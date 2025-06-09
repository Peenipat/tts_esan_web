
import './App.css'
import { useState } from "react";
import { OCRUploader } from "./components/OCRUploader";
import { TextSummary } from "./components/TextSummary";

function App() {
  const [ocrText, setOcrText] = useState("");
  return (
    <>
      <div className="min-h-screen bg-white p-6">
        <OCRUploader onResult={setOcrText} />
        {ocrText && <TextSummary initialText={ocrText} />}
      </div>
    </>
  )
}

export default App
