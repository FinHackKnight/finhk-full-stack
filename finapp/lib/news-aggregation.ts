// News aggregation service using RSS2JSON, Reddit, and Hacker News APIs

const RSS2JSON_API_KEY = process.env.RSS2JSON_API_KEY;
const RSS2JSON_API_BASE_URL = process.env.RSS2JSON_API_BASE_URL || 'https://api.rss2json.com/v1/api.json';
const REDDIT_API_BASE_URL = process.env.REDDIT_API_BASE_URL || 'https://www.reddit.com';
const HACKERNEWS_API_BASE_URL = process.env.HACKERNEWS_API_BASE_URL || 'https://hacker-news.firebaseio.com/v0';

// RSS Feeds Configuration
const RSS_FEEDS = {
  yahoo: 'https://feeds.finance.yahoo.com/rss/2.0/headline',
  marketwatch: 'https://feeds.marketwatch.com/marketwatch/topstories/',
  bloomberg: 'https://feeds.bloomberg.com/markets/news.rss',
  // Additional feeds
  cnbc: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069',
  reuters: 'https://news.yahoo.com/rss/business',
  wsj: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml'
};

// Reddit subreddits for financial news
const REDDIT_SUBREDDITS = [
  'stocks',
  'investing', 
  'SecurityAnalysis',
  'ValueInvesting',
  'StockMarket',
  'finance'
];

// Unified news item interface
export interface NewsItem {
  uuid: string;
  title: string;
  description: string;
  url: string;
  published_at: string;
  source: string;
  category: string;
  sentiment?: string;
  symbols?: string[];
  image_url?: string;
}

