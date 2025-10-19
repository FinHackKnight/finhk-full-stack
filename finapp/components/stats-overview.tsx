"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { TrendingUp, Globe, AlertTriangle, Activity } from "lucide-react"

interface StatCard {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ReactNode
}

const STATS: StatCard[] = [
  {
    title: "Active Events",
    value: "247",
    change: "+12 today",
    trend: "up",
    icon: <Activity className="w-5 h-5" />,
  },
  {
    title: "Markets Tracked",
    value: "156",
    change: "Global coverage",
    trend: "up",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    title: "High Impact",
    value: "18",
    change: "+3 this week",
    trend: "up",
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    title: "Market Volatility",
    value: "18.4",
    change: "-2.3% from avg",
    trend: "down",
    icon: <TrendingUp className="w-5 h-5" />,
  },
]

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {STATS.map((stat, index) => (
        <Card key={stat.title} className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {/* Gradient overlay */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            index === 0 ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10' :
            index === 1 ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10' :
            index === 2 ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10' :
            'bg-gradient-to-br from-purple-500/10 to-pink-500/10'
          }`}></div>
          
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</p>
                <p className={`text-sm font-medium ${
                  stat.trend === "up" 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-blue-600 dark:text-blue-400"
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                index === 0 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                index === 1 ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                index === 2 ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                'bg-purple-500/10 text-purple-600 dark:text-purple-400'
              }`}>
                {stat.icon}
              </div>
            </div>
            
            {/* Trend indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                stat.trend === "up" ? "bg-green-500" : "bg-blue-500"
              }`}></div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {stat.trend === "up" ? "Positive trend" : "Stable trend"}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
