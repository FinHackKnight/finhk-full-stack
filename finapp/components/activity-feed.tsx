"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, TrendingUp, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"
import { useNews } from "@/lib/hooks/use-news"
import type { NewsItem } from "@/lib/marketaux-news"
import { Button } from "@/components/ui/button"

// Helper function to get relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Helper function to get category based on content
function getCategory(title: string, description: string, symbols?: string[]): string {
  const content = (title + ' ' + description).toLowerCase();
  
  if (symbols && symbols.length > 0) return 'Stocks';
  if (content.includes('market') || content.includes('trading')) return 'Market';
  if (content.includes('economic') || content.includes('inflation') || content.includes('gdp')) return 'Economic';
  if (content.includes('political') || content.includes('election') || content.includes('government')) return 'Political';
  if (content.includes('currency') || content.includes('forex') || content.includes('usd') || content.includes('eur')) return 'Forex';
  if (content.includes('commodity') || content.includes('gold') || content.includes('oil')) return 'Commodities';
  if (content.includes('crypto') || content.includes('bitcoin') || content.includes('ethereum')) return 'Crypto';
  
  return 'News';
}

// Helper function to get icon based on category
function getCategoryIcon(category: string) {
  switch (category) {
    case 'Market':
    case 'Stocks':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'Economic':
      return <AlertCircle className="w-4 h-4 text-blue-500" />;
    case 'Political':
      return <AlertCircle className="w-4 h-4 text-purple-500" />;
    case 'Forex':
      return <TrendingUp className="w-4 h-4 text-orange-500" />;
    case 'Commodities':
      return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    case 'Crypto':
      return <TrendingUp className="w-4 h-4 text-orange-500" />;
    default:
      return <Clock className="w-4 h-4 text-primary" />;
  }
}

export function ActivityFeed() {
  const { news, loading, error, refetch } = useNews(15);

  if (error) {
    return (
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Recent Activity</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">Failed to load news</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Recent Activity</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refetch}
          disabled={loading}
          title="Refresh news"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {loading && news.length === 0 ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/30 animate-pulse">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))
          ) : (
            news.map((newsItem) => {
              const category = getCategory(newsItem.title, newsItem.description, newsItem.symbols);
              const relativeTime = getRelativeTime(newsItem.published_at);
              
              return (
                <div
                  key={newsItem.uuid}
                  className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                  onClick={() => window.open(newsItem.url, '_blank')}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {newsItem.title}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{relativeTime}</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{newsItem.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{category}</span>
                      {newsItem.symbols && newsItem.symbols.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          {newsItem.symbols.slice(0, 2).join(', ')}{newsItem.symbols.length > 2 ? '...' : ''}
                        </span>
                      )}
                      {newsItem.sentiment && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          newsItem.sentiment === 'positive' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : newsItem.sentiment === 'negative'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {newsItem.sentiment}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
