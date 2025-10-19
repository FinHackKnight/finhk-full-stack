"use client";

import { useState, useEffect, useCallback } from "react";
import type { NewsItem } from "@/lib/marketaux-news";

interface NewsResponse {
  success: boolean;
  data: NewsItem[];
  meta: {
    found: number;
    returned: number;
    limit: number;
    source?: string;
  };
}

interface UseNewsReturn {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface CachedNewsData {
  data: NewsItem[];
  timestamp: number;
  limit: number;
}

const CACHE_KEY = "finapp_marketaux_news_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useNews(limit: number = 10): UseNewsReturn {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get cached data from localStorage
  const getCachedNews = useCallback(
    (requestedLimit: number): NewsItem[] | null => {
      if (typeof window === "undefined") return null;

      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const parsedCache: CachedNewsData = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is expired
        if (now - parsedCache.timestamp > CACHE_DURATION) {
          localStorage.removeItem(CACHE_KEY);
          return null;
        }

        // Check if we have enough cached items for the requested limit
        if (parsedCache.data.length >= requestedLimit) {
          return parsedCache.data.slice(0, requestedLimit);
        }

        return null;
      } catch (err) {
        console.warn("Error reading MarketAux news cache:", err);
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
    },
    []
  );

  // Function to cache data to localStorage
  const setCachedNews = useCallback(
    (newsData: NewsItem[], requestedLimit: number) => {
      if (typeof window === "undefined") return;

      try {
        const cacheData: CachedNewsData = {
          data: newsData,
          timestamp: Date.now(),
          limit: requestedLimit,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (err) {
        console.warn("Error caching MarketAux news data:", err);
      }
    },
    []
  );

  const fetchNews = useCallback(
    async (forceRefetch = false) => {
      try {
        setLoading(true);
        setError(null);

        // Try to get cached data first (unless force refetch)
        if (!forceRefetch) {
          const cachedNews = getCachedNews(limit);
          if (cachedNews) {
            setNews(cachedNews);
            setLoading(false);
            return;
          }
        }

        // Ensure sensible defaults for MarketAux
        const response = await fetch(
          `/api/news?limit=${limit}&must_have_entities=false&sort=published_desc`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch news: ${response.status} ${response.statusText}`
          );
        }

        const data: NewsResponse = await response.json();

        if (data.success) {
          const newsData = data.data || [];
          setNews(newsData);
          // Cache the fetched data
          setCachedNews(newsData, limit);
        } else {
          throw new Error("Failed to fetch news data");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching MarketAux news:", err);
      } finally {
        setLoading(false);
      }
    },
    [limit, getCachedNews, setCachedNews]
  );

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const refetch = useCallback(() => {
    return fetchNews(true); // Force refetch, bypass cache
  }, [fetchNews]);

  return {
    news,
    loading,
    error,
    refetch,
  };
}
