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
import { Search, ExternalLink, Clock, TrendingUp, AlertCircle, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

export function MapView() {
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedEvent, setSelectedEvent] = useState<EventWithMarkets | null>(null)
  const [showNews, setShowNews] = useState(false)

  const { events } = useEvents()
  const { news, loading: newsLoading, refetch } = useNews(20)

  // Filter events
  const filteredEvents = (events || []).filter(
    (event): event is EventWithMarkets => {
      if (!event || typeof event !== "object") return false
      const matchesSearch = searchQuery.trim() === "" || (event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesCategory = selectedCategories.length === 0 || (event.type ? selectedCategories.includes(event.type) : false)
      const matchesDate = !selectedDate || (event.date ? new Date(event.date).toDateString() === selectedDate.toDateString() : false)
      return matchesSearch && matchesCategory && matchesDate
    }
  )

  const hoveredEvent = hoveredEventId ? filteredEvents.find((e) => e.id === hoveredEventId) || null : null
  const handleEventClick = (event: EventWithMarkets) => setSelectedEvent(event)
  const handleCloseModal = () => setSelectedEvent(null)

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
        {/* Drag handle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute right-0 top-0 h-full w-2 cursor-col-resize z-20 bg-muted/30 hover:bg-muted/50 rounded-l"
        />

        {selectedEvent ? (
          <EventDetailModal event={selectedEvent} onClose={handleCloseModal} />
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
              ) : null}

            </div>

            <ScrollArea className="flex-1 p-4">
              {!showNews ? (
                <div className="space-y-3">
                  {filteredEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="animate-in fade-in-0 slide-in-from-left-5 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <EventCard event={event} onHover={setHoveredEventId} onClick={handleEventClick} />
                    </div>
                  ))}
                </div>
              ) : null}
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  )
}
