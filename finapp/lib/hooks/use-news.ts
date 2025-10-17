'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  uuid: string;
  title: string;
  description: string;
  url: string;
  published_at: string;
  source: string;
  symbols?: string[];
  sentiment?: string;
  image_url?: string;
}

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

      // Try the real API first
      let response = await fetch(`/api/news?limit=${limit}&language=en`);
      
      // If unauthorized or API key issues, fall back to mock data
      if (response.status === 401 || response.status === 500) {
        console.warn('Real API failed, falling back to mock data');
        response = await fetch(`/api/news/mock?limit=${limit}`);
      }
      
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
