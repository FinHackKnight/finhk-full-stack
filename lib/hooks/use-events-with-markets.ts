"use client";

import { useMemo } from "react";
import { useEvents, type APIEvent as ApiEvent } from "@/lib/hooks/use-events";
import type { EventWithMarkets } from "@/lib/mock-data";

function mapCategoryToType(category?: string): EventWithMarkets["type"] {
  const c = (category || "").toLowerCase();
  if (/politic|election|policy|government|sanction|diplomatic/.test(c)) return "political";
  if (/climate|emission|carbon|environment|wildfire|flood/.test(c)) return "climate";
  if (/renewable|solar|green|environment/.test(c)) return "environmental";
  if (/tech|ai|semiconductor|chip|software/.test(c)) return "tech";
  if (/finance|bank|credit|central bank|interest|rate|bond|equity|market/.test(c)) return "finance";
  return "economic";
}

function impactLevelFromScore(score: number): EventWithMarkets["impactLevel"] {
  if (score >= 8) return "high";
  if (score >= 4) return "medium";
  return "low";
}

function inferCountry(e: ApiEvent): string {
  // Try to infer a country from category or summary if not provided; fallback to empty
  const text = `${e.event_summary || ''} ${e.event_category || ''}`.toLowerCase()
  if (/usa|u\.s\.|united states|america|us\b/.test(text)) return "USA"
  if (/uk\b|britain|england/.test(text)) return "UK"
  if (/europe|eu\b/.test(text)) return "Europe"
  if (/china|prc|beijing/.test(text)) return "China"
  if (/india|new delhi/.test(text)) return "India"
  if (/japan|tokyo/.test(text)) return "Japan"
  return ""
}

function toEventWithMarkets(e: ApiEvent, index: number): EventWithMarkets {
  // impact_score is already on a 1-10 scale from the API
  const impact10 = Math.max(1, Math.min(10, Math.round(e.impact_score || 1)));
  const impactLevel = impactLevelFromScore(e.impact_score || 1);

  return {
    id: `${index}-${e.Event_title?.slice(0, 24) || "event"}`,
    title: e.Event_title,
    type: mapCategoryToType(e.event_category),
    location: {
      lat: Number(e.event_latitude) || 0,
      lng: Number(e.Event_longitude) || 0,
      country: inferCountry(e) || "",
    },
    impact: impact10,
    impactLevel,
    date: e.event_date || new Date().toISOString(),
    description: e.event_summary,
    detailedDescription: e.Impact_reason || e.event_summary,
    impactReason: e.Impact_reason || "",
    imageUrl: e.Event_img || undefined,
    articles: [
      { title: e.Event_title, source: "", url: e.Article_link },
    ],
    relevantStocks: (e.Relevant_stocks || []).map((s:any) => ({
      symbol: s.ticker,
      name: s.name,
      changePercent: 0,
    })),
    affectedMarkets: (e.Relevant_stocks || []).slice(0, 4).map((s:any) => ({
      symbol: s.ticker,
      name: s.name,
      changePercent: 0,
    })),
  };
}

export function useEventsWithMarkets(limit = 20, llm_limit = 5) {
  const { events, loading, error, refetch } = useEvents({ limit, llm_limit });

  // Optional: slice to limit number of events
  const mapped = useMemo(() => {
    if (!events) return [];
    return events.slice(0, limit); // already EventWithMarkets[]
  }, [events, limit]);

  return { events: mapped, loading, error, refetch } as const;
}

