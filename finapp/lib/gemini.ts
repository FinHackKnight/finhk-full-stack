import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

// Initialize the new SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Google grounding tool
const groundingTool = {
  googleSearch: {},
};

const defaultConfig = {
  tools: [groundingTool],
};

export async function generateContent(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: defaultConfig as any,
    });

    // Handle both SDK shapes (property or function)
    const r: any = response as any;
    let text = '';
    if (typeof r.text === 'string') text = r.text;
    else if (typeof r.text === 'function') text = await r.text();
    else if (r.response?.text) {
      text = typeof r.response.text === 'function' ? await r.response.text() : r.response.text;
    }
    return String(text || '');
  } catch (error: any) {
    console.error('Error generating grounded content with Gemini:', error);

    const msg = error?.message || '';
    if (msg.includes('404') || msg.includes('not found')) {
      throw new Error('Model not available. Please check if the Gemini model is accessible with your API key.');
    }
    if (msg.toLowerCase().includes('api key')) {
      throw new Error('Invalid API key. Please check your GEMINI_API_KEY environment variable.');
    }
    if (msg.includes('quota') || msg.includes('limit')) {
      throw new Error('API quota exceeded. Please check your Gemini API usage limits.');
    }

    throw error;
  }
}

export default ai;
