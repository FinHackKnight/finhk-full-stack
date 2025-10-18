// Mock stock data functions for development
// In a real application, these would connect to actual stock data APIs

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe: number
  sector: string
  industry: string
  high: number
  low: number
  open: number
  previousClose: number
}

export interface StockHistory {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockNewsItem {
  id: string
  title: string
  description: string
  publishedAt: string
  source: string
  url: string
  sentiment: "positive" | "negative" | "neutral"
  symbols: string[]
}

// Mock data for development
const mockStockData: Record<string, StockQuote> = {
  'AAPL': {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    change: 2.15,
    changePercent: 1.24,
    volume: 45678900,
    marketCap: 2750000000000,
    pe: 28.5,
    sector: 'Technology',
    industry: 'Consumer Electronics',
    high: 176.20,
    low: 173.80,
    open: 174.50,
    previousClose: 173.28
  },
  'MSFT': {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: -1.25,
    changePercent: -0.33,
    volume: 23456700,
    marketCap: 2810000000000,
    pe: 32.1,
    sector: 'Technology',
    industry: 'Software',
    high: 380.10,
    low: 377.20,
    open: 379.50,
    previousClose: 380.10
  },
  'GOOGL': {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    change: 3.42,
    changePercent: 2.46,
    volume: 18923400,
    marketCap: 1780000000000,
    pe: 25.8,
    sector: 'Technology',
    industry: 'Internet Services',
    high: 143.20,
    low: 140.80,
    open: 141.50,
    previousClose: 139.14
  },
  'TSLA': {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 248.50,
    change: -5.20,
    changePercent: -2.05,
    volume: 67890100,
    marketCap: 789000000000,
    pe: 45.2,
    sector: 'Consumer Discretionary',
    industry: 'Electric Vehicles',
    high: 252.80,
    low: 246.30,
    open: 251.20,
    previousClose: 253.70
  },
  'NVDA': {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.28,
    change: 12.45,
    changePercent: 1.44,
    volume: 45678900,
    marketCap: 2150000000000,
    pe: 65.8,
    sector: 'Technology',
    industry: 'Semiconductors',
    high: 880.15,
    low: 870.20,
    open: 875.50,
    previousClose: 862.83
  }
}

const mockNewsData: StockNewsItem[] = [
  {
    id: '1',
    title: 'Apple Reports Strong Q4 Earnings',
    description: 'Apple Inc. reported better-than-expected earnings for the fourth quarter, driven by strong iPhone sales.',
    publishedAt: '2024-01-15T10:30:00Z',
    source: 'Reuters',
    url: 'https://example.com/news/1',
    sentiment: 'positive',
    symbols: ['AAPL']
  },
  {
    id: '2',
    title: 'Microsoft Azure Growth Slows',
    description: 'Microsoft Corporation reported slower growth in its Azure cloud computing division.',
    publishedAt: '2024-01-14T15:45:00Z',
    source: 'Bloomberg',
    url: 'https://example.com/news/2',
    sentiment: 'negative',
    symbols: ['MSFT']
  },
  {
    id: '3',
    title: 'Google AI Investments Pay Off',
    description: 'Alphabet Inc. sees significant returns from its artificial intelligence investments.',
    publishedAt: '2024-01-13T09:15:00Z',
    source: 'TechCrunch',
    url: 'https://example.com/news/3',
    sentiment: 'positive',
    symbols: ['GOOGL']
  },
  {
    id: '4',
    title: 'Tesla Production Challenges',
    description: 'Tesla faces production delays at its new manufacturing facility.',
    publishedAt: '2024-01-12T14:20:00Z',
    source: 'Wall Street Journal',
    url: 'https://example.com/news/4',
    sentiment: 'negative',
    symbols: ['TSLA']
  },
  {
    id: '5',
    title: 'NVIDIA AI Chip Demand Surges',
    description: 'NVIDIA reports record demand for its AI and data center chips, driving strong revenue growth.',
    publishedAt: '2024-01-16T09:30:00Z',
    source: 'TechCrunch',
    url: 'https://example.com/news/5',
    sentiment: 'positive',
    symbols: ['NVDA']
  },
  {
    id: '6',
    title: 'NVIDIA Partners with Major Cloud Providers',
    description: 'NVIDIA announces new partnerships with major cloud providers to expand AI infrastructure.',
    publishedAt: '2024-01-15T11:45:00Z',
    source: 'Reuters',
    url: 'https://example.com/news/6',
    sentiment: 'positive',
    symbols: ['NVDA']
  },
  {
    id: '7',
    title: 'NVIDIA Gaming Revenue Growth',
    description: 'NVIDIA reports strong gaming segment performance with new RTX series adoption.',
    publishedAt: '2024-01-14T16:20:00Z',
    source: 'Bloomberg',
    url: 'https://example.com/news/7',
    sentiment: 'positive',
    symbols: ['NVDA']
  }
]

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const stock = mockStockData[symbol.toUpperCase()]
  if (!stock) {
    throw new Error(`Stock symbol ${symbol} not found`)
  }
  
  // Add some randomness to simulate real-time data
  const randomChange = (Math.random() - 0.5) * 2
  const randomVolume = Math.floor(Math.random() * 1000000)
  
  return {
    ...stock,
    price: stock.price + randomChange,
    change: stock.change + randomChange,
    volume: stock.volume + randomVolume
  }
}

export async function getMultipleStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  const quotes = await Promise.all(
    symbols.map(symbol => getStockQuote(symbol))
  )
  return quotes
}

export async function getStockHistory(
  symbol: string, 
  dateFrom?: string, 
  dateTo?: string
): Promise<StockHistory[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150))
  
  const stock = mockStockData[symbol.toUpperCase()]
  if (!stock) {
    throw new Error(`Stock symbol ${symbol} not found`)
  }
  
  // Generate mock historical data
  const history: StockHistory[] = []
  const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  const endDate = dateTo ? new Date(dateTo) : new Date()
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) { // Skip weekends
      const basePrice = stock.price
      const volatility = 0.02
      const randomChange = (Math.random() - 0.5) * volatility * basePrice
      
      const open = basePrice + randomChange
      const close = open + (Math.random() - 0.5) * volatility * basePrice
      const high = Math.max(open, close) + Math.random() * volatility * basePrice
      const low = Math.min(open, close) - Math.random() * volatility * basePrice
      
      history.push({
        date: d.toISOString().split('T')[0],
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(Math.random() * 10000000) + 1000000
      })
    }
  }
  
  return history
}

export async function getStockNews(
  symbols?: string[], 
  limit: number = 20
): Promise<StockNewsItem[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  let filteredNews = mockNewsData
  
  if (symbols && symbols.length > 0) {
    filteredNews = mockNewsData.filter(news => 
      news.symbols.some(symbol => 
        symbols.map(s => s.toUpperCase()).includes(symbol.toUpperCase())
      )
    )
  }
  
  // Sort by published date (newest first) and limit results
  return filteredNews
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit)
}
