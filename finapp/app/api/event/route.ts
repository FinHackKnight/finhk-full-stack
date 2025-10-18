import { NextRequest, NextResponse } from 'next/server';
import { marketAuxService, NewsQueryParams } from '@/lib/marketaux-news';
import { generateContent } from '@/lib/gemini';

// Cache GET responses for 60 seconds at the framework level
export const revalidate = 60;

// Simple in-memory cache (per server instance)
type CacheEntry<T> = { value: T; expiresAt: number };
const memoryCache = new Map<string, CacheEntry<any>>();
function getCache<T>(key: string): T | undefined {
  const entry = memoryCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return undefined;
  }
  return entry.value as T;
}
function setCache<T>(key: string, value: T, ttlMs: number) {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

// Utility: only send essential fields to the LLM to reduce tokens
function pickEssentialArticleFields(news: any[]) {
  return news.map((n) => ({
    id: n.id ?? n.uuid ?? n.url,
    title: n.title,
    description: n.description ?? n.snippet ?? n.summary,
    url: n.url,
    image_url: n.image_url ?? n.imageUrl ?? n.main_image,
    published_at: n.published_at ?? n.publishedAt,
    source: n.source ?? n.source_domain,
    entities: n.entities?.map((e: any) => ({ type: e.type, name: e.name, ticker: e.symbol ?? e.ticker })),
    country: n.country,
    exchange: n.exchange,
    symbols: n.symbols,
  }));
}

// Event interface
interface Event {
  Event_title: string;
  Event_img: string;
  Event_longtitude: number;
  event_latitude: number;
  event_summary: string;
  event_category: string;
  Article_link: string;
  impact_score: number;
  Impact_reason: string;
  impact_color: 'green' | 'yellow' | 'red';
  Relevant_stocks: Array<{ ticker: string; name: string }>;
  event_date: string; // ISO 8601 date/datetime
}

// GET events with sentiment filtering and Gemini processing
export async function GET(request: NextRequest) {
  try {
    const t0 = Date.now();
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const symbols = searchParams.get('symbols')?.split(',').filter(Boolean);
    const exchanges = searchParams.get('exchanges')?.split(',').filter(Boolean);
    const countries = searchParams.get('countries')?.split(',').filter(Boolean);
    const must_have_entities = searchParams.get('must_have_entities') === 'true';
    const published_after = searchParams.get('published_after');
    const published_before = searchParams.get('published_before');

    // How many articles to send to Gemini (reduces prompt size)
    const llm_limit = parseInt(searchParams.get('llm_limit') || '8');

    // Build query parameters for MarketAux
    const queryParams: NewsQueryParams = {
      limit,
      page,
      sort: 'published_desc',
      languages: ['en'],
      must_have_entities,
    };

    // Add optional filters
    if (symbols?.length) queryParams.symbols = symbols;
    if (exchanges?.length) queryParams.exchanges = exchanges;
    if (countries?.length) queryParams.countries = countries;
    if (published_after) queryParams.published_after = published_after;
    if (published_before) queryParams.published_before = published_before;

    // Cache key includes query + llm_limit
    const cacheKey = `events:get:${JSON.stringify({ queryParams, llm_limit })}`;
    const cached = getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
      });
    }

    // Fetch news from MarketAux
    const news = await marketAuxService.fetchNews(queryParams);
    const t1 = Date.now();

    if (news.length === 0) {
      const payload = {
        success: true,
        data: [],
        meta: {
          found: 0,
          returned: 0,
          limit,
          page,
          source: 'marketaux + gemini',
          message: 'No articles found',
          timings_ms: { total: Date.now() - t0, marketaux: t1 - t0, gemini: 0 },
        },
      };
      setCache(cacheKey, payload, 60_000);
      return NextResponse.json(payload, {
        headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
      });
    }

    // Send a trimmed set of fields and cap items for LLM
    const forLLM = pickEssentialArticleFields(news).slice(0, Math.max(1, llm_limit));

    // Prepare the Gemini prompt
    const prompt = `You are a financial news analyst. Analyze the following news articles and convert them into structured event data.

IMPORTANT: 
- Only include articles that have POSITIVE or NEGATIVE sentiment/impact on markets or companies. Skip neutral or informational news.
- Only include events where ALL fields can be populated with real data (no null values allowed).
- Skip any article if you cannot determine the location coordinates, image URL, article link, or relevant stock tickers.
- All events must have at least one relevant stock with a valid ticker.

IMPACT SCORING (0–100) + COLOR
- 0–9   = negligible  → "green"
- 10–29 = minor/local → "green"
- 30–49 = moderate    → "yellow"
- 50–69 = material    → "yellow"
- 70–89 = major/broad → "red"
- 90–100= systemic    → "red"

SCORING EXPLANATION (for Impact_reason)
Write 2–3 short sentences in plain English describing:
- Who or what is affected (individual company, industry, or multiple markets)
- How certain or official the news is
- When the effects will happen (now or later)
- How big the change or consequence is
Avoid technical or investor jargon; keep it clear and factual.

LOCATION
- Use the city or country most connected to the event (where it occurs or where the company/government is based).
- Return the coordinates (Event_longtitude, event_latitude) if known or easily inferred; otherwise use null.

DATE
- Set event_date to a realistic ISO 8601 date or datetime for the event; if unclear, default to the article's published date.

INPUT ARTICLES (trimmed):
${JSON.stringify(forLLM, null, 2)}

OUTPUT FORMAT:
Return ONLY a valid JSON array conforming to this schema (ALL fields are required, no nulls):
[
  {
    "Event_title": "string (required)",
    "Event_img": "string (required, must be a valid image URL)",
    "Event_longtitude": number (required, must be a valid longitude),
    "event_latitude": number (required, must be a valid latitude),
    "event_summary": "string (required)",
    "event_category": "string (required)",
    "Article_link": "string (required, must be a valid URL)",
    "impact_score": number (required, 0-100),
    "Impact_reason": "string (required)",
    "impact_color": "green" | "yellow" | "red" (required),
    "Relevant_stocks": [ { "ticker": "string (required)", "name": "string (required)" } ] (required, at least one stock),
    "event_date": "string (ISO 8601, required)"
  }
]

Return only the JSON array, no markdown formatting or additional text.`;

    // Call Gemini to process the articles
    const geminiResponse = await generateContent(prompt);
    const t2 = Date.now();

    // Parse the Gemini response
    let events: Event[];
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = geminiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      events = JSON.parse(cleanedResponse);
      
      // Validate that it's an array
      if (!Array.isArray(events)) {
        throw new Error('Response is not an array');
      }
      
      // Filter out events with null values
      events = events.filter(event => (
        event.Event_title != null &&
        event.Event_img != null &&
        event.Event_longtitude != null &&
        event.event_latitude != null &&
        event.event_summary != null &&
        event.event_category != null &&
        event.Article_link != null &&
        event.impact_score != null &&
        event.Impact_reason != null &&
        event.impact_color != null &&
        event.Relevant_stocks != null &&
        event.Relevant_stocks.length > 0 &&
        event.Relevant_stocks.every(stock => stock.ticker != null && stock.name != null) &&
        event.event_date != null
      ));
    } catch (parseError: any) {
      console.error('Failed to parse Gemini response:', geminiResponse);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response',
          details: parseError.message,
          rawResponse: geminiResponse.substring(0, 500), // Include first 500 chars for debugging
        },
        { status: 500 }
      );
    }

    const payload = {
      success: true,
      data: events,
      meta: {
        found: events.length,
        returned: events.length,
        articlesProcessed: news.length,
        llm_articles_used: forLLM.length,
        limit,
        page,
        source: 'marketaux + gemini',
        filters: {
          sentiment: ['positive', 'negative'],
          symbols,
          exchanges,
          countries,
          must_have_entities,
        },
        timings_ms: {
          total: Date.now() - t0,
          marketaux: t1 - t0,
          gemini: t2 - t1,
        },
      },
    };

    // Cache and return with CDN headers
    setCache(cacheKey, payload, 60_000);
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error: any) {
    console.error('Event API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error while processing events',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST method for complex event queries
export async function POST(request: NextRequest) {
  try {
    const t0 = Date.now();
    const body = await request.json();
    const {
      limit = 20,
      page = 1,
      symbols,
      exchanges,
      entity_types,
      countries,
      min_match_score,
      must_have_entities = false,
      published_after,
      published_before,
      filter_entities = true,
      llm_limit = 8,
    } = body || {};

    // Build query parameters
    const queryParams: NewsQueryParams = {
      limit,
      page,
      sort: 'published_desc',
      languages: ['en'],
      must_have_entities,
      filter_entities,
    };

    // Add optional filters
    if (symbols?.length) queryParams.symbols = symbols;
    if (exchanges?.length) queryParams.exchanges = exchanges;
    if (entity_types?.length) queryParams.entity_types = entity_types;
    if (countries?.length) queryParams.countries = countries;
    if (min_match_score !== undefined) queryParams.min_match_score = min_match_score;
    if (published_after) queryParams.published_after = published_after;
    if (published_before) queryParams.published_before = published_before;

    // Cache POST by body query
    const cacheKey = `events:post:${JSON.stringify({ queryParams, llm_limit })}`;
    const cached = getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
      });
    }

    // Fetch news from MarketAux
    const news = await marketAuxService.fetchNews(queryParams);
    const t1 = Date.now();

    if (news.length === 0) {
      const payload = {
        success: true,
        data: [],
        meta: {
          found: 0,
          returned: 0,
          limit,
          page,
          source: 'marketaux + gemini',
          message: 'No articles found',
          timings_ms: { total: Date.now() - t0, marketaux: t1 - t0, gemini: 0 },
        },
      };
      setCache(cacheKey, payload, 60_000);
      return NextResponse.json(payload, {
        headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
      });
    }

    // Send a trimmed set of fields and cap items for LLM
    const forLLM = pickEssentialArticleFields(news).slice(0, Math.max(1, Number(llm_limit)));

    // Prepare the Gemini prompt
    const prompt = `You are a financial news analyst. Analyze the following news articles and convert them into structured event data.

IMPORTANT: 
- Only include articles that have POSITIVE or NEGATIVE sentiment/impact on markets or companies. Skip neutral or informational news.
- Only include events where ALL fields can be populated with real data (no null values allowed).
- Skip any article if you cannot determine the location coordinates, image URL, article link, or relevant stock tickers.
- All events must have at least one relevant stock with a valid ticker.

IMPACT SCORING (0–100) + COLOR
- 0–9   = negligible  → "green"
- 10–29 = minor/local → "green"
- 30–49 = moderate    → "yellow"
- 50–69 = material    → "yellow"
- 70–89 = major/broad → "red"
- 90–100= systemic    → "red"

SCORING EXPLANATION (for Impact_reason)
Write 2–3 short sentences in plain English describing:
- Who or what is affected (individual company, industry, or multiple markets)
- How certain or official the news is
- When the effects will happen (now or later)
- How big the change or consequence is
Avoid technical or investor jargon; keep it clear and factual.

LOCATION
- Use the city or country most connected to the event (where it occurs or where the company/government is based).
- Return the coordinates (Event_longtitude, event_latitude) if known or easily inferred; otherwise use null.

DATE
- Set event_date to a realistic ISO 8601 date or datetime for the event; if unclear, default to the article's published date.

INPUT ARTICLES (trimmed):
${JSON.stringify(forLLM, null, 2)}

OUTPUT FORMAT:
Return ONLY a valid JSON array conforming to this schema (ALL fields are required, no nulls):
[
  {
    "Event_title": "string (required)",
    "Event_img": "string (required, must be a valid image URL)",
    "Event_longtitude": number (required, must be a valid longitude),
    "event_latitude": number (required, must be a valid latitude),
    "event_summary": "string (required)",
    "event_category": "string (required)",
    "Article_link": "string (required, must be a valid URL)",
    "impact_score": number (required, 0-100),
    "Impact_reason": "string (required)",
    "impact_color": "green" | "yellow" | "red" (required),
    "Relevant_stocks": [ { "ticker": "string (required)", "name": "string (required)" } ] (required, at least one stock),
    "event_date": "string (ISO 8601, required)"
  }
]

Return only the JSON array, no markdown formatting or additional text.`;

    // Call Gemini to process the articles
    const geminiResponse = await generateContent(prompt);
    const t2 = Date.now();

    // Parse the Gemini response
    let events: Event[];
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = geminiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      events = JSON.parse(cleanedResponse);
      
      // Validate that it's an array
      if (!Array.isArray(events)) {
        throw new Error('Response is not an array');
      }
      
      // Filter out events with null values
      events = events.filter(event => (
        event.Event_title != null &&
        event.Event_img != null &&
        event.Event_longtitude != null &&
        event.event_latitude != null &&
        event.event_summary != null &&
        event.event_category != null &&
        event.Article_link != null &&
        event.impact_score != null &&
        event.Impact_reason != null &&
        event.impact_color != null &&
        event.Relevant_stocks != null &&
        event.Relevant_stocks.length > 0 &&
        event.Relevant_stocks.every(stock => stock.ticker != null && stock.name != null) &&
        event.event_date != null
      ));
    } catch (parseError: any) {
      console.error('Failed to parse Gemini response:', geminiResponse);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response',
          details: parseError.message,
          rawResponse: geminiResponse.substring(0, 500),
        },
        { status: 500 }
      );
    }

    const payload = {
      success: true,
      data: events,
      meta: {
        found: events.length,
        returned: events.length,
        articlesProcessed: news.length,
        llm_articles_used: forLLM.length,
        limit,
        page,
        source: 'marketaux + gemini',
        filters: {
          sentiment: ['positive', 'negative'],
          ...queryParams,
        },
        timings_ms: {
          total: Date.now() - t0,
          marketaux: t1 - t0,
          gemini: t2 - t1,
        },
      },
    };

    setCache(cacheKey, payload, 60_000);
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error: any) {
    console.error('Event POST error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error while processing events',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
