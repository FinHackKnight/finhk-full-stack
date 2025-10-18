// MarketAux News API Service

const MARKETAUX_API_KEY = process.env.MARKETAUX_API_KEY;
const MARKETAUX_API_BASE_URL = process.env.MARKETAUX_API_BASE_URL || 'https://api.marketaux.com/v1';

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
  author?: string;
  entities?: {
    symbol?: string;
    name?: string;
    exchange?: string;
    country?: string;
    type?: string;
    industry?: string;
  }[];
}

// MarketAux API Response interface
interface MarketAuxResponse {
  meta: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
  data: MarketAuxNewsItem[];
}

interface MarketAuxNewsItem {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url: string;
  language: string;
  published_at: string;
  source: string;
  relevance_score: number;
  entities: {
    symbol: string;
    name: string;
    exchange: string;
    country: string;
    type: string;
    industry: string;
    match_score: number;
    sentiment_score: number;
    highlights: {
      sentiment: string;
      highlight: string;
    }[];
  }[];
  similar: string[];
}

interface NewsQueryParams {
  symbols?: string[];
  exchanges?: string[];
  entity_types?: string[];
  countries?: string[];
  languages?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  min_match_score?: number;
  must_have_entities?: boolean;
  published_after?: string; // ISO date string
  published_before?: string; // ISO date string
  sort?: 'published_desc' | 'published_asc' | 'relevance_desc' | 'relevance_asc';
  filter_entities?: boolean;
  limit?: number;
  page?: number;
}

class MarketAuxService {
  async fetchNews(params: NewsQueryParams = {}): Promise<NewsItem[]> {
    if (!MARKETAUX_API_KEY) {
      console.error('MarketAux API key not configured');
      return [];
    }

    try {
      const url = new URL(`${MARKETAUX_API_BASE_URL}/news/all`);
      
      // Add API key
      url.searchParams.append('api_token', MARKETAUX_API_KEY);
      
      // Add query parameters
      if (params.symbols?.length) {
        url.searchParams.append('symbols', params.symbols.join(','));
      }
      if (params.exchanges?.length) {
        url.searchParams.append('exchanges', params.exchanges.join(','));
      }
      if (params.entity_types?.length) {
        url.searchParams.append('entity_types', params.entity_types.join(','));
      }
      if (params.countries?.length) {
        url.searchParams.append('countries', params.countries.join(','));
      }
      if (params.languages?.length) {
        url.searchParams.append('languages', params.languages.join(','));
      }
      if (params.sentiment) {
        url.searchParams.append('sentiment', params.sentiment);
      }
      if (params.min_match_score !== undefined) {
        url.searchParams.append('min_match_score', params.min_match_score.toString());
      }
      if (params.must_have_entities !== undefined) {
        url.searchParams.append('must_have_entities', params.must_have_entities.toString());
      }
      if (params.published_after) {
        url.searchParams.append('published_after', params.published_after);
      }
      if (params.published_before) {
        url.searchParams.append('published_before', params.published_before);
      }
      if (params.sort) {
        url.searchParams.append('sort', params.sort);
      }
      if (params.filter_entities !== undefined) {
        url.searchParams.append('filter_entities', params.filter_entities.toString());
      }
      if (params.limit) {
        url.searchParams.append('limit', params.limit.toString());
      }
      if (params.page) {
        url.searchParams.append('page', params.page.toString());
      }

      console.log('Fetching MarketAux news:', url.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FinApp/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`MarketAux API error: ${response.status} ${response.statusText}`);
      }

      const data: MarketAuxResponse = await response.json();
      
      return data.data.map((item) => this.transformNewsItem(item));
    } catch (error) {
      console.error('Error fetching MarketAux news:', error);
      return [];
    }
  }

  private transformNewsItem(item: MarketAuxNewsItem): NewsItem {
    // Extract symbols from entities
    const symbols = item.entities?.map(entity => entity.symbol).filter(Boolean) || [];
    
    // Determine sentiment from entities
    const sentiment = this.calculateOverallSentiment(item.entities);
    
    // Categorize news based on entities and content
    const category = this.categorizeNews(item.title, item.description, item.entities);

    return {
      uuid: item.uuid,
      title: item.title,
      description: item.description || item.snippet || '',
      url: item.url,
      published_at: item.published_at,
      source: item.source,
      category,
      sentiment,
      symbols,
      image_url: item.image_url || '',
      entities: item.entities?.map(entity => ({
        symbol: entity.symbol,
        name: entity.name,
        exchange: entity.exchange,
        country: entity.country,
        type: entity.type,
        industry: entity.industry
      }))
    };
  }

  private calculateOverallSentiment(entities: MarketAuxNewsItem['entities']): string {
    if (!entities?.length) return 'neutral';
    
    const avgSentiment = entities.reduce((sum, entity) => sum + entity.sentiment_score, 0) / entities.length;
    
    if (avgSentiment > 0.1) return 'positive';
    if (avgSentiment < -0.1) return 'negative';
    return 'neutral';
  }

  private categorizeNews(title: string, description: string, entities: MarketAuxNewsItem['entities']): string {
    const content = (title + ' ' + description).toLowerCase();
    
    // Check entity types first
    if (entities?.length) {
      const entityTypes = entities.map(e => e.type?.toLowerCase());
      if (entityTypes.includes('stock') || entityTypes.includes('equity')) return 'Stocks';
      if (entityTypes.includes('crypto') || entityTypes.includes('cryptocurrency')) return 'Crypto';
      if (entityTypes.includes('forex') || entityTypes.includes('currency')) return 'Forex';
      if (entityTypes.includes('commodity')) return 'Commodities';
    }
    
    // Fallback to content-based categorization
    if (content.includes('earnings') || content.includes('stock') || content.includes('share')) return 'Stocks';
    if (content.includes('market') || content.includes('trading') || content.includes('dow') || content.includes('s&p')) return 'Market';
    if (content.includes('crypto') || content.includes('bitcoin') || content.includes('ethereum')) return 'Crypto';
    if (content.includes('fed') || content.includes('interest rate') || content.includes('inflation')) return 'Economic';
    if (content.includes('oil') || content.includes('gold') || content.includes('commodity')) return 'Commodities';
    if (content.includes('merger') || content.includes('acquisition') || content.includes('ipo')) return 'Corporate';
    
    return 'Financial';
  }
}

// Export singleton instance
export const marketAuxService = new MarketAuxService();

// Export query params interface for use in API routes
export type { NewsQueryParams };
