'use client';

import { useState, useCallback } from 'react';

export interface RSSFeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  formattedDate: string;
  source: string;
  category?: string;
  guid?: string;
}

interface RSSFeedResponse {
  success: boolean;
  count: number;
  date: string;
  items: RSSFeedItem[];
}

interface UseRSSFeedsReturn {
  items: RSSFeedItem[];
  loading: boolean;
  error: string | null;
  fetchByDate: (date: string) => Promise<void>;
}

export function useRSSFeeds(): UseRSSFeedsReturn {
  const [items, setItems] = useState<RSSFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByDate = useCallback(async (date: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/rss-feeds?date=${date}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feeds: ${response.status}`);
      }

      const data: RSSFeedResponse = await response.json();
      
      if (data.success) {
        setItems(data.items);
      } else {
        throw new Error('Failed to fetch RSS feeds');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching RSS feeds:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    loading,
    error,
    fetchByDate,
  };
}
