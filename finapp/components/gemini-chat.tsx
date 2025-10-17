'use client';

import { useState } from 'react';
import { useGemini } from '@/lib/hooks/use-gemini';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function GeminiChat() {
  const [prompt, setPrompt] = useState('');
  const { response, loading, error, generateResponse, clearResponse } = useGemini();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      await generateResponse(prompt);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Gemini AI Chat</CardTitle>
        <CardDescription>
          Test your Gemini API integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !prompt.trim()}>
            {loading ? 'Generating...' : 'Send'}
          </Button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {response && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Response:</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearResponse}
              >
                Clear
              </Button>
            </div>
            <div className="p-4 bg-gray-50 border rounded-md">
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
