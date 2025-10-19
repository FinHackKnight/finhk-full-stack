'use client';

import { useState } from 'react';
import type { ChatHistoryItem } from '@/lib/gemini';

interface UseGeminiReturn {
  response: string | null;
  loading: boolean;
  error: string | null;
  generateResponse: (prompt: string) => Promise<string>;
  clearResponse: () => void;
  messages: ChatHistoryItem[];
  resetConversation: () => void;
}

export function useGemini(): UseGeminiReturn {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatHistoryItem[]>([]);

  const generateResponse = async (prompt: string) => {
    if (!prompt.trim()) {
      const msg = 'Prompt cannot be empty';
      setError(msg);
      return Promise.reject(new Error(msg));
    }

    setLoading(true);
    setError(null);

    const nextHistory: ChatHistoryItem[] = [...messages, { role: 'user', content: prompt }];
    setMessages(nextHistory);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextHistory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate response');
      const out = String(data.response ?? '');
      setResponse(out);
      const updated: ChatHistoryItem[] = [...nextHistory, { role: 'assistant', content: out }];
      setMessages(updated);
      return out;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearResponse = () => {
    setResponse(null);
    setError(null);
  };

  const resetConversation = () => {
    setMessages([]);
    setResponse(null);
    setError(null);
  };

  return { response, loading, error, generateResponse, clearResponse, messages, resetConversation };
}
