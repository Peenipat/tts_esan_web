export async function combineAudio(audioUrls: string[]): Promise<Blob> {
    const response = await fetch("/api/combine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(audioUrls),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Combine audio failed");
    }
  
    return await response.blob();
  }
  