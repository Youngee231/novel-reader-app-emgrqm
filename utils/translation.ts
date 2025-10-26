
export async function translateText(
  text: string,
  targetLanguage: string,
  service: 'google' | 'kimi'
): Promise<string> {
  try {
    if (service === 'google') {
      return await translateWithGoogle(text, targetLanguage);
    } else {
      return await translateWithKimi(text, targetLanguage);
    }
  } catch (error) {
    console.log('Translation error:', error);
    throw error;
  }
}

async function translateWithGoogle(text: string, targetLanguage: string): Promise<string> {
  try {
    // Using Google Translate's public API (note: for production, use official API with key)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data[0]) {
      return data[0].map((item: any) => item[0]).join('');
    }
    
    throw new Error('Translation failed');
  } catch (error) {
    console.log('Google translation error:', error);
    throw error;
  }
}

async function translateWithKimi(text: string, targetLanguage: string): Promise<string> {
  // Note: Kimi API integration would require API keys and proper setup
  // This is a placeholder implementation
  console.log('Kimi translation not yet implemented. Using fallback.');
  return `[Kimi Translation to ${targetLanguage}]: ${text}`;
}

export function splitTextIntoChunks(text: string, maxChunkSize: number = 500): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}
