"use client"

import React, { useEffect, useRef } from 'react'
import useSWR from 'swr'
import { createChart, IChartApi, CandlestickData, ColorType } from 'lightweight-charts'

interface ProfessionalChartProps {
  symbol: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function ProfessionalChart({ symbol }: ProfessionalChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const { data, error, isLoading } = useSWR<{ data: CandlestickData[] }>(`/api/ohlc?symbol=${symbol}`, fetcher)

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'var(--foreground)',
      },
      grid: {
        vertLines: { color: 'var(--border)' },
        horzLines: { color: 'var(--border)' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'var(--border)',
      },
      timeScale: {
        borderColor: 'var(--border)',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chartRef.current = chart

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!data || !chartRef.current) return

    const series = chartRef.current.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    })

    series.setData(data.data)
    chartRef.current.timeScale().fitContent()

    return () => {
      if (chartRef.current) {
        chartRef.current.removeSeries(series)
      }
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading chart data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
        <div className="flex flex-col items-center justify-center h-64 space-y-2">
          <div className="text-red-600 dark:text-red-400 text-center">
            Failed to load chart data. Please check your API configuration.
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Make sure to add your ALPHAVANTAGE_KEY to .env.local
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 hover:border-slate-500/40 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
          {symbol} Price Chart
        </h3>
        <div className="text-sm text-muted-foreground">
          Daily OHLC Data
        </div>
      </div>
      
      <div className="w-full h-[400px]" ref={chartContainerRef} />
      
      <div className="mt-3 text-xs text-muted-foreground">
        Powered by Alpha Vantage API
      </div>
    </div>
  )
}
