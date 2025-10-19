"use client";

import { useEffect } from "react";
import { X, Calendar, ExternalLink, Clock, Newspaper, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useRSSFeeds, type RSSFeedItem } from "@/lib/hooks/use-rss-feeds";

interface TimeMachineModalProps {
  selectedDate: Date | null;
  onClose: () => void;
}

export function TimeMachineModal({ selectedDate, onClose }: TimeMachineModalProps) {
  const { items, loading, error, fetchByDate } = useRSSFeeds();

  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      fetchByDate(dateStr);
    }
  }, [selectedDate, fetchByDate]);

  if (!selectedDate) return null;

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const handleRefresh = () => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      fetchByDate(dateStr);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-300">
      <Card className="w-full max-w-4xl h-[80vh] m-4 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Time Machine</h2>
              <p className="text-sm text-muted-foreground">
                {formatDisplayDate(selectedDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {loading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="w-12 h-12 animate-spin mb-4 text-primary" />
              <p className="text-lg font-medium">Traveling through time...</p>
              <p className="text-sm">Loading news from {formatDisplayDate(selectedDate)}</p>
            </div>
          ) : error ? (
            <Card className="p-6 bg-destructive/10 border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Failed to load news</h3>
                  <p className="text-sm text-destructive/90">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="mt-3"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Newspaper className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No news found</p>
              <p className="text-sm">There are no articles available for {formatDisplayDate(selectedDate)}</p>
              <p className="text-xs mt-2">Try selecting a different date</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Found {items.length} {items.length === 1 ? 'article' : 'articles'}
                </p>
                <div className="flex items-center gap-2">
                  {Array.from(new Set(items.map(item => item.source))).map(source => (
                    <Badge key={source} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>

              {items.map((item, index) => (
                <Card
                  key={item.guid || index}
                  className="p-4 hover:shadow-md transition-all cursor-pointer bg-card/50 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-5 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => window.open(item.link, '_blank')}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
                        {item.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    </div>

                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description.replace(/<[^>]*>/g, '')}
                      </p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {item.source}
                      </Badge>
                      {item.category && (
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(item.pubDate)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t shrink-0 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Click any article to read more
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
