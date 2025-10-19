"use client"

import { useState, useEffect, useCallback } from 'react'
import type { EventWithMarkets } from '@/lib/mock-data'

export type APIEvent = {
  Event_title: string
  Event_img: string
  Event_longitude: number
  event_latitude: number
  event_country: string
  event_summary: string
  event_category: string
  Article_link: string
  impact_score: number
  Impact_reason: string
  impact_color: string
  Relevant_stocks: Array<{ ticker: string | null; name: string }>
  event_date: string
}

interface CachedEventsData {
  data: EventWithMarkets[];
  timestamp: number;
}

interface UseEventsReturn {
  events: EventWithMarkets[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseEventsOptions {
  date?: Date;
    limit?: number;
  llm_limit?: number;
}

const CACHE_KEY = 'finapp_events_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export function useEvents(options?: UseEventsOptions): UseEventsReturn {
  const [events, setEvents] = useState<EventWithMarkets[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const selectedDate = options?.date;

  // Function to get cached data from localStorage
  const getCachedEvents = useCallback((): EventWithMarkets[] | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsedCache: CachedEventsData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - parsedCache.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return parsedCache.data;
    } catch (err) {
      console.warn('Error reading events cache:', err);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  // Function to cache data to localStorage
  const setCachedEvents = useCallback((eventsData: EventWithMarkets[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData: CachedEventsData = {
        data: eventsData,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.warn('Error caching events data:', err);
    }
  }, []);

  const fetchEvents = useCallback(async (forceRefetch = false) => {
    try {
      setLoading(true);
      setError(null);

      // Build API URL - use Time Machine endpoint for historical dates
      let apiUrl = '/api/event';
      if (selectedDate) {
        const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        apiUrl = `/api/time-machine?date=${dateStr}`;
        console.log(`🕰️  Time Machine: Fetching events for date: ${dateStr}`);
      }

      // Try to get cached data first (unless force refetch or date is selected)
      if (!forceRefetch && !selectedDate) {
        const cachedEvents = getCachedEvents();
        if (cachedEvents && cachedEvents.length > 0) {
          console.log('Using cached events data');
          setEvents(cachedEvents);
          setLoading(false);
          return;
        }
      }

      console.log('Fetching fresh events data from API');
      const response = await fetch(apiUrl)
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`)
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
              country: e.event_country || 'Unknown'
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
      
      // Cache the fetched data only if no date filter
      if (!selectedDate) {
        setCachedEvents(transformedEvents);
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }, [getCachedEvents, setCachedEvents, selectedDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const refetch = useCallback(() => {
    return fetchEvents(true); // Force refetch, bypass cache
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch,
  }
}
