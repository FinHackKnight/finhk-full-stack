"use client"

import React, { useState, useEffect } from "react"
import { X, TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, Globe, ExternalLink } from "lucide-react"
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

interface StockProfilePopupProps {
  stock: {
    symbol: string
    name: string
    changePercent: number
  }
  isOpen: boolean
  onClose: () => void
}

export function StockProfilePopup({ stock, isOpen, onClose }: StockProfilePopupProps) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [stockNews, setStockNews] = useState<StockNews[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "news" | "analysis">("overview")

  useEffect(() => {
    if (isOpen && stock.symbol) {
      fetchStockData()
      fetchStockNews()
    }
  }, [isOpen, stock.symbol])

  const fetchStockData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/stocks/quote?symbols=${stock.symbol}`)
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
      const response = await fetch(`/api/stocks/news?symbols=${stock.symbol}&limit=10`)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup Panel */}
      <div className="w-full max-w-2xl bg-background border-l border-border shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-mono font-semibold text-primary">
                  {stock.symbol.slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{stock.name}</h2>
                <p className="text-sm text-muted-foreground font-mono">{stock.symbol}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "news"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-4 h-4" />
              News
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "analysis"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className="w-4 h-4" />
              Analysis
            </button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* Price Overview */}
                      <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Current Price</h3>
                          <div className="flex items-center gap-2">
                            {stock.changePercent > 0 ? (
                              <TrendingUp className="w-5 h-5 text-green-500" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-500" />
                            )}
                            <span className={`font-semibold ${stock.changePercent > 0 ? "text-green-500" : "text-red-500"}`}>
                              {stock.changePercent > 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-3xl font-bold mb-2">
                          {stockData ? formatCurrency(stockData.price) : "Loading..."}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {stockData && `Volume: ${formatNumber(stockData.volume)}`}
                        </div>
                      </Card>

                      {/* Key Metrics */}
                      {stockData && (
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Market Cap</span>
                            </div>
                            <div className="text-lg font-semibold">
                              {formatNumber(stockData.marketCap)}
                            </div>
                          </Card>
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart3 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">P/E Ratio</span>
                            </div>
                            <div className="text-lg font-semibold">
                              {stockData.pe ? stockData.pe.toFixed(2) : "N/A"}
                            </div>
                          </Card>
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Globe className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Sector</span>
                            </div>
                            <div className="text-lg font-semibold">
                              {stockData.sector}
                            </div>
                          </Card>
                          <Card className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Industry</span>
                            </div>
                            <div className="text-lg font-semibold">
                              {stockData.industry}
                            </div>
                          </Card>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "news" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Latest News</h3>
                      {stockNews && stockNews.length > 0 ? (
                        <div className="space-y-3">
                          {stockNews.map((news, index) => (
                            <Card key={news.id || `news-${index}`} className="p-4 hover:bg-muted/50 transition-colors">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {news.sentiment}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(news.publishedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <h4 className="font-medium mb-2 line-clamp-2">{news.title}</h4>
                                  {news.description && (
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                      {news.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{news.source}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No news available for this stock
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "analysis" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Technical Analysis</h3>
                      <Card className="p-6">
                        <div className="text-center py-8 text-muted-foreground">
                          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Technical analysis data will be available soon</p>
                        </div>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}