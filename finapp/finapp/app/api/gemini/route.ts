import { NextRequest, NextResponse } from 'next/server';
import { generateContent, generateContentFromMessages } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt: string | undefined = body?.prompt;
    const messages: Array<{ role: 'user' | 'assistant' | 'model'; content: string }> | undefined = body?.messages;

    if (!prompt && (!messages || messages.length === 0)) {
      return NextResponse.json(
        { error: 'Prompt or messages are required' },
        { status: 400 }
      );
    }

    let text = '';
    if (messages && messages.length) {
      text = await generateContentFromMessages(messages);
    } else if (prompt) {
      text = await generateContent(prompt);
    }

    return NextResponse.json({ success: true, response: text, sources: [] });
  } catch (error: any) {
    console.error('API Error:', error);
    const msg = error?.message || 'Failed to generate content';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Gemini API endpoint is working',
    status: 'healthy'
  });
}
