'use client';

import { useState } from 'react';

interface UseGeminiReturn {
  response: string | null;
  loading: boolean;
  error: string | null;
  generateResponse: (prompt: string) => Promise<void>;
  clearResponse: () => void;
}

export function useGemini(): UseGeminiReturn {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (prompt: string) => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      setResponse(data.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearResponse = () => {
    setResponse(null);
    setError(null);
  };

  return {
    response,
    loading,
    error,
    generateResponse,
    clearResponse,
  };
}
