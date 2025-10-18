"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, Globe, ExternalLink, Calendar, Volume, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

interface StockNews {
  id: string
  title: string
  description: string
  publishedAt: string
  source: string
  url: string
  sentiment: "positive" | "negative" | "neutral"
}

export default function StockProfilePage() {
  const params = useParams()
  const router = useRouter()
  const symbol = params.symbol as string
  
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [stockNews, setStockNews] = useState<StockNews[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (symbol) {
      fetchStockData()
      fetchStockNews()
    }
  }, [symbol])

  const fetchStockData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/stocks/quote?symbols=${symbol}`)
      const result = await response.json()
      if (result.success && result.data) {
        setStockData(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch stock data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStockNews = async () => {
    try {
      const response = await fetch(`/api/stocks/news?symbols=${symbol}&limit=20`)
      const result = await response.json()
      if (result.success && result.data) {
        setStockNews(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch stock news:", error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toString()
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-500 bg-green-50 dark:bg-green-900/20"
      case "negative": return "text-red-500 bg-red-50 dark:bg-red-900/20"
      default: return "text-gray-500 bg-gray-50 dark:bg-gray-900/20"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <TrendingUp className="w-3 h-3" />
      case "negative": return <TrendingDown className="w-3 h-3" />
      default: return <Activity className="w-3 h-3" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading stock data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="hover:bg-muted/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-mono font-semibold text-primary">
                  {symbol?.slice(0, 2)}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">{stockData?.name || symbol}</h1>
                <p className="text-sm text-muted-foreground font-mono">{symbol}</p>
              </div>
            </div>
          </div>
          
          {stockData && (
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(stockData.price)}</div>
              <div className={`flex items-center gap-2 ${stockData.changePercent > 0 ? "text-green-500" : "text-red-500"}`}>
                {stockData.changePercent > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-semibold text-sm">
                  {stockData.changePercent > 0 ? "+" : ""}{stockData.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Main Content */}
      <div className="flex-1 flex pt-16">
        {/* Left Column - Overview and News */}
        <div className="w-2/3 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
            {/* Overview Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Overview</h2>
              
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Market Cap</span>
                  </div>
                  <div className="text-sm font-semibold">{stockData ? formatNumber(stockData.marketCap) : "N/A"}</div>
                </div>

                <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">P/E Ratio</span>
                  </div>
                  <div className="text-sm font-semibold">{stockData?.pe ? stockData.pe.toFixed(2) : "N/A"}</div>
                </div>

                <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-muted-foreground">Volume</span>
                  </div>
                  <div className="text-sm font-semibold">{stockData ? formatNumber(stockData.volume) : "N/A"}</div>
                </div>

                <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-muted-foreground">52W High</span>
                  </div>
                  <div className="text-sm font-semibold">{stockData ? formatCurrency(stockData.high) : "N/A"}</div>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                  <h3 className="text-sm font-semibold mb-3">Company Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sector</span>
                      <span className="font-medium">{stockData?.sector || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Industry</span>
                      <span className="font-medium">{stockData?.industry || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Open</span>
                      <span className="font-medium">{stockData ? formatCurrency(stockData.open) : "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Previous Close</span>
                      <span className="font-medium">{stockData ? formatCurrency(stockData.previousClose) : "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                  <h3 className="text-sm font-semibold mb-3">Trading Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Day High</span>
                      <span className="font-medium text-green-500">{stockData ? formatCurrency(stockData.high) : "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Day Low</span>
                      <span className="font-medium text-red-500">{stockData ? formatCurrency(stockData.low) : "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Change</span>
                      <span className={`font-medium ${stockData?.change && stockData.change > 0 ? "text-green-500" : "text-red-500"}`}>
                        {stockData ? formatCurrency(stockData.change) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-medium">{stockData ? formatNumber(stockData.volume) : "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* News Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Related News</h2>
                <Badge variant="outline" className="text-xs">
                  {stockNews.length} articles
                </Badge>
              </div>
              
              {stockNews && stockNews.length > 0 ? (
                <div className="space-y-3">
                  {stockNews.map((news, index) => (
                    <div key={news.id || `news-${index}`} className="p-3 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getSentimentColor(news.sentiment)}`}
                          >
                            <span className="flex items-center gap-1">
                              {getSentimentIcon(news.sentiment)}
                              {news.sentiment}
                            </span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(news.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{news.title}</h3>
                        {news.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {news.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{news.source}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Globe className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3 className="text-sm font-semibold mb-1">No News Available</h3>
                  <p className="text-xs text-muted-foreground">No recent news found for this stock.</p>
                </div>
              )}
            </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Column - Analysis */}
        <div className="w-1/3 bg-card/30 backdrop-blur-sm flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <h2 className="text-xl font-semibold">Analysis</h2>
              
              <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                <h3 className="text-sm font-semibold mb-3">Technical Analysis</h3>
                <div className="space-y-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-xs text-muted-foreground">Price charts coming soon</p>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-xs text-muted-foreground">AI analysis coming soon</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                <h3 className="text-sm font-semibold mb-3">Key Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="text-xs text-muted-foreground">1D Change</span>
                    <span className="font-semibold text-green-500 text-sm">+2.3%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="text-xs text-muted-foreground">P/E Ratio</span>
                    <span className="font-semibold text-blue-500 text-sm">28.5</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="text-xs text-muted-foreground">Volume</span>
                    <span className="font-semibold text-purple-500 text-sm">1.2B</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="text-xs text-muted-foreground">Current Price</span>
                    <span className="font-semibold text-orange-500 text-sm">$175.43</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                <h3 className="text-sm font-semibold mb-3">Market Sentiment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Bullish</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-semibold">72/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fear & Greed</span>
                    <span className="font-semibold text-orange-500">68</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
