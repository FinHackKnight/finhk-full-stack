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
import { Search, ExternalLink, Clock, TrendingUp, AlertCircle, RefreshCw } from "lucide-react"
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
    <div className="h-full w-full flex bg-gradient-to-br from-background via-background to-muted/20">
      <FixedEventPopup event={hoveredEvent} />

      <div className="w-96 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col relative">
        {selectedEvent ? (
          <EventDetailModal event={selectedEvent} onClose={handleCloseModal} />
        ) : (
          <>
            <div className="p-4 border-b border-border/50 space-y-3">
              {/* Toggle between Events and News */}
              <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                <Button
                  variant={!showNews ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowNews(false)}
                  className="flex-1 text-xs"
                >
                  Events
                </Button>
                <Button
                  variant={showNews ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowNews(true)}
                  className="flex-1 text-xs"
                >
                  News
                  {newsLoading && <RefreshCw className="w-3 h-3 ml-1 animate-spin" />}
                </Button>
              </div>

              {!showNews ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background/50 transition-all focus:bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <CategoryFilter selectedCategories={selectedCategories} onCategoriesChange={setSelectedCategories} />
                    <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Financial News</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={refetch}
                    disabled={newsLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${newsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 p-4">
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
                      <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Failed to load news</p>
                      <p className="text-xs text-muted-foreground mb-3">{newsError}</p>
                      <Button variant="outline" size="sm" onClick={refetch}>
                        Try Again
                      </Button>
                    </div>
                  ) : newsLoading && news.length === 0 ? (
                    // Loading skeleton
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/30 animate-pulse">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-full" />
                            <div className="h-3 bg-muted rounded w-1/4" />
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
                          className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer animate-in fade-in-0 slide-in-from-left-5 duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                          onClick={() => window.open(newsItem.url, '_blank')}
                        >
                          <div className="flex gap-3">
                            {newsItem.image_url ? (
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                                <img 
                                  src={newsItem.image_url} 
                                  alt={newsItem.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden w-full h-full bg-primary/10 flex items-center justify-center">
                                  {getCategoryIcon(newsItem.category)}
                                </div>
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                {getCategoryIcon(newsItem.category)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                  {newsItem.title}
                                </h4>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">{relativeTime}</span>
                                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                              {newsItem.description && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{newsItem.description}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{newsItem.category}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{newsItem.source}</span>
                                {newsItem.symbols && newsItem.symbols.length > 0 && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
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
          </>
        )}
      </div>

      <div className="flex-1 relative">
        <Globe3D
          events={filteredEvents}
          hoveredEventId={hoveredEventId}
          onEventHover={setHoveredEventId}
          onEventClick={handleEventClick}
        />
      </div>
    </div>
  )
}
