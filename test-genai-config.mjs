import { GoogleGenAI } from '@google/genai';

async function generate() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log("Using GoogleGenAI");
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Generate an image of a red dog',
      config: {
        outputFormat: 'image'
      }
    });
    console.log("Success outputFormat=image", !!response?.candidates?.[0]?.content?.parts?.[0]?.inlineData);
  } catch (e) {
    console.error("Failed config output:", e.message);
  }
}

generate();
