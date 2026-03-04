import { GoogleGenAI } from '@google/genai';

async function test(modelName) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log(`Testing model: ${modelName}`);
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Draw a small red circle' }
          ]
        }
      ],
      config: {
        responseModalities: ['IMAGE'],
      }
    });
    
    console.log(`Success with ${modelName}!`);
  } catch (e) {
    console.log(`Failed with ${modelName}:`, e.message);
  }
}

async function run() {
  await test('gemini-2.5-flash');
  await test('gemini-2.5-flash-image');
  await test('gemini-3.0-flash-image');
  await test('gemini-2.0-flash-exp');
}

run();
