import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.GEMINI_API_KEY;

// Initialize the SDK lazily to avoid crashing import-time when key is missing
let ai: GoogleGenAI | null = null;
function getClient() {
  if (!API_KEY) return null;
  if (!ai) ai = new GoogleGenAI({ apiKey: API_KEY });
  return ai;
}

// Google grounding tool
const groundingTool = {
  googleSearch: {},
};

const defaultConfig = {
  tools: [groundingTool],
};

export type ChatHistoryItem = { role: 'user' | 'assistant' | 'model'; content: string };

export async function generateContent(prompt: string) {
  const client = getClient();
  if (!client) throw new Error('GEMINI_API_KEY is not configured on the server');
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: defaultConfig as any,
    });

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
    throw error;
  }
}

export async function generateContentFromMessages(history: ChatHistoryItem[]) {
  const client = getClient();
  if (!client) throw new Error('GEMINI_API_KEY is not configured on the server');
  try {
    const contents = history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }],
    })) as any;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: defaultConfig as any,
    });

    const r: any = response as any;
    let text = '';
    if (typeof r.text === 'string') text = r.text;
    else if (typeof r.text === 'function') text = await r.text();
    else if (r.response?.text) {
      text = typeof r.response.text === 'function' ? await r.response.text() : r.response.text;
    }
    return String(text || '');
  } catch (error: any) {
    console.error('Error generating grounded content with Gemini (history):', error);
    throw error;
  }
}

export default ai;
