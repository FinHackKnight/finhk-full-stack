import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the Gemini Pro model (using gemini-2.5-pro)
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

// Helper function to generate content
export async function generateContent(prompt: string) {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error generating content with Gemini:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      throw new Error('Model not available. Please check if the Gemini model is accessible with your API key.');
    }
    if (error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your GEMINI_API_KEY environment variable.');
    }
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      throw new Error('API quota exceeded. Please check your Gemini API usage limits.');
    }
    
    throw error;
  }
}

// Helper function for chat conversations
export async function startChat(history: Array<{ role: 'user' | 'model'; parts: string }> = []) {
  try {
    const chat = geminiModel.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }]
      }))
    });
    return chat;
  } catch (error) {
    console.error('Error starting chat with Gemini:', error);
    throw error;
  }
}

export default genAI;
