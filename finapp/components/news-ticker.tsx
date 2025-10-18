"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useNews } from "@/lib/hooks/use-news"
import { Activity } from "lucide-react"
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
  const [isDark, setIsDark] = useState(true)
  const { news, loading, error } = useNews(10)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkTheme()
    
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (news.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [news.length])

  if (loading || error || news.length === 0) {
    return (
      <div className={`h-12 border-b shadow-lg ${
        isDark 
          ? "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-slate-600/50" 
          : "bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-slate-200/50"
      }`}>
        <div className="flex items-center h-full px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <Badge className="bg-red-500 text-white text-xs font-bold uppercase tracking-wider">
                LIVE
              </Badge>
            </div>
            <div className={`flex items-center gap-3 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}>
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">
                {loading ? "Loading latest news..." : error ? "Unable to load news" : "No news available"}
              </span>
              <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>•</span>
              <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Last updated: Just now</span>
            </div>
          </div>
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
      className={`h-12 border-b shadow-lg cursor-pointer transition-all duration-300 ${
        isDark 
          ? "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-slate-600/50 hover:from-slate-700 hover:via-slate-600 hover:to-slate-700" 
          : "bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-slate-200/50 hover:from-slate-200 hover:via-slate-100 hover:to-slate-200"
      }`}
      onClick={() => window.open(currentNews.url, '_blank')}
    >
      <div className="flex items-center h-full px-8">
        <div className="flex items-center gap-4 animate-in fade-in duration-500" key={currentNews.uuid}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <Badge className={`${typeColors[newsType]} text-xs font-bold uppercase tracking-wider`}>
              {newsType}
            </Badge>
          </div>
          <div className={`flex items-center gap-3 flex-1 ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}>
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium truncate">{currentNews.title}</span>
            <span className={`text-xs flex-shrink-0 ${isDark ? "text-slate-400" : "text-slate-500"}`}>•</span>
            <span className={`text-xs flex-shrink-0 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{relativeTime}</span>
            <span className={`text-xs flex-shrink-0 ${isDark ? "text-slate-400" : "text-slate-500"}`}>• {currentNews.source}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