// RSS2JSON API Service
class RSS2JSONService {
  async fetchRSSFeed(feedUrl: string, count: number = 10): Promise<NewsItem[]> {
    try {
      const apiUrl = new URL(RSS2JSON_API_BASE_URL);
      apiUrl.searchParams.append('rss_url', feedUrl);
      if (RSS2JSON_API_KEY) {
        apiUrl.searchParams.append('api_key', RSS2JSON_API_KEY);
      }
      apiUrl.searchParams.append('count', count.toString());

      const response = await fetch(apiUrl.toString());
      if (!response.ok) {
        throw new Error(`RSS2JSON API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`RSS2JSON error: ${data.message || 'Unknown error'}`);
      }

      return data.items.map((item: any) => ({
        uuid: this.generateUUID(),
        title: item.title || '',
        description: item.description?.replace(/<[^>]*>/g, '') || '', // Strip HTML tags
        url: item.link || '',
        published_at: item.pubDate || new Date().toISOString(),
        source: this.extractSourceFromFeed(feedUrl),
        category: this.categorizeNews(item.title + ' ' + item.description),
        image_url: item.thumbnail || item.enclosure?.link || '',
        symbols: this.extractStockSymbols(item.title + ' ' + item.description)
      }));
    } catch (error) {
      console.error(`Error fetching RSS feed ${feedUrl}:`, error);
      return [];
    }
  }

  private extractSourceFromFeed(feedUrl: string): string {
    if (feedUrl.includes('yahoo')) return 'Yahoo Finance';
    if (feedUrl.includes('marketwatch')) return 'MarketWatch';
    if (feedUrl.includes('bloomberg')) return 'Bloomberg';
    if (feedUrl.includes('cnbc')) return 'CNBC';
    if (feedUrl.includes('reuters')) return 'Reuters';
    if (feedUrl.includes('wsj')) return 'Wall Street Journal';
    return 'RSS Feed';
  }

  private generateUUID(): string {
    return 'rss-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private categorizeNews(content: string): string {
    const text = content.toLowerCase();
    
    if (text.includes('earnings') || text.includes('stock') || text.includes('share')) return 'Stocks';
    if (text.includes('market') || text.includes('trading') || text.includes('dow') || text.includes('s&p')) return 'Market';
    if (text.includes('fed') || text.includes('inflation') || text.includes('gdp') || text.includes('employment')) return 'Economic';
    if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ethereum')) return 'Crypto';
    if (text.includes('oil') || text.includes('gold') || text.includes('commodity')) return 'Commodities';
    if (text.includes('currency') || text.includes('dollar') || text.includes('euro')) return 'Forex';
    
    return 'Financial';
  }

  private extractStockSymbols(content: string): string[] {
    // Simple regex to find potential stock symbols (3-4 uppercase letters)
    const symbolRegex = /\b[A-Z]{2,5}\b/g;
    const matches = content.match(symbolRegex) || [];
    
    // Filter out common words that aren't stock symbols
    const blacklist = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'DAY', 'GET', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE'];
    
    return matches
      .filter(symbol => !blacklist.includes(symbol))
      .slice(0, 3); // Limit to 3 symbols
  }
}

// Reddit API Service
class RedditService {
  async fetchSubredditPosts(subreddit: string, limit: number = 10): Promise<NewsItem[]> {
    try {
      const apiUrl = `${REDDIT_API_BASE_URL}/r/${subreddit}/hot.json?limit=${limit}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'FinApp/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.data.children
        .filter((post: any) => !post.data.is_self || post.data.selftext) // Include link posts and text posts with content
        .map((post: any) => ({
          uuid: 'reddit-' + post.data.id,
          title: post.data.title || '',
          description: post.data.selftext?.substring(0, 200) + '...' || 'Discussion on Reddit',
          url: post.data.url?.startsWith('http') ? post.data.url : `https://reddit.com${post.data.permalink}`,
          published_at: new Date(post.data.created_utc * 1000).toISOString(),
          source: `Reddit r/${subreddit}`,
          category: 'Discussion',
          symbols: this.extractStockSymbols(post.data.title + ' ' + post.data.selftext)
        }));
    } catch (error) {
      console.error(`Error fetching Reddit r/${subreddit}:`, error);
      return [];
    }
  }

  private extractStockSymbols(content: string): string[] {
    if (!content) return [];
    
    // Reddit often uses $SYMBOL format
    const dollarSymbols = content.match(/\$[A-Z]{1,5}/g) || [];
    const normalSymbols = content.match(/\b[A-Z]{2,5}\b/g) || [];
    
    const blacklist = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'DAY', 'GET', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE'];
    
    return [...dollarSymbols.map(s => s.substring(1)), ...normalSymbols]
      .filter(symbol => !blacklist.includes(symbol))
      .slice(0, 3);
  }
}

// Hacker News API Service
class HackerNewsService {
  async fetchTopStories(limit: number = 10): Promise<NewsItem[]> {
    try {
      // Get top story IDs
      const topStoriesResponse = await fetch(`${HACKERNEWS_API_BASE_URL}/topstories.json`);
      if (!topStoriesResponse.ok) {
        throw new Error(`HackerNews API error: ${topStoriesResponse.status}`);
      }
      
      const storyIds = await topStoriesResponse.json();
      const limitedIds = storyIds.slice(0, limit);

      // Fetch individual stories
      const stories = await Promise.all(
        limitedIds.map(async (id: number) => {
          try {
            const storyResponse = await fetch(`${HACKERNEWS_API_BASE_URL}/item/${id}.json`);
            if (!storyResponse.ok) return null;
            return await storyResponse.json();
          } catch (error) {
            console.error(`Error fetching HN story ${id}:`, error);
            return null;
          }
        })
      );

      return stories
        .filter(story => story && story.url && this.isFinanceRelated(story.title))
        .map(story => ({
          uuid: 'hn-' + story.id,
          title: story.title || '',
          description: story.text?.replace(/<[^>]*>/g, '')?.substring(0, 200) + '...' || 'Discussion on Hacker News',
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          published_at: new Date(story.time * 1000).toISOString(),
          source: 'Hacker News',
          category: 'Tech/Finance',
          symbols: []
        }));
    } catch (error) {
      console.error('Error fetching Hacker News stories:', error);
      return [];
    }
  }

  private isFinanceRelated(title: string): boolean {
    const financeKeywords = [
      'stock', 'market', 'trading', 'investment', 'finance', 'money', 'economy',
      'crypto', 'bitcoin', 'startup', 'funding', 'ipo', 'earnings', 'revenue',
      'bank', 'fintech', 'valuation', 'acquisition', 'merger'
    ];
    
    const titleLower = title.toLowerCase();
    return financeKeywords.some(keyword => titleLower.includes(keyword));
  }
}

// Main News Aggregation Service
export class NewsAggregationService {
  private rss2json = new RSS2JSONService();
  private reddit = new RedditService();
  private hackerNews = new HackerNewsService();

  async aggregateNews(options: {
    limit?: number;
    sources?: ('rss' | 'reddit' | 'hackernews')[];
    category?: string;
  } = {}): Promise<NewsItem[]> {
    const { limit = 50, sources = ['rss', 'reddit', 'hackernews'] } = options;
    
    const allNews: NewsItem[] = [];

    try {
      // Fetch from RSS feeds
      if (sources.includes('rss')) {
        const rssPromises = Object.values(RSS_FEEDS).map(feed => 
          this.rss2json.fetchRSSFeed(feed, Math.ceil(limit / Object.keys(RSS_FEEDS).length))
        );
        const rssResults = await Promise.all(rssPromises);
        rssResults.forEach(items => allNews.push(...items));
      }

      // Fetch from Reddit
      if (sources.includes('reddit')) {
        const redditPromises = REDDIT_SUBREDDITS.slice(0, 3).map(subreddit =>
          this.reddit.fetchSubredditPosts(subreddit, Math.ceil(limit / 6))
        );
        const redditResults = await Promise.all(redditPromises);
        redditResults.forEach(items => allNews.push(...items));
      }

      // Fetch from Hacker News
      if (sources.includes('hackernews')) {
        const hnNews = await this.hackerNews.fetchTopStories(Math.ceil(limit / 4));
        allNews.push(...hnNews);
      }

      // Sort by publication date (newest first) and limit results
      const sortedNews = allNews
        .filter(item => item.title && item.url) // Filter out invalid items
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, limit);

      return sortedNews;

    } catch (error) {
      console.error('Error in news aggregation:', error);
      return [];
    }
  }
}

export const newsAggregator = new NewsAggregationService();
