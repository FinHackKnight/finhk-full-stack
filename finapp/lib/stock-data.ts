// Stock data utility functions
// These are placeholder implementations - replace with actual API calls as needed

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: string;
}

export interface StockHistory {
  symbol: string;
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

export interface StockNews {
  symbol?: string;
  articles: Array<{
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    symbols?: string[];
  }>;
}

// Placeholder function for getting stock quotes
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  // TODO: Implement actual API call (e.g., Alpha Vantage, Yahoo Finance, etc.)
  console.warn(`getStockQuote called for ${symbol} - using mock data`);
  
  return {
    symbol: symbol.toUpperCase(),
    price: 150.00 + Math.random() * 50,
    change: (Math.random() - 0.5) * 5,
    changePercent: (Math.random() - 0.5) * 3,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: 2500000000,
    timestamp: new Date().toISOString(),
  };
}

// Placeholder function for getting multiple stock quotes
export async function getMultipleStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  // TODO: Implement actual API call
  console.warn(`getMultipleStockQuotes called for ${symbols.join(', ')} - using mock data`);
  
  return Promise.all(symbols.map(symbol => getStockQuote(symbol)));
}

// Placeholder function for getting stock history
export async function getStockHistory(
  symbol: string,
  dateFrom?: string,
  dateTo?: string
): Promise<StockHistory> {
  // TODO: Implement actual API call
  console.warn(`getStockHistory called for ${symbol} - using mock data`);
  
  const endDate = dateTo ? new Date(dateTo) : new Date();
  const startDate = dateFrom ? new Date(dateFrom) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const data = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Skip weekends
      const basePrice = 150;
      const randomVariation = (Math.random() - 0.5) * 10;
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        open: basePrice + randomVariation,
        high: basePrice + randomVariation + Math.random() * 5,
        low: basePrice + randomVariation - Math.random() * 5,
        close: basePrice + randomVariation + (Math.random() - 0.5) * 3,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return {
    symbol: symbol.toUpperCase(),
    data,
  };
}

// Placeholder function for getting stock news
export async function getStockNews(symbols?: string[], limit: number = 20): Promise<StockNews> {
  // TODO: Implement actual API call
  console.warn(`getStockNews called for ${symbols ? symbols.join(', ') : 'general'} - using mock data`);
  
  const articles = [];
  const sources = ['Financial Times', 'Bloomberg', 'Reuters', 'Wall Street Journal', 'Yahoo Finance'];
  
  for (let i = 0; i < Math.min(limit, 10); i++) {
    articles.push({
      title: `${symbols && symbols.length > 0 ? symbols[0] : 'Market'} Stock Analysis ${i + 1}`,
      description: 'Mock news article about the stock market and financial trends',
      url: '#',
      source: sources[Math.floor(Math.random() * sources.length)],
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      symbols: symbols || [],
    });
  }
  
  return {
    symbol: symbols && symbols.length > 0 ? symbols[0] : undefined,
    articles,
  };
}
