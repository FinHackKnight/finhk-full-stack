'use client';

import { useEffect, useRef, useState } from 'react';
import { useGemini } from '@/lib/hooks/use-gemini';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface GeminiChatSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
}

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  typing?: boolean;
}

const ARTICLE_MIME = 'application/vnd.finhk.article+json';

export function GeminiChat({ open, onOpenChange, initialPrompt }: GeminiChatSidebarProps) {
  const { generateResponse, loading, error } = useGemini();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Default greeting on first open; do not auto-send anything
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content:
            'Drop a news article here to get an AI summary with key takeaways and potential market impact.',
        },
      ]);
    }
  }, [open, messages.length]);

  // Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // If an initialPrompt is passed (e.g., from Summarize button), prefill input (no auto-send)
  useEffect(() => {
    if (open && initialPrompt) {
      setInput(initialPrompt);
      // focus input for convenience
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, initialPrompt]);

  const handleSend = async (val?: string) => {
    const text = (val ?? input).trim();
    if (!text) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    try {
      // Reserve a placeholder assistant message with typing flag
      setMessages((m) => [...m, { role: 'assistant', content: '', typing: true }]);
      const reply = await generateResponse(text);
      // Typewriter effect
      await typeOut(reply);
    } catch {
      // error handled in hook
      setMessages((m) => m.filter((msg) => !msg.typing));
    }
  };

  const typeOut = async (fullText: string) => {
    const speed = 12; // characters per frame batch
    let shown = '';
    setMessages((m) => {
      const idx = m.findIndex((x) => x.typing);
      if (idx === -1) return m;
      const dup = [...m];
      dup[idx] = { ...dup[idx], content: '' };
      return dup;
    });

    for (let i = 0; i < fullText.length; i += speed) {
      shown = fullText.slice(0, i + speed);
      setMessages((m) => {
        const idx = m.findIndex((x) => x.typing);
        if (idx === -1) return m;
        const dup = [...m];
        dup[idx] = { ...dup[idx], content: shown };
        return dup;
      });
      await new Promise((r) => setTimeout(r, 20));
    }

    setMessages((m) => {
      const idx = m.findIndex((x) => x.typing);
      if (idx === -1) return m;
      const dup = [...m];
      dup[idx] = { ...dup[idx], typing: false };
      return dup;
    });
  };

  // Drag & Drop handlers: prefill input; do not auto-send
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
    e.dataTransfer.dropEffect = 'copy';
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    let title: string | undefined;
    let url: string | undefined;

    const json = e.dataTransfer.getData(ARTICLE_MIME);
    if (json) {
      try {
        const obj = JSON.parse(json);
        title = obj.title;
        url = obj.url;
      } catch {}
    }

    if (!url) {
      const uriList = e.dataTransfer.getData('text/uri-list');
      if (uriList) url = uriList.split('\n')[0]?.trim();
    }

    if (!title) {
      const text = e.dataTransfer.getData('text/plain');
      if (text) {
        const matchUrl = text.match(/https?:[^\s]+/i);
        if (!url && matchUrl) url = matchUrl[0];
        const matchTitle = text.match(/Title:\s*(.*)/i);
        if (matchTitle) title = matchTitle[1];
      }
    }

    if (!url && !title) return;

    const prompt = `Summarize the following news article in 3-5 bullet points. Include key entities, key facts, and potential market impact.\nTitle: ${title ?? ''}\nURL: ${url ?? ''}`;
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <Card className="absolute right-0 top-0 h-full w-full flex flex-col rounded-none"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="font-semibold">AI Assistant</h2>
            <p className="text-xs text-muted-foreground">Gemini-powered chat</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drag overlay */}
        {dragOver && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="rounded-lg border-2 border-dashed border-primary/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
              Drop a news article link or card here to summarize
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap shadow-sm prose prose-sm dark:prose-invert prose-headings:mt-2 prose-p:my-2 prose-strong:font-semibold ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm prose-invert'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                {m.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                ) : (
                  <span>{m.content}</span>
                )}
                {m.typing && <span className="ml-1 inline-block w-2 h-2 rounded-full bg-foreground/60 animate-pulse" />}
              </div>
            </div>
          ))}
          {error && (
            <div className="text-xs text-red-500">{String(error)}</div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="border-t p-3 flex items-center gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loading ? 'Generating…' : 'Type a message or drop a link'}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default GeminiChat;
