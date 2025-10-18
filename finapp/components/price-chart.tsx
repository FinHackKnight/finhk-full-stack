"use client"

import React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface PriceChartProps {
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

export function PriceChart({ symbol, stockData }: PriceChartProps) {
  if (!stockData) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20">
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    )
  }

  // Generate mock price data for visualization
  const generatePriceData = () => {
    const data = []
    const basePrice = stockData.previousClose
    const currentPrice = stockData.price
    const priceRange = stockData.high - stockData.low
    
    for (let i = 0; i < 24; i++) {
      const hour = i
      const time = `${hour.toString().padStart(2, '0')}:00`
      
      // Generate realistic price movement
      const progress = i / 23
      const volatility = (Math.random() - 0.5) * 0.02
      const trend = (currentPrice - basePrice) / basePrice * progress
      const price = basePrice * (1 + trend + volatility)
      
      data.push({
        time,
        price: Math.max(stockData.low, Math.min(stockData.high, price)),
        volume: Math.floor(Math.random() * 1000000) + 100000
      })
    }
    
    return data
  }

  const priceData = generatePriceData()
  const minPrice = Math.min(...priceData.map(d => d.price))
  const maxPrice = Math.max(...priceData.map(d => d.price))
  const priceRange = maxPrice - minPrice

  const formatPrice = (price: number) => price.toFixed(2)
  const formatTime = (time: string) => time

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 hover:border-slate-500/40 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">Price Chart</h3>
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

      {/* Chart Container */}
      <div className="relative h-48 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
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
            points={priceData.map((point, index) => {
              const x = (index / (priceData.length - 1)) * 100
              const y = 100 - ((point.price - minPrice) / priceRange) * 100
              return `${x},${y}`
            }).join(' ')}
          />
          
          {/* Data Points */}
          {priceData.map((point, index) => {
            const x = (index / (priceData.length - 1)) * 100
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
          ${formatPrice(maxPrice)}
        </div>
        <div className="absolute bottom-2 left-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          ${formatPrice(minPrice)}
        </div>
        
        {/* Current Price */}
        <div className="absolute top-2 right-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          ${formatPrice(stockData.price)}
        </div>
      </div>

      {/* Time Labels */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>9:00</span>
        <span>12:00</span>
        <span>15:00</span>
        <span>18:00</span>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
          <div className="text-xs text-muted-foreground">Day High</div>
          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
            ${formatPrice(stockData.high)}
          </div>
        </div>
        <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
          <div className="text-xs text-muted-foreground">Day Low</div>
          <div className="text-sm font-semibold text-red-600 dark:text-red-400">
            ${formatPrice(stockData.low)}
          </div>
        </div>
      </div>
    </div>
  )
}
