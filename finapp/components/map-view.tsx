"use client"

import { useState } from "react"
import { Globe3D } from "@/components/globe-3d"
import { EventCard } from "@/components/event-card"
import { CategoryFilter } from "@/components/category-filter"
import { DatePicker } from "@/components/date-picker"
import { EventDetailModal } from "@/components/event-detail-modal"
import { FixedEventPopup } from "@/components/fixed-event-popup"
import { mockEventsWithMarkets } from "@/lib/mock-data"
import type { EventWithMarkets } from "@/lib/mock-data"
import { useNews } from "@/lib/hooks/use-news"
import type { NewsItem } from "@/lib/marketaux-news"
import { Search, ExternalLink, Clock, TrendingUp, AlertCircle, RefreshCw, Globe, Activity, MapPin, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

// Helper function to get relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Helper function to get category icon
function getCategoryIcon(category: string) {
  switch (category) {
    case 'Market':
    case 'Stocks':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'Economic':
      return <AlertCircle className="w-4 h-4 text-blue-500" />;
    case 'Financial':
      return <TrendingUp className="w-4 h-4 text-purple-500" />;
    case 'Commodities':
      return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    default:
      return <Clock className="w-4 h-4 text-primary" />;
  }
}

export function MapView() {
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedEvent, setSelectedEvent] = useState<EventWithMarkets | null>(null)
  const [showNews, setShowNews] = useState(false) // Toggle between events and news
  
  // Fetch news data
  const { news, loading: newsLoading, error: newsError, refetch } = useNews(20)

  const filteredEvents = mockEventsWithMarkets.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const hoveredEvent = hoveredEventId ? filteredEvents.find((e) => e.id === hoveredEventId) || null : null

  const handleEventClick = (event: EventWithMarkets) => {
    setSelectedEvent(event)
  }

  const handleCloseModal = () => {
    setSelectedEvent(null)
  }

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5"></div>
        <div className="relative container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 text-sm font-medium">
              <Globe className="w-4 h-4" />
              Live Global Events Tracking
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              Global Events Map
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Interactive 3D globe with real-time global events, financial news, and market impact analysis
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-300px)]">
          {/* Sidebar */}
          <div className="xl:col-span-4">
            <div className="h-full flex flex-col">
              {selectedEvent ? (
                <EventDetailModal event={selectedEvent} onClose={handleCloseModal} />
              ) : (
                <>
                  {/* Controls Section */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Event Controls</h2>
                    </div>
                    
                    {/* Toggle between Events and News */}
                    <div className="flex gap-1 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                      <Button
                        variant={!showNews ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setShowNews(false)}
                        className="flex-1 text-sm"
                      >
                        Events
                      </Button>
                      <Button
                        variant={showNews ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setShowNews(true)}
                        className="flex-1 text-sm"
                      >
                        News
                        {newsLoading && <RefreshCw className="w-3 h-3 ml-1 animate-spin" />}
                      </Button>
                    </div>

                    {!showNews ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Search & Filter</h3>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm"
                          />
                        </div>
                        <div className="space-y-3">
                          <CategoryFilter selectedCategories={selectedCategories} onCategoriesChange={setSelectedCategories} />
                          <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Financial News</h3>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={refetch}
                          disabled={newsLoading}
                          className="text-slate-600 dark:text-slate-300"
                        >
                          <RefreshCw className={`w-4 h-4 ${newsLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Content List */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {!showNews ? "Recent Events" : "Latest News"}
                      </h3>
                    </div>
                    
                    <ScrollArea className="h-[calc(100vh-500px)] pr-4">
                      {!showNews ? (
                        // Events View
                        <div className="space-y-3">
                          {filteredEvents.map((event) => (
                            <div
                              key={event.id}
                              className="animate-in fade-in-0 slide-in-from-left-5 duration-300"
                              style={{ animationDelay: `${filteredEvents.indexOf(event) * 50}ms` }}
                            >
                              <EventCard event={event} onHover={setHoveredEventId} onClick={handleEventClick} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        // News View
                        <div className="space-y-3">
                          {newsError ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
                              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Failed to load news</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{newsError}</p>
                              <Button variant="outline" size="sm" onClick={refetch} className="text-slate-600 dark:text-slate-300">
                                Try Again
                              </Button>
                            </div>
                          ) : newsLoading && news.length === 0 ? (
                            // Loading skeleton
                            Array.from({ length: 6 }).map((_, i) => (
                              <div key={i} className="p-3 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse">
                                <div className="flex gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700" />
                                  <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4" />
                                    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-full" />
                                    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/4" />
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            news.map((newsItem, index) => {
                              const relativeTime = getRelativeTime(newsItem.published_at);
                              
                              return (
                                <div
                                  key={newsItem.uuid}
                                  className="p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group cursor-pointer animate-in fade-in-0 slide-in-from-left-5 duration-300 border border-slate-200 dark:border-slate-700 shadow-sm"
                                  style={{ animationDelay: `${index * 50}ms` }}
                                  onClick={() => window.open(newsItem.url, '_blank')}
                                >
                                  <div className="flex gap-3">
                                    {newsItem.image_url ? (
                                      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-slate-300 dark:bg-slate-700">
                                        <img 
                                          src={newsItem.image_url} 
                                          alt={newsItem.title}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                          }}
                                        />
                                        <div className="hidden w-full h-full bg-blue-500/10 flex items-center justify-center">
                                          {getCategoryIcon(newsItem.category)}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        {getCategoryIcon(newsItem.category)}
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-slate-900 dark:text-white">
                                          {newsItem.title}
                                        </h4>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{relativeTime}</span>
                                          <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                      </div>
                                      {newsItem.description && (
                                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">{newsItem.description}</p>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">{newsItem.category}</span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{newsItem.source}</span>
                                        {newsItem.symbols && newsItem.symbols.length > 0 && (
                                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                            {newsItem.symbols.slice(0, 2).join(', ')}{newsItem.symbols.length > 2 ? '...' : ''}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Globe Section */}
          <div className="xl:col-span-8">
            <div className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Interactive 3D Globe</h3>
              </div>
              <div className="h-[calc(100vh-400px)] rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm">
                <FixedEventPopup event={hoveredEvent} />
                <Globe3D
                  events={filteredEvents}
                  hoveredEventId={hoveredEventId}
                  onEventHover={setHoveredEventId}
                  onEventClick={handleEventClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
