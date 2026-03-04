import { GoogleGenAI } from '@google/genai';

async function generate() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log("Using GoogleGenAI");
  
  try {
    const response = await ai.models.generateContent({
      model: 'imagen-3.0-generate-001',
      contents: 'Generate an image of a red dog',
      config: {
        responseModalities: ['IMAGE'],
      }
    });
    console.log("Success:", !!response?.candidates?.[0]?.content?.parts?.[0]?.inlineData);
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

generate();
