type BundleData = {
  bundle_id: string;
  created_at: string;
  files: {
    wav_url: string;
    img_url: string;
  };
};

export async function combineAudio(
  audioUrls: string[],
  pdfFile?: File,
  imgFile?: File
): Promise<BundleData> {
  const formData = new FormData();
  formData.append("audio_urls", JSON.stringify(audioUrls));
  if (pdfFile) formData.append("pdf_file", pdfFile);
  if (imgFile) formData.append("img_file", imgFile);

  const response = await fetch("/api/combine-upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Combine audio failed");
  }

  const data = await response.json();
  return data.data; 
}