import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

// RSS Feed URLs
const RSS_FEEDS = {
  bloomberg: "https://www.bloomberg.com/feed/podcast/technology.xml",
  yahooFinance: "https://finance.yahoo.com/news/rssindex",
  bloombergMarkets: "https://www.bloomberg.com/politics/feeds/site.xml",
  bloombergTech: "https://www.bloomberg.com/technology/feed/",
};

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category?: string;
  guid?: string;
}

// Parse RSS feed
async function fetchAndParseRSS(url: string, sourceName: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FinApp/1.0)',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.warn(`Failed to fetch RSS from ${sourceName}: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    const parsed = await parseStringPromise(xmlText);

    const items: RSSItem[] = [];
    
    // Handle different RSS formats
    const channel = parsed.rss?.channel?.[0] || parsed.feed;
    const entries = channel?.item || channel?.entry || [];

    for (const item of entries.slice(0, 50)) { // Limit to 50 items per feed
      try {
        const title = item.title?.[0]?._ || item.title?.[0] || '';
        const description = item.description?.[0]?._ || item.description?.[0] || 
                          item.summary?.[0]?._ || item.summary?.[0] || '';
        
        // Handle different link formats
        let link = '';
        if (item.link) {
          if (Array.isArray(item.link)) {
            // Handle array format
            const linkItem = item.link[0];
            if (typeof linkItem === 'string') {
              link = linkItem;
            } else if (linkItem?.$ && linkItem.$.href) {
              link = linkItem.$.href;
            } else if (linkItem?._) {
              link = linkItem._;
            }
          } else if (typeof item.link === 'string') {
            link = item.link;
          }
        }
        
        const pubDate = item.pubDate?.[0] || item.published?.[0] || item.updated?.[0] || '';
        const guid = item.guid?.[0]?._ || item.guid?.[0] || item.id?.[0] || '';
        
        // Extract category if available
        const category = item.category?.[0]?._ || item.category?.[0] || '';

        if (title && link) {
          items.push({
            title: typeof title === 'string' ? title : String(title),
            description: typeof description === 'string' ? description : String(description),
            link: typeof link === 'string' ? link : String(link),
            pubDate: typeof pubDate === 'string' ? pubDate : String(pubDate),
            source: sourceName,
            category: typeof category === 'string' ? category : '',
            guid: typeof guid === 'string' ? guid : String(guid),
          });
        }
      } catch (itemError) {
        // Silently skip items that can't be parsed
        continue;
      }
    }

    return items;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${sourceName}:`, error);
    return [];
  }
}

// Filter items by date
function filterByDate(items: RSSItem[], targetDate?: string): RSSItem[] {
  if (!targetDate) return items;

  try {
    // Parse target date (YYYY-MM-DD format)
    const target = new Date(targetDate + 'T00:00:00Z');
    const targetFormatted = formatDate(target);

    return items.filter(item => {
      try {
        const itemDate = new Date(item.pubDate);
        const itemFormatted = formatDate(itemDate);
        return itemFormatted === targetFormatted;
      } catch {
        return false;
      }
    });
  } catch {
    return items;
  }
}

// Format date to YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Expected format: YYYY-MM-DD
    const source = searchParams.get('source'); // Optional: specific source filter

    console.log(`📰 Fetching RSS feeds for date: ${date || 'all'}`);

    // Fetch all RSS feeds in parallel
    const feedPromises = [
      fetchAndParseRSS(RSS_FEEDS.yahooFinance, 'Yahoo Finance'),
      // Bloomberg feeds may require authentication or have CORS issues
      // fetchAndParseRSS(RSS_FEEDS.bloombergMarkets, 'Bloomberg Markets'),
      // fetchAndParseRSS(RSS_FEEDS.bloombergTech, 'Bloomberg Technology'),
    ];

    const results = await Promise.allSettled(feedPromises);
    
    // Combine all successful results
    let allItems: RSSItem[] = [];
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allItems = allItems.concat(result.value);
      }
    });

    // Filter by source if specified
    if (source) {
      allItems = allItems.filter(item => 
        item.source.toLowerCase().includes(source.toLowerCase())
      );
    }

    // Filter by date if specified
    if (date) {
      allItems = filterByDate(allItems, date);
    }

    // Sort by date (newest first)
    allItems.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });

    // Format dates in response
    const formattedItems = allItems.map(item => ({
      ...item,
      pubDate: item.pubDate,
      formattedDate: formatDate(new Date(item.pubDate)),
    }));

    console.log(`✅ Found ${formattedItems.length} RSS items`);

    return NextResponse.json({
      success: true,
      count: formattedItems.length,
      date: date || 'all',
      items: formattedItems,
    });

  } catch (error) {
    console.error('❌ Error in RSS feed route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch RSS feeds',
        items: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
