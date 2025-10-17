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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat) => (
        <Card key={stat.title} className="p-4 bg-card/50 backdrop-blur-sm border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-2xl font-semibold mb-1">{stat.value}</p>
              <p className={`text-xs ${stat.trend === "up" ? "text-green-500" : "text-blue-500"}`}>{stat.change}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">{stat.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}
