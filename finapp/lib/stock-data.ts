const STOCK_DATA_API_KEY = process.env.STOCK_DATA_API_KEY;
const STOCK_DATA_BASE_URL = process.env.STOCK_DATA_BASE_URL || 'https://api.stockdata.org/v1';

if (!STOCK_DATA_API_KEY) {
  throw new Error('STOCK_DATA_API_KEY is not defined in environment variables');
}

interface StockDataOptions {
  symbols?: string[];
  limit?: number;
  offset?: number;
  sort?: 'asc' | 'desc';
  date_from?: string;
  date_to?: string;
}

class StockDataAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = STOCK_DATA_API_KEY!;
    this.baseUrl = STOCK_DATA_BASE_URL;
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add API key to params
    params.api_token = this.apiKey;
    
    // Add all params to URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Stock Data API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Stock Data API request failed:', error);
      throw error;
    }
  }

  // Get real-time stock data
  async getRealTimeData(symbols: string[], options: StockDataOptions = {}) {
    const params = {
      symbols: symbols.join(','),
      ...options
    };
    
    return this.makeRequest('/data/quote', params);
  }

  // Get historical stock data
  async getHistoricalData(symbols: string[], options: StockDataOptions = {}) {
    const params = {
      symbols: symbols.join(','),
      ...options
    };
    
    return this.makeRequest('/data/eod', params);
  }

  // Get intraday data
  async getIntradayData(symbols: string[], options: StockDataOptions = {}) {
    const params = {
      symbols: symbols.join(','),
      ...options
    };
    
    return this.makeRequest('/data/intraday', params);
  }

  // Get news data
  async getNews(options: { 
    symbols?: string[];
    limit?: number;
    offset?: number;
    language?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
  } = {}) {
    const params = {
      symbols: options.symbols?.join(','),
      limit: options.limit || 50,
      offset: options.offset || 0,
      language: options.language || 'en',
      ...options
    };
    
    return this.makeRequest('/news/all', params);
  }

  // Search for symbols
  async searchSymbols(query: string) {
    const params = {
      symbols: query
    };
    
    return this.makeRequest('/entity/search', params);
  }

  // Get exchange list
  async getExchanges() {
    return this.makeRequest('/entity/exchanges');
  }
}

export const stockDataAPI = new StockDataAPI();

// Helper functions for common use cases
export async function getStockQuote(symbol: string) {
  return stockDataAPI.getRealTimeData([symbol]);
}

export async function getMultipleStockQuotes(symbols: string[]) {
  return stockDataAPI.getRealTimeData(symbols);
}

export async function getStockHistory(symbol: string, dateFrom?: string, dateTo?: string) {
  return stockDataAPI.getHistoricalData([symbol], { date_from: dateFrom, date_to: dateTo });
}

export async function getStockNews(symbols?: string[], limit = 20) {
  return stockDataAPI.getNews({ symbols, limit });
}

export default stockDataAPI;
