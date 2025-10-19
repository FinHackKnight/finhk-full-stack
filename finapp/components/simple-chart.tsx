"use client"

import React, { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SimpleChartProps {
  symbol: string
  stockData?: {
    price: number
    change: number
    changePercent: number
    high: number
    low: number
    open: number
    previousClose: number
  } | null
}

type DateRange = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'All'

export function SimpleChart({ symbol, stockData }: SimpleChartProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>('1D')
  const [showTooltip, setShowTooltip] = useState(false)

  if (!stockData) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20">
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    )
  }

  // Generate simple mock data for visualization based on date range
  const generateMockData = () => {
    const data = []
    const basePrice = stockData.previousClose
    const currentPrice = stockData.price
    const priceRange = stockData.high - stockData.low
    
    // Determine number of data points based on selected range
    let dataPoints = 20
    let timeFormat = 'HH:mm'
    
    switch (selectedRange) {
      case '1D':
        dataPoints = 24 // Hourly data for 1 day
        timeFormat = 'HH:mm'
        break
      case '5D':
        dataPoints = 5 // Daily data for 5 days
        timeFormat = 'MM/DD'
        break
      case '1M':
        dataPoints = 30 // Daily data for 1 month
        timeFormat = 'MM/DD'
        break
      case '6M':
        dataPoints = 26 // Weekly data for 6 months
        timeFormat = 'MM/DD'
        break
      case 'YTD':
        dataPoints = 12 // Monthly data for year to date
        timeFormat = 'MM/YY'
        break
      case '1Y':
        dataPoints = 12 // Monthly data for 1 year
        timeFormat = 'MM/YY'
        break
      case '5Y':
        dataPoints = 20 // Quarterly data for 5 years
        timeFormat = 'MM/YY'
        break
      case 'All':
        dataPoints = 30 // Mixed data for all time
        timeFormat = 'MM/YY'
        break
    }
    
    for (let i = 0; i < dataPoints; i++) {
      const progress = i / (dataPoints - 1)
      const volatility = (Math.random() - 0.5) * 0.01
      const trend = (currentPrice - basePrice) / basePrice * progress
      const price = basePrice * (1 + trend + volatility)
      
      // Generate time labels based on range
      let timeLabel = ''
      if (selectedRange === '1D') {
        timeLabel = `${i.toString().padStart(2, '0')}:00`
      } else if (selectedRange === '5D') {
        const date = new Date()
        date.setDate(date.getDate() - (dataPoints - 1 - i))
        timeLabel = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
      } else {
        const date = new Date()
        date.setMonth(date.getMonth() - (dataPoints - 1 - i))
        timeLabel = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`
      }
      
      data.push({
        time: timeLabel,
        price: Math.max(stockData.low, Math.min(stockData.high, price))
      })
    }
    
    return data
  }

  const mockData = generateMockData()
  const minPrice = Math.min(...mockData.map(d => d.price))
  const maxPrice = Math.max(...mockData.map(d => d.price))
  const priceRange = maxPrice - minPrice

  const dateRanges: DateRange[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'All']

  return (
    <div className="relative p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 hover:border-slate-500/40 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
          {symbol} Price Chart
        </h3>
        <div className="flex items-center gap-2">
          {stockData.changePercent > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-semibold ${stockData.changePercent > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stockData.changePercent > 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-wrap gap-1 mb-4">
        {dateRanges.map((range) => (
          <Button
            key={range}
            variant={selectedRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRange(range)}
            className={`text-xs px-2 py-1 h-7 ${
              selectedRange === range 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-transparent hover:bg-muted/50'
            }`}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Simple Chart */}
      <div 
        className="relative h-48 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid Lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Price Line */}
          <polyline
            fill="none"
            stroke={stockData.changePercent > 0 ? "#10b981" : "#ef4444"}
            strokeWidth="2"
            points={mockData.map((point, index) => {
              const x = (index / (mockData.length - 1)) * 100
              const y = 100 - ((point.price - minPrice) / priceRange) * 100
              return `${x},${y}`
            }).join(' ')}
          />
          
          {/* Data Points */}
          {mockData.map((point, index) => {
            const x = (index / (mockData.length - 1)) * 100
            const y = 100 - ((point.price - minPrice) / priceRange) * 100
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={stockData.changePercent > 0 ? "#10b981" : "#ef4444"}
                opacity="0.8"
              />
            )
          })}
        </svg>

        {/* Price Labels */}
        <div className="absolute top-2 left-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          ${maxPrice.toFixed(2)}
        </div>
        <div className="absolute bottom-2 left-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          ${minPrice.toFixed(2)}
        </div>
        
        {/* Current Price */}
        <div className="absolute top-2 right-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          ${stockData.price.toFixed(2)}
        </div>

      </div>

      {/* Detailed Table - Shows on Hover */}
      {showTooltip && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Detailed Financial Data</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">Previous Close:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">${stockData.previousClose.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">Open:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">${stockData.open.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">Bid:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">${(stockData.price - 0.1).toFixed(2)} x 500</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">Ask:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">${(stockData.price + 0.1).toFixed(2)} x 1000</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">Day's Range:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">${stockData.low.toFixed(2)} - ${stockData.high.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">52W Range:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">${(stockData.low * 0.3).toFixed(2)} - ${(stockData.high * 1.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">Volume:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{stockData.volume.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600 dark:text-slate-400">Avg. Volume:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{(stockData.volume * 0.6).toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">Market Cap:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">${(stockData.marketCap / 1_000_000_000).toFixed(2)}B</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">Beta:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">2.25</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">PE Ratio:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{stockData.pe.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">EPS:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{(stockData.price / stockData.pe).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">Earnings:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">Nov 3, 2025</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">Dividend:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">--</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400">Ex-Div:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">--</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600 dark:text-slate-400">1y Target:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">${(stockData.price * 0.8).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Labels */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        {selectedRange === '1D' ? (
          <>
            <span>9:00</span>
            <span>12:00</span>
            <span>15:00</span>
            <span>18:00</span>
          </>
        ) : selectedRange === '5D' ? (
          <>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
          </>
        ) : (
          <>
            <span>Start</span>
            <span>Mid</span>
            <span>End</span>
          </>
        )}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
          <div className="text-xs text-muted-foreground">Day High</div>
          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
            ${stockData.high.toFixed(2)}
          </div>
        </div>
        <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
          <div className="text-xs text-muted-foreground">Day Low</div>
          <div className="text-sm font-semibold text-red-600 dark:text-red-400">
            ${stockData.low.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}
