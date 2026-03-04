import { GoogleGenAI } from '@google/genai';

async function generate() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log("Using GoogleGenAI");
  
  try {
    const response = await ai.models.generateImages({
      model: 'gemini-2.5-flash',
      prompt: 'A highly detailed red dog',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg'
      }
    });

    console.log("Success generateImages!", !!response?.generatedImages?.[0]?.image?.imageBytes);
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

generate();
