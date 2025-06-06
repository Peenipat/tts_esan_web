
import './App.css'
// import ImageUpload from './components/ImageUpload'
import OCRUploader from './components/OCRUploader'
// import WebcamCapture from './components/WebcamCapture'

function App() {
  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <header className="py-4 bg-gray-100 dark:bg-gray-800 shadow">
          <h1 className="text-2xl text-center font-semibold">OCR Demo</h1>
        </header>
        <main className="py-6">
          <OCRUploader />
        </main>
      </div>
    </>
  )
}

export default App
