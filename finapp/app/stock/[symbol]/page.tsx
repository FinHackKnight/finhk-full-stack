"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, Globe, ExternalLink, Calendar, Volume, Target, Bot } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AIAnalysis } from "@/components/ai-analysis"
import { SimpleChart } from "@/components/simple-chart"

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
      console.log('Fetching stock data for:', symbol)
      const response = await fetch(`/api/stocks/quote?symbols=${symbol}`)
      const result = await response.json()
      console.log('Stock data response:', result)
      if (result.success && result.data) {
        console.log('Setting stock data:', result.data)
        setStockData(result.data)
      } else {
        console.error('Failed to fetch stock data:', result.error)
        // Set a fallback for testing
        setStockData({
          symbol: symbol,
          name: `${symbol} Inc.`,
          price: 100.00,
          change: 1.50,
          changePercent: 1.52,
          volume: 1000000,
          marketCap: 1000000000,
          pe: 25.0,
          sector: 'Technology',
          industry: 'Software',
          high: 102.00,
          low: 98.50,
          open: 99.00,
          previousClose: 98.50
        })
      }
    } catch (error) {
      console.error("Failed to fetch stock data:", error)
      // Set a fallback for testing
      setStockData({
        symbol: symbol,
        name: `${symbol} Inc.`,
        price: 100.00,
        change: 1.50,
        changePercent: 1.52,
        volume: 1000000,
        marketCap: 1000000000,
        pe: 25.0,
        sector: 'Technology',
        industry: 'Software',
        high: 102.00,
        low: 98.50,
        open: 99.00,
        previousClose: 98.50
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStockNews = async () => {
    try {
      console.log('Fetching news for:', symbol)
      const response = await fetch(`/api/stocks/news?symbols=${symbol}&limit=20`)
      const result = await response.json()
      console.log('News response:', result)
      if (result.success && result.data) {
        setStockNews(result.data)
      } else {
        console.error('Failed to fetch news:', result.error)
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
              <div className="flex-1 flex pt-20">
        {/* Left Column - Overview and News */}
        <div className="w-1/2 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
            {/* Overview Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white dark:text-black" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Overview</h2>
              </div>
              
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Market Cap</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stockData ? formatNumber(stockData.marketCap) : "N/A"}</div>
                </div>

                <div className="group p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">P/E Ratio</span>
                  </div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{stockData?.pe ? stockData.pe.toFixed(2) : "N/A"}</div>
                </div>

                <div className="group p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Volume className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Volume</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stockData ? formatNumber(stockData.volume) : "N/A"}</div>
                </div>

                <div className="group p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">52W High</span>
                  </div>
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{stockData ? formatCurrency(stockData.high) : "N/A"}</div>
                </div>
              </div>

              {/* Simple Price Chart */}
              {loading ? (
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20">
                  <div className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">Loading chart...</div>
                  </div>
                </div>
              ) : stockData ? (
                <SimpleChart symbol={symbol} stockData={stockData} />
              ) : (
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
                  <div className="flex items-center justify-center h-32">
                    <div className="text-red-600 dark:text-red-400">Failed to load chart data</div>
                  </div>
                </div>
              )}

              {/* Company Information */}
              <div className="space-y-6">
                <div className="group p-5 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 hover:border-slate-500/40 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                      <Globe className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">Company Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-500/10">
                      <span className="text-sm text-muted-foreground">Sector</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">{stockData?.sector || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-500/10">
                      <span className="text-sm text-muted-foreground">Industry</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">{stockData?.industry || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-500/10">
                      <span className="text-sm text-muted-foreground">Open</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">{stockData ? formatCurrency(stockData.open) : "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Previous Close</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">{stockData ? formatCurrency(stockData.previousClose) : "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="group p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <Activity className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold">Trading Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-emerald-500/10">
                      <span className="text-sm text-muted-foreground">Day High</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{stockData ? formatCurrency(stockData.high) : "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-emerald-500/10">
                      <span className="text-sm text-muted-foreground">Day Low</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">{stockData ? formatCurrency(stockData.low) : "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-emerald-500/10">
                      <span className="text-sm text-muted-foreground">Change</span>
                      <span className={`font-semibold ${stockData?.change && stockData.change > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {stockData ? formatCurrency(stockData.change) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Volume</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stockData ? formatNumber(stockData.volume) : "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* News Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Related News</h2>
                  <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
                    {stockNews.length} articles
                  </Badge>
                </div>
              </div>
              
              {stockNews && stockNews.length > 0 ? (
                <div className="space-y-4">
                  {stockNews.map((news, index) => (
                    <div key={news.id || `news-${index}`} className="group p-4 rounded-xl bg-gradient-to-br from-slate-500/5 to-slate-600/5 border border-slate-500/20 hover:border-slate-500/40 hover:shadow-lg transition-all duration-300">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge
                            variant="secondary"
                            className={`text-xs px-3 py-1 rounded-full ${getSentimentColor(news.sentiment)}`}
                          >
                            <span className="flex items-center gap-2">
                              {getSentimentIcon(news.sentiment)}
                              {news.sentiment}
                            </span>
                          </Badge>
                          <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                            {new Date(news.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base mb-2 line-clamp-2 text-slate-800 dark:text-slate-200">{news.title}</h3>
                        {news.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                            {news.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-medium">{news.source}</span>
                          <ExternalLink className="w-4 h-4" />
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
        <div className="w-1/2 bg-card/30 backdrop-blur-sm flex flex-col">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                <Bot className="w-4 h-4 text-white dark:text-black" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">AI Analysis</h2>
            </div>
            
            <AIAnalysis symbol={symbol} stockData={stockData} />
          </div>
        </div>
      </div>
    </div>
  )
}
