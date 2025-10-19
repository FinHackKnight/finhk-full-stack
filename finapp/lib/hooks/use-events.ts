"use client"

import { useState, useEffect } from 'react'
import type { EventWithMarkets } from '@/lib/mock-data'

type APIEvent = {
  Event_title: string
  Event_img: string
  Event_longitude: number
  event_latitude: number
  event_summary: string
  event_category: string
  Article_link: string
  impact_score: number
  Impact_reason: string
  impact_color: string
  Relevant_stocks: Array<{ ticker: string | null; name: string }>
  event_date: string
}

export function useEvents() {
  const [events, setEvents] = useState<EventWithMarkets[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/event')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const rawEvents = await response.json() as APIEvent[]
        console.log('API Response:', rawEvents)
        
        if (!Array.isArray(rawEvents)) {
          throw new Error('Expected array of events from API')
        }
        
        // Transform the API response to match EventWithMarkets structure
        const transformedEvents: EventWithMarkets[] = rawEvents
          .filter(e => e && e.Event_title) // Filter out invalid events
          .map(e => {
            // Determine impact level based on color
            let impactLevel: "high" | "medium" | "low"
            if (e.impact_color === 'red') impactLevel = "high"
            else if (e.impact_color === 'yellow') impactLevel = "medium"
            else impactLevel = "low"

            // Map stock data
            const stockData = e.Relevant_stocks?.map(stock => ({
              symbol: stock.ticker || 'UNKNOWN',
              name: stock.name,
              changePercent: 0
            })) || []

            return {
              id: Math.random().toString(36).substring(7),
              title: e.Event_title,
              type: (e.event_category || "economic").toLowerCase() as "political" | "economic" | "environmental" | "tech" | "finance" | "climate",
              location: {
                lat: e.event_latitude,
                lng: e.Event_longitude,
                country: 'Unknown'
              },
              impact: e.impact_score,
              date: e.event_date,
              description: e.event_summary,
              articles: [{
                title: e.Event_title,
                source: new URL(e.Article_link || 'https://example.com').hostname,
                url: e.Article_link || '#'
              }],
              impactLevel,
              affectedMarkets: stockData,
              imageUrl: e.Event_img,
              detailedDescription: e.event_summary,
              impactReason: e.Impact_reason,
              relevantStocks: stockData
            }
          })
        
        console.log('Transformed Events:', transformedEvents)
        setEvents(transformedEvents)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return {
    events,
    loading,
    error,
  }
}