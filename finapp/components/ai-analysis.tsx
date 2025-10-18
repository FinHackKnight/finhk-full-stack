"use client"

import React, { useState } from "react"
import { Bot, Loader2, Sparkles, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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

interface AIResponse {
  analysis: string
  recommendation: "BUY" | "SELL" | "HOLD"
  confidence: number
  keyPoints: string[]
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
}

export function AIAnalysis({ symbol, stockData }: AIAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeStock = async () => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Analyze the stock ${symbol} with the following data:
          - Current Price: $${stockData?.price || 'N/A'}
          - Change: ${stockData?.change || 'N/A'} (${stockData?.changePercent || 'N/A'}%)
          - Volume: ${stockData?.volume || 'N/A'}
          - Market Cap: $${stockData?.marketCap || 'N/A'}
          - P/E Ratio: ${stockData?.pe || 'N/A'}
          - Sector: ${stockData?.sector || 'N/A'}
          - Industry: ${stockData?.industry || 'N/A'}
          
          Provide a comprehensive AI analysis including:
          1. Technical analysis
          2. Fundamental analysis
          3. Market sentiment
          4. Investment recommendation (BUY/SELL/HOLD)
          5. Risk assessment
          6. Key points to consider
          
          Format the response as JSON with the following structure:
          {
            "analysis": "detailed analysis text",
            "recommendation": "BUY/SELL/HOLD",
            "confidence": 85,
            "keyPoints": ["point1", "point2", "point3"],
            "riskLevel": "LOW/MEDIUM/HIGH"
          }`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI analysis')
      }

      const data = await response.json()
      setAiResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze stock')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "BUY": return "text-green-500 bg-green-50 dark:bg-green-900/20"
      case "SELL": return "text-red-500 bg-red-50 dark:bg-red-900/20"
      case "HOLD": return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
      default: return "text-gray-500 bg-gray-50 dark:bg-gray-900/20"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW": return "text-green-500"
      case "MEDIUM": return "text-yellow-500"
      case "HIGH": return "text-red-500"
      default: return "text-gray-500"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "LOW": return <TrendingUp className="w-3 h-3" />
      case "MEDIUM": return <AlertTriangle className="w-3 h-3" />
      case "HIGH": return <TrendingDown className="w-3 h-3" />
      default: return <AlertTriangle className="w-3 h-3" />
    }
  }

  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 flex flex-col">
        {!aiResponse && !isAnalyzing && (
          <div className="flex-1 flex flex-col justify-center text-center p-6">
            <p className="text-sm text-muted-foreground mb-2 font-medium">
              Get AI-powered analysis for {symbol}
            </p>
            <p className="text-xs text-muted-foreground">
              Advanced machine learning insights
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex-1 flex flex-col justify-center text-center p-4">
            <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">
              AI is analyzing {symbol}...
            </p>
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col justify-center p-4">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {aiResponse && (
          <div className="flex-1 space-y-6">
            {/* Recommendation */}
            <div className="group p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Recommendation</span>
                <span className={`text-sm px-3 py-1 rounded-full font-bold ${getRecommendationColor(aiResponse.recommendation)}`}>
                  {aiResponse.recommendation}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{aiResponse.confidence}%</span>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="group p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">Risk Level</span>
                <div className="flex items-center gap-2">
                  {getRiskIcon(aiResponse.riskLevel)}
                  <span className={`text-sm font-bold ${getRiskColor(aiResponse.riskLevel)}`}>
                    {aiResponse.riskLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Points */}
            <div className="group p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
              <h4 className="text-sm font-semibold mb-3 text-green-600 dark:text-green-400">Key Points</h4>
              <ul className="space-y-2">
                {aiResponse.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Analysis Text */}
            <div className="group p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <h4 className="text-sm font-semibold mb-3 text-purple-600 dark:text-purple-400">Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {aiResponse.analysis}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Button at the bottom */}
      <div className="mt-auto pt-4">
        {!aiResponse && !isAnalyzing && !error && (
          <Button 
            onClick={analyzeStock}
            size="sm"
            variant="outline"
            className="w-full bg-muted/20 border-border/50 hover:bg-muted/30 text-foreground"
            disabled={!stockData}
          >
            <Bot className="w-3 h-3 mr-2" />
            Analyze Stock
          </Button>
        )}
        
        {error && (
          <Button 
            onClick={analyzeStock}
            size="sm"
            variant="outline"
            className="w-full bg-muted/20 border-border/50 hover:bg-muted/30 text-foreground"
          >
            Try Again
          </Button>
        )}

        {aiResponse && (
          <Button 
            onClick={analyzeStock}
            size="sm"
            variant="outline"
            className="w-full bg-muted/20 border-border/50 hover:bg-muted/30 text-foreground"
            disabled={isAnalyzing}
          >
            <Sparkles className="w-3 h-3 mr-2" />
            Regenerate Analysis
          </Button>
        )}
      </div>
    </div>
  )
}
