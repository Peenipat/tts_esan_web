// src/pages/HistoryPage.tsx
import { History } from "../components/Rendder/History";
import { Link } from "react-router-dom";

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a9745c] via-[#eccca2] to-[#debb87] text-[#4e2b1d] px-6 py-10 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#7b3f00] drop-shadow">
        ประวัติการใช้งานเสียงประกาศ
      </h1>

      <div className="max-w-4xl mx-auto">
        <History />
      </div>

      <div className="text-center mt-10">
        <Link to="/">
          <button className="px-6 py-2 bg-gradient-to-r from-[#eab308] to-[#b45309] hover:brightness-110 text-white rounded-md shadow font-medium">
            กลับหน้าแรก
          </button>
        </Link>
      </div>
    </div>
  );
}
