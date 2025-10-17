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
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function MapView() {
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedEvent, setSelectedEvent] = useState<EventWithMarkets | null>(null)

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
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
