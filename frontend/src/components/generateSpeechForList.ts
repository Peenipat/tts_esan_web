
export interface TextItem {
    id: string;
    text: string;
  }
  
  export interface AudioResult {
    id: string;
    url: string;
  }
  
  export async function generateSpeechForList(items: TextItem[]): Promise<AudioResult[]> {
    const results: AudioResult[] = [];
  
    for (const item of items) {
      try {
        const response = await fetch('/api/vaoja-tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: item.text,
            speaker: 'mukda',
            pace: 1,
          }),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error for ID ${item.id}: ${errorText}`);
          continue;
        }
  
        const data = await response.json();
        const wavUrl = data.wav_url;
  
        if (!wavUrl) {
          console.error(`Missing audio URL for ID ${item.id}`);
          continue;
        }
  
        results.push({ id: item.id, url: wavUrl });
      } catch (err) {
        console.error(`Failed to fetch speech for ID ${item.id}`, err);
      }
    }
  
    return results;
  }