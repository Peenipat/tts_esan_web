
import './App.css'
import { useState } from "react";
import { GeminiOCR } from './components/flow_gemini/geminiOCR';
import { TextSummary_gemini } from './components/flow_gemini/TextSummary_gemini';
import { History } from './components/Rendder/History';

function App() {
  const [ocrText, setOcrText] = useState<string>("")
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-white p-6">


      <div className="space-y-6">
        <GeminiOCR onResult={setOcrText} onFile={setUploadedImage} />
        {ocrText && <TextSummary_gemini initialText={ocrText}  uploadedImage={uploadedImage} />}
      </div>
      <History />

    </div>
  )
}

export default App