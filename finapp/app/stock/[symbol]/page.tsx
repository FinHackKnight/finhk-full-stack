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
  const [activeTab, setActiveTab] = useState<"overview" | "news" | "analysis">("overview")

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-mono font-semibold text-primary">
                    {symbol?.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{stockData?.name || symbol}</h1>
                  <p className="text-muted-foreground font-mono">{symbol}</p>
                </div>
              </div>
            </div>
            
            {stockData && (
              <div className="text-right">
                <div className="text-3xl font-bold">{formatCurrency(stockData.price)}</div>
                <div className={`flex items-center gap-2 ${stockData.changePercent > 0 ? "text-green-500" : "text-red-500"}`}>
                  {stockData.changePercent > 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {stockData.changePercent > 0 ? "+" : ""}{stockData.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "news", label: "News", icon: Globe },
              { id: "analysis", label: "Analysis", icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="text-2xl font-bold">{stockData ? formatNumber(stockData.marketCap) : "N/A"}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">P/E Ratio</p>
                    <p className="text-2xl font-bold">{stockData?.pe ? stockData.pe.toFixed(2) : "N/A"}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Volume className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Volume</p>
                    <p className="text-2xl font-bold">{stockData ? formatNumber(stockData.volume) : "N/A"}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">52W High</p>
                    <p className="text-2xl font-bold">{stockData ? formatCurrency(stockData.high) : "N/A"}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Company Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Company Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sector</span>
                    <span className="font-medium">{stockData?.sector || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{stockData?.industry || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Open</span>
                    <span className="font-medium">{stockData ? formatCurrency(stockData.open) : "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Previous Close</span>
                    <span className="font-medium">{stockData ? formatCurrency(stockData.previousClose) : "N/A"}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Trading Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Day High</span>
                    <span className="font-medium text-green-500">{stockData ? formatCurrency(stockData.high) : "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Day Low</span>
                    <span className="font-medium text-red-500">{stockData ? formatCurrency(stockData.low) : "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Change</span>
                    <span className={`font-medium ${stockData?.change && stockData.change > 0 ? "text-green-500" : "text-red-500"}`}>
                      {stockData ? formatCurrency(stockData.change) : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume</span>
                    <span className="font-medium">{stockData ? formatNumber(stockData.volume) : "N/A"}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "news" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Latest News</h2>
              <Badge variant="outline" className="text-sm">
                {stockNews.length} articles
              </Badge>
            </div>
            
            {stockNews && stockNews.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stockNews.map((news, index) => (
                  <Card key={news.id || `news-${index}`} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
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
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{news.title}</h3>
                          {news.description && (
                            <p className="text-muted-foreground mb-3 line-clamp-3">
                              {news.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{news.source}</span>
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No News Available</h3>
                <p className="text-muted-foreground">No recent news found for this stock.</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Technical Analysis</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Price Charts</h3>
                <p className="text-muted-foreground">Interactive price charts and technical indicators will be available soon.</p>
              </Card>

              <Card className="p-8 text-center">
                <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Market Analysis</h3>
                <p className="text-muted-foreground">AI-powered market analysis and predictions coming soon.</p>
              </Card>
            </div>

            <Card className="p-8">
              <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">+2.3%</div>
                  <div className="text-sm text-muted-foreground">1D Change</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">28.5</div>
                  <div className="text-sm text-muted-foreground">P/E Ratio</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">1.2B</div>
                  <div className="text-sm text-muted-foreground">Volume</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">$175.43</div>
                  <div className="text-sm text-muted-foreground">Current Price</div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
