// MarketAux News service wrapper

export type SentimentLabel = 'positive' | 'negative' | 'neutral';

export interface NewsItem {
  uuid: string;
  title: string;
  description: string;
  url: string;
  published_at: string;
  source: string;
  category: string;
  sentiment?: SentimentLabel;
  symbols?: string[];
  image_url?: string;
}

export interface NewsQueryParams {
  limit: number;
  page?: number;
  sort?: 'published_desc' | 'published_asc' | 'relevance';
  languages?: string[]; // e.g. ['en']
  symbols?: string[];
  exchanges?: string[];
  countries?: string[];
  entity_types?: string[];
  sentiment?: SentimentLabel;
  min_match_score?: number;
  must_have_entities?: boolean;
  filter_entities?: boolean;
  published_after?: string; // ISO string
  published_before?: string; // ISO string
  // New advanced filters
  search?: string; // e.g. ("earnings"|"guidance"|...)
  industries?: string[]; // e.g. ['Technology','Energy']
  domains?: string[]; // e.g. ['reuters.com','wsj.com']
  group_similar?: boolean;
}

const API_BASE = process.env.MARKETAUX_API_BASE_URL || 'https://api.marketaux.com/v1/news/all';
const API_KEY = process.env.MARKETAUX_API_KEY || process.env.NEXT_PUBLIC_MARKETAUX_API_KEY;

function toComma(val?: string[] | undefined) {
  return val && val.length ? val.join(',') : undefined;
}

function pickCategory(item: any): string {
  // If there are symbols/entities, categorize as Stocks
  if (Array.isArray(item.entities) && item.entities.some((e: any) => e.type === 'equity')) return 'Stocks';
  // Basic keyword check
  const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
  if (text.includes('market') || text.includes('stock') || text.includes('trading')) return 'Market';
  if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ethereum')) return 'Crypto';
  if (text.includes('oil') || text.includes('gold') || text.includes('commodity')) return 'Commodities';
  return 'Financial';
}

function mapNewsItem(raw: any): NewsItem {
  const symbols: string[] = Array.isArray(raw.entities)
    ? raw.entities
        .filter((e: any) => e.symbol || e.code)
        .map((e: any) => e.symbol || e.code)
        .slice(0, 3)
    : [];

  const sentiment: SentimentLabel | undefined =
    (raw.overall_sentiment_label as SentimentLabel) ||
    (raw.sentiment as SentimentLabel) ||
    undefined;

  const sourceName = raw.source || raw.source_name || raw.source_domain || raw.source_title || 'MarketAux';

  return {
    uuid: String(raw.uuid || raw.id || `${Date.now()}-${Math.random()}`),
    title: raw.title || '',
    description: (raw.description || '').toString().replace(/<[^>]*>/g, ''),
    url: raw.url || raw.link || '#',
    published_at: raw.published_at || raw.published_at_utc || new Date().toISOString(),
    source: sourceName,
    category: pickCategory(raw),
    sentiment,
    symbols,
    image_url: raw.image_url || raw.image || undefined,
  };
}

class MarketAuxService {
  async fetchNews(params: NewsQueryParams): Promise<NewsItem[]> {
    if (!API_KEY) {
      throw new Error('MARKETAUX_API_KEY is not set');
    }

    const url = new URL(API_BASE);

    // Required
    url.searchParams.set('api_token', API_KEY);
    url.searchParams.set('limit', String(params.limit ?? 50));

    // Optional
    if (params.page !== undefined) url.searchParams.set('page', String(params.page));
    if (params.sort) url.searchParams.set('sort', params.sort);
    if (params.languages?.length) url.searchParams.set('language', toComma(params.languages)!);
    if (params.symbols?.length) url.searchParams.set('symbols', toComma(params.symbols)!);
    if (params.exchanges?.length) url.searchParams.set('exchanges', toComma(params.exchanges)!);
    if (params.countries?.length) url.searchParams.set('countries', toComma(params.countries)!);
    if (params.entity_types?.length) url.searchParams.set('entity_types', toComma(params.entity_types)!);
    if (params.sentiment) url.searchParams.set('sentiment', params.sentiment);
    if (typeof params.min_match_score === 'number') url.searchParams.set('min_match_score', String(params.min_match_score));
    if (typeof params.must_have_entities === 'boolean') url.searchParams.set('must_have_entities', String(params.must_have_entities));
    if (typeof params.filter_entities === 'boolean') url.searchParams.set('filter_entities', String(params.filter_entities));
    if (params.published_after) url.searchParams.set('published_after', params.published_after);
    if (params.published_before) url.searchParams.set('published_before', params.published_before);

    // New advanced filters
    if (params.search) url.searchParams.set('search', params.search);
    if (params.industries?.length) url.searchParams.set('industries', toComma(params.industries)!);
    if (params.domains?.length) url.searchParams.set('domains', toComma(params.domains)!);
    if (typeof params.group_similar === 'boolean') url.searchParams.set('group_similar', String(params.group_similar));

    const resp = await fetch(url.toString());
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`MarketAux HTTP ${resp.status} ${resp.statusText}: ${text}`);
    }

    const data = await resp.json();

    // MarketAux commonly returns { data: [...], meta: {...} }
    const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return items.map(mapNewsItem);
  }
}

export const marketAuxService = new MarketAuxService();
