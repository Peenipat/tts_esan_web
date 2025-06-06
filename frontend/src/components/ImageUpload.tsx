import React, { useState, useRef, useEffect } from "react";

const ImageUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // สร้าง preview URL เมื่อมีการเลือกไฟล์ใหม่
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // ล้าง URL เมื่อ component ยกเลิกหรือเปลี่ยนไฟล์
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    fileInputRef.current && (fileInputRef.current.value = "");
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {previewUrl ? (
        <>
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full rounded-lg object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-white text-gray-800 rounded-full p-2 shadow hover:bg-gray-100 focus:outline-none"
            aria-label="Remove selected image"
          >
            ✕
          </button>
        </>
      ) : (
        <label
          htmlFor="imageUpload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
        >
          <svg
            aria-hidden="true"
            className="w-12 h-12 mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M24 4v40m20-20H4"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือ
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, JPEG (สูงสุด 5MB)</p>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
};

export default ImageUpload;
