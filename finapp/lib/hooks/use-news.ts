'use client';

import { useState, useEffect } from 'react';
import type { NewsItem } from '@/lib/news-aggregation';

interface NewsResponse {
  success: boolean;
  data: NewsItem[];
  meta: {
    found: number;
    returned: number;
    limit: number;
    offset: number;
  };
}

interface UseNewsReturn {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNews(limit: number = 10): UseNewsReturn {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/news?limit=${limit}&language=en`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }

      const data: NewsResponse = await response.json();
      
      if (data.success) {
        setNews(data.data || []);
      } else {
        throw new Error('Failed to fetch news data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [limit]);

  return {
    news,
    loading,
    error,
    refetch: fetchNews,
  };
}
