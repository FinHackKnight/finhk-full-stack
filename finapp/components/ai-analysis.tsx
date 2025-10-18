"use client"

import React, { useState, useRef, useEffect } from "react"
import { Bot, Loader2, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe: number
  sector: string
  industry: string
  high: number
  low: number
  open: number
  previousClose: number
}

interface AIAnalysisProps {
  symbol: string
  stockData?: StockData | null
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export function AIAnalysis({ symbol, stockData }: AIAnalysisProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isAnalyzing) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsAnalyzing(true)
    setError(null)

    try {
      const prompt = `
      You are an AI financial analyst. The user is asking about the stock ${symbol} (${stockData?.name || 'N/A'}).
      
      Current Stock Data:
      - Price: ${stockData?.price ? stockData.price.toFixed(2) : 'N/A'}
      - Change: ${stockData?.change ? stockData.change.toFixed(2) : 'N/A'} (${stockData?.changePercent ? stockData.changePercent.toFixed(2) : 'N/A'}%)
      - Market Cap: ${stockData?.marketCap ? (stockData.marketCap / 1_000_000_000).toFixed(2) + 'B' : 'N/A'}
      - P/E Ratio: ${stockData?.pe ? stockData.pe.toFixed(2) : 'N/A'}
      - Sector: ${stockData?.sector || 'N/A'}
      - Industry: ${stockData?.industry || 'N/A'}
      
      User Question: ${inputMessage.trim()}
      
      Please provide a helpful, professional response about this stock. Be concise but informative.
      `

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const result = await response.json()
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: result.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err: any) {
      console.error("AI Chat Error:", err)
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center text-center p-6">
            <p className="text-sm text-muted-foreground mb-2 font-medium">
              Ask me anything about {symbol}
            </p>
            <p className="text-xs text-muted-foreground">
              I can help with analysis, trends, and insights
            </p>
          </div>
        ) : (
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white dark:text-black" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted/20 border border-border/50'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isAnalyzing && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white dark:text-black" />
                  </div>
                  <div className="bg-muted/20 border border-border/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {error && (
          <div className="p-3 mx-4 mb-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this stock..."
            disabled={isAnalyzing}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isAnalyzing}
            size="icon"
            className="shrink-0"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}