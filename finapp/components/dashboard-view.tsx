"use client"

import { StatsOverview } from "@/components/stats-overview"
import { ActivityFeed } from "@/components/activity-feed"
import { MarketChart } from "@/components/market-chart"
import { EventImpactList } from "@/components/event-impact-list"
import { GeminiChat } from "@/components/gemini-chat"
import { TrendingUp, Globe, Activity, AlertTriangle } from "lucide-react"

// Generate sample data
const generateData = (base: number, volatility: number, points = 24) => {
  const data = []
  let value = base
  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.5) * volatility
    data.push({
      time: `${i}:00`,
      value: value,
    })
  }
  return data
}

const globalIndexData = generateData(3200, 15)

export function DashboardView() {
  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5"></div>
        <div className="relative container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 text-sm font-medium">
              <Activity className="w-4 h-4" />
              Live Financial Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              Global Insights Dashboard
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Real-time market analysis, global events tracking, and AI-powered financial intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-8 space-y-8">
        {/* Stats Overview */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Market Overview</h2>
          </div>
          <StatsOverview />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Market Chart - Takes up more space */}
          <div className="xl:col-span-8">
            <div className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Global Market Index</h3>
              </div>
              <MarketChart
                title=""
                data={globalIndexData}
                change={32.5}
                changePercent={1.03}
                color="hsl(var(--chart-1))"
              />
            </div>
          </div>

          {/* Activity Feed */}
          <div className="xl:col-span-4">
            <div className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Live Activity</h3>
              </div>
              <ActivityFeed />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Events Impact */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">High-Impact Events</h3>
            </div>
            <EventImpactList />
          </div>

          {/* AI Chat */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">AI Financial Assistant</h3>
            </div>
            <GeminiChat />
          </div>
        </div>
      </div>
    </div>
  )
}
