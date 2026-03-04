const { GoogleGenAI } = require('@google/genai');

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('Got AI client.. Calling generateContent...');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Draw a small red circle on a white background. Return both image and text description.' }
          ]
        }
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      }
    });
    
    console.log('Text:', response.text);
    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData);
    if (imagePart) {
      console.log('Image generated! MimeType:', imagePart.inlineData.mimeType);
      console.log('Data length:', imagePart.inlineData.data.length);
    } else {
      console.log('No image generated.');
    }
  } catch (e) {
    require('fs').writeFileSync('error.log', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    console.error('Wrote error to error.log');
  }
}

test();
