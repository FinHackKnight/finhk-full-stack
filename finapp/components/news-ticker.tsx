"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface NewsItem {
  id: string
  text: string
  type: "breaking" | "update" | "alert"
  time: string
}

const NEWS_ITEMS: NewsItem[] = [
  { id: "1", text: "US Fed maintains interest rates at 5.25-5.50%", type: "breaking", time: "2m ago" },
  { id: "2", text: "European markets rally on positive economic data", type: "update", time: "15m ago" },
  { id: "3", text: "Oil prices surge 3% amid Middle East tensions", type: "alert", time: "28m ago" },
  { id: "4", text: "Tech stocks lead NASDAQ gains in morning trading", type: "update", time: "45m ago" },
  { id: "5", text: "China announces new stimulus package", type: "breaking", time: "1h ago" },
  { id: "6", text: "Gold reaches new yearly high at $2,050/oz", type: "update", time: "2h ago" },
]

export function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % NEWS_ITEMS.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const currentNews = NEWS_ITEMS[currentIndex]

  const typeColors = {
    breaking: "bg-red-500 text-white",
    update: "bg-blue-500 text-white",
    alert: "bg-yellow-500 text-black",
  }

  return (
    <div className="h-10 bg-card/80 backdrop-blur-sm border-y border-border flex items-center px-4 overflow-hidden">
      <div className="flex items-center gap-3 animate-in fade-in duration-500" key={currentNews.id}>
        <Badge className={`${typeColors[currentNews.type]} text-xs font-semibold uppercase`}>{currentNews.type}</Badge>
        <span className="text-sm font-medium">{currentNews.text}</span>
        <span className="text-xs text-muted-foreground ml-2">{currentNews.time}</span>
      </div>
    </div>
  )
}
