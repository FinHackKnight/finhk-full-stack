"use client"

import { useState, useRef, useEffect } from "react"
import { Globe3D } from "@/components/globe-3d"
import { EventCard } from "@/components/event-card"
import { CategoryFilter } from "@/components/category-filter"
import { DatePicker } from "@/components/date-picker"
import { EventDetailModal } from "@/components/event-detail-modal"
import { FixedEventPopup } from "@/components/fixed-event-popup"
import type { EventWithMarkets } from "@/lib/mock-data"
import { useNews } from "@/lib/hooks/use-news"
import { useEvents } from "@/lib/hooks/use-events"
import { Search, ExternalLink, Clock, TrendingUp, AlertCircle, RefreshCw, Newspaper } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MapViewProps {
  onStockClick?: (stock: { symbol: string; name: string; changePercent: number }) => void
}

export function MapView({ onStockClick }: MapViewProps) {
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedEvent, setSelectedEvent] = useState<EventWithMarkets | null>(null)
  const [showNews, setShowNews] = useState(false)

  const { events, loading: eventsLoading, refetch: refetchEvents } = useEvents({ date: selectedDate })
  const { news, loading: newsLoading, refetch: refetchNews, error: newsError } = useNews(20)

  // Filter events
  const filteredEvents = (events || []).filter(
    (event): event is EventWithMarkets => {
      if (!event || typeof event !== "object") return false
      const matchesSearch = searchQuery.trim() === "" || (event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesCategory = selectedCategories.length === 0 || (event.type ? selectedCategories.includes(event.type) : false)
      // Date filtering is now handled by the API (Time Machine endpoint)
      return matchesSearch && matchesCategory
    }
  )

  const hoveredEvent = hoveredEventId ? filteredEvents.find((e) => e.id === hoveredEventId) || null : null
  const handleEventClick = (event: EventWithMarkets) => setSelectedEvent(event)
  const handleCloseModal = () => setSelectedEvent(null)
  
  // Date change handler
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    // Events will automatically refresh via useEvents hook
  }

  // Sidebar resizing
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isResizingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(320) // default width

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isResizingRef.current = true
    startXRef.current = e.clientX
    startWidthRef.current = sidebarRef.current?.offsetWidth || 320
    document.body.style.cursor = "col-resize"
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current || !sidebarRef.current) return
    const dx = e.clientX - startXRef.current
    let newWidth = startWidthRef.current + dx
    if (newWidth < 256) newWidth = 256
    if (newWidth > 640) newWidth = 640
    sidebarRef.current.style.width = `${newWidth}px`
  }

  const handleMouseUp = () => {
    isResizingRef.current = false
    document.body.style.cursor = "default"
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  return (
    <div className="h-full w-full relative">
      {/* Globe */}
      <div className="absolute inset-0 z-0">
        <Globe3D
          events={filteredEvents}
          hoveredEventId={hoveredEventId}
          onEventHover={setHoveredEventId}
          onEventClick={handleEventClick}
        />
      </div>

      <FixedEventPopup event={hoveredEvent} />

      {/* Sidebar overlay */}
      <div
        ref={sidebarRef}
        className="absolute top-0 left-0 bottom-0 z-10 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col w-80 min-w-[16rem] max-w-[40rem] transition-all"
      >
        {/* Drag handle - always on top */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute right-0 top-0 h-full w-2 cursor-col-resize z-50 bg-muted/30 hover:bg-muted/70 rounded-l transition-colors group"
        >
          {/* Visual indicator dots */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
            <div className="w-0.5 h-0.5 bg-foreground rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-foreground rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-foreground rounded-full"></div>
          </div>
        </div>

        {selectedEvent ? (
          <EventDetailModal event={selectedEvent} onClose={handleCloseModal} onStockClick={onStockClick} />
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border/50 space-y-3 sticky top-0 z-10 bg-card/30">
              <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                <Button
                  variant={!showNews ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowNews(false)}
                  className="flex-1 text-xs"
                >
                  Events
                  {eventsLoading && <RefreshCw className="w-3 h-3 ml-1 animate-spin" />}
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

              {selectedDate && !showNews && (
                <div className="flex items-center gap-2 px-2 py-1.5 bg-primary/10 border border-primary/20 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    Time Machine: {selectedDate.toLocaleDateString()}
                  </span>
                </div>
              )}

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
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <CategoryFilter selectedCategories={selectedCategories} onCategoriesChange={setSelectedCategories} />
                      <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchEvents()}
                      disabled={eventsLoading}
                      className="h-7 text-xs shrink-0"
                      title="Refresh events"
                    >
                      <RefreshCw className={`w-3 h-3 ${eventsLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {news.length} articles
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchNews()}
                    disabled={newsLoading}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${newsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 p-4">
              {!showNews ? (
                <div className="space-y-3">
                  {eventsLoading && events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      <p className="text-sm">
                        {selectedDate ? 'Loading historical events...' : 'Loading events...'}
                      </p>
                      {selectedDate && (
                        <p className="text-xs mt-1 opacity-70">
                          {selectedDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-sm">No events found</p>
                      {searchQuery || selectedCategories.length > 0 || selectedDate ? (
                        <p className="text-xs mt-1">Try adjusting your filters</p>
                      ) : null}
                    </div>
                  ) : (
                    filteredEvents.map((event, index) => (
                      <div
                        key={event.id}
                        className="animate-in fade-in-0 slide-in-from-left-5 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <EventCard event={event} onHover={setHoveredEventId} onClick={handleEventClick} />
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {newsLoading && news.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      Loading news...
                    </div>
                  ) : newsError ? (
                    <Card className="p-4 bg-destructive/10 border-destructive/20">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                        <div className="text-sm text-destructive">{newsError}</div>
                      </div>
                    </Card>
                  ) : news.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Newspaper className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-sm">No news articles found</p>
                    </div>
                  ) : (
                    news.map((article, index) => (
                      <Card
                        key={article.uuid}
                        className="overflow-hidden hover:shadow-lg transition-all cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-border animate-in fade-in-0 slide-in-from-left-5 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => window.open(article.url, '_blank')}
                      >
                        {article.image_url && (
                          <div className="relative w-full h-32 bg-muted overflow-hidden">
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                              {article.title}
                            </h3>
                            <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                          </div>
                          
                          {article.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {article.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {article.category}
                            </Badge>
                            {article.symbols && article.symbols.length > 0 && (
                              <div className="flex items-center gap-1">
                                {article.symbols.slice(0, 3).map((symbol) => (
                                  <Badge key={symbol} variant="outline" className="text-xs">
                                    {symbol}
                                  </Badge>
                                ))}
                                {article.symbols.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{article.symbols.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(article.published_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span>{article.source}</span>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  )
}
