"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ApiEvent = {
  Event_title: string;
  Event_img: string;
  Event_longtitude: number;
  event_latitude: number;
  event_summary: string;
  event_category: string;
  Article_link: string;
  impact_score: number;
  Impact_reason: string;
  impact_color: "green" | "yellow" | "red";
  Relevant_stocks: Array<{ ticker: string; name: string }>;
  event_date: string; // ISO 8601
};

export type EventsResponse = {
  success: boolean;
  data: ApiEvent[];
  meta?: any;
  error?: string;
};

export type UseEventsOptions = {
  limit?: number;
  llm_limit?: number;
  query?: Record<string, string | number | boolean | undefined>;
  enabled?: boolean;
};

export function useEvents(options: UseEventsOptions = {}) {
  const { limit = 20, llm_limit = 5, query = {}, enabled = true } = options;
  const [data, setData] = useState<ApiEvent[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("llm_limit", String(llm_limit));
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.set(k, String(v));
    });
    return `/api/event?${params.toString()}`;
  }, [limit, llm_limit, JSON.stringify(query)]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json: EventsResponse = await res.json();
        if (!json.success) throw new Error(json.error || "Unknown error");
        setData(json.data ?? []);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err.message || "Failed to load events");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [url, enabled]);

  return { events: data, loading, error } as const;
}
