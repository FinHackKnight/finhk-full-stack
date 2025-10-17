"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useNews } from "@/lib/hooks/use-news"
import type { NewsItem } from "@/lib/news-aggregation"

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Handle negative time (future dates or parsing errors)
  if (diffInSeconds < 0) {
    return 'Just now';
  }

  if (diffInSeconds < 60) {
    return diffInSeconds === 0 ? 'Just now' : 
           diffInSeconds === 1 ? '1 second ago' : `${diffInSeconds} seconds ago`;
  }
  
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  
  const hours = Math.floor(diffInSeconds / 3600);
  if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  
  const days = Math.floor(diffInSeconds / 86400);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

function getNewsType(category: string): "breaking" | "update" | "alert" {
  const cat = category.toLowerCase();
  if (cat.includes('breaking') || cat.includes('alert')) return 'breaking';
  if (cat.includes('market') || cat.includes('stock')) return 'alert';
  return 'update';
}

export function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { news, loading, error } = useNews(10)

  useEffect(() => {
    if (news.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [news.length])

  if (loading || error || news.length === 0) {
    return (
      <div className="h-10 bg-card/80 backdrop-blur-sm border-y border-border flex items-center px-4 overflow-hidden">
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-500 text-white text-xs font-semibold uppercase">LIVE</Badge>
          <span className="text-sm font-medium">
            {loading ? "Loading latest news..." : error ? "Unable to load news" : "No news available"}
          </span>
        </div>
      </div>
    )
  }

  const currentNews = news[currentIndex]
  const newsType = getNewsType(currentNews.category)
  const relativeTime = getRelativeTime(currentNews.published_at)

  const typeColors = {
    breaking: "bg-red-500 text-white",
    update: "bg-blue-500 text-white",
    alert: "bg-yellow-500 text-black",
  }

  return (
    <div 
      className="h-10 bg-card/80 backdrop-blur-sm border-y border-border flex items-center px-4 overflow-hidden cursor-pointer hover:bg-card/90 transition-colors"
      onClick={() => window.open(currentNews.url, '_blank')}
    >
      <div className="flex items-center gap-3 animate-in fade-in duration-500" key={currentNews.uuid}>
        <Badge className={`${typeColors[newsType]} text-xs font-semibold uppercase`}>{newsType}</Badge>
        <span className="text-sm font-medium truncate flex-1">{currentNews.title}</span>
        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{relativeTime}</span>
        <span className="text-xs text-muted-foreground/80 flex-shrink-0">• {currentNews.source}</span>
      </div>
    </div>
  )
}
