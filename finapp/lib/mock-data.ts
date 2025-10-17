export interface GlobalEvent {
  id: string
  title: string
  type: "political" | "economic" | "environmental" | "tech" | "finance" | "climate"
  location: {
    lat: number
    lng: number
    country: string
  }
  impact: number // 1-10
  date: string
  description: string
  articles: Array<{
    title: string
    source: string
    url: string
  }>
}

export interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  data: Array<{ time: string; value: number }>
}

export interface AffectedMarket {
  symbol: string
  name: string
  changePercent: number
}

export interface EventWithMarkets extends GlobalEvent {
  impactLevel: "low" | "medium" | "high"
  affectedMarkets: AffectedMarket[]
  imageUrl?: string
  detailedDescription: string
  impactReason: string
  relevantStocks: Array<{
    symbol: string
    name: string
    changePercent: number
  }>
}

export const mockEventsWithMarkets: EventWithMarkets[] = [
  {
    id: "1",
    title: "G20 Summit Economic Agreement",
    type: "political",
    location: { lat: 35.6762, lng: 139.6503, country: "Japan" },
    impact: 8,
    impactLevel: "high",
    date: "2024-05-29",
    description: "Major economic policy changes announced affecting global trade",
    detailedDescription:
      "The G20 Summit concluded with landmark agreements on international trade policy, digital taxation frameworks, and coordinated economic stimulus measures. Leaders from the world's largest economies committed to reducing trade barriers and establishing new frameworks for cross-border digital commerce. The agreement includes provisions for technology transfer, intellectual property protection, and sustainable development initiatives.",
    impactReason:
      "This agreement represents a significant shift in global trade policy with immediate effects on international markets. The coordinated approach to digital taxation will affect major tech companies, while reduced trade barriers will boost manufacturing and export sectors. The commitment to economic stimulus measures signals increased government spending and potential inflationary pressures.",
    relevantStocks: [
      { symbol: "AAPL", name: "Apple Inc.", changePercent: 3.2 },
      { symbol: "MSFT", name: "Microsoft Corp.", changePercent: 2.8 },
      { symbol: "AMZN", name: "Amazon.com Inc.", changePercent: 2.1 },
      { symbol: "JPM", name: "JPMorgan Chase", changePercent: 1.9 },
      { symbol: "BA", name: "Boeing Co.", changePercent: 4.5 },
    ],
    articles: [
      { title: "G20 Leaders Reach Historic Trade Deal", source: "Financial Times", url: "#" },
      { title: "Markets React to G20 Announcements", source: "Bloomberg", url: "#" },
    ],
    affectedMarkets: [
      { symbol: "SPX", name: "S&P 500", changePercent: 2.4 },
      { symbol: "NIKKEI", name: "Nikkei 225", changePercent: 3.1 },
      { symbol: "FTSE", name: "FTSE 100", changePercent: 1.8 },
    ],
  },
  {
    id: "2",
    title: "Tech Innovation Hub Launch",
    type: "tech",
    location: { lat: 37.7749, lng: -122.4194, country: "USA" },
    impact: 7,
    impactLevel: "medium",
    date: "2024-05-28",
    description: "New AI research facility opens in Silicon Valley",
    detailedDescription:
      "Silicon Valley's newest AI research facility represents a $2 billion investment in cutting-edge artificial intelligence and machine learning technologies. The facility will house over 5,000 researchers and engineers working on next-generation AI models, quantum computing applications, and neural network architectures. Major tech companies have committed to collaborative research initiatives.",
    impactReason:
      "The launch signals increased competition in the AI sector and validates the long-term growth potential of artificial intelligence technologies. This will likely accelerate AI adoption across industries and drive increased R&D spending. The collaborative nature of the facility may lead to faster innovation cycles and new product announcements.",
    relevantStocks: [
      { symbol: "NVDA", name: "NVIDIA Corp.", changePercent: 5.7 },
      { symbol: "GOOGL", name: "Alphabet Inc.", changePercent: 3.4 },
      { symbol: "META", name: "Meta Platforms", changePercent: 2.9 },
      { symbol: "MSFT", name: "Microsoft Corp.", changePercent: 3.1 },
    ],
    articles: [{ title: "Silicon Valley Unveils AI Center", source: "TechCrunch", url: "#" }],
    affectedMarkets: [
      { symbol: "NASDAQ", name: "NASDAQ", changePercent: 1.9 },
      { symbol: "MSFT", name: "Microsoft", changePercent: 3.5 },
    ],
  },
  {
    id: "3",
    title: "Renewable Energy Breakthrough",
    type: "environmental",
    location: { lat: 52.52, lng: 13.405, country: "Germany" },
    impact: 9,
    impactLevel: "high",
    date: "2024-05-27",
    description: "New solar technology promises 50% efficiency gains",
    detailedDescription:
      "German scientists have achieved a breakthrough in solar panel technology, developing a new photovoltaic cell design that achieves 50% efficiency in converting sunlight to electricity. This represents a quantum leap from current commercial panels that typically achieve 20-25% efficiency. The technology uses advanced materials and novel cell architectures that could be mass-produced within 18 months.",
    impactReason:
      "This breakthrough has the potential to revolutionize the renewable energy sector and accelerate the global transition away from fossil fuels. The dramatic efficiency improvement makes solar power economically viable in many new markets and applications. Energy companies and utilities will need to reassess their long-term strategies, while solar manufacturers face both opportunities and disruption.",
    relevantStocks: [
      { symbol: "ENPH", name: "Enphase Energy", changePercent: 8.2 },
      { symbol: "FSLR", name: "First Solar", changePercent: 6.7 },
      { symbol: "SEDG", name: "SolarEdge Tech", changePercent: 7.1 },
      { symbol: "RUN", name: "Sunrun Inc.", changePercent: 5.9 },
      { symbol: "TSLA", name: "Tesla Inc.", changePercent: 4.3 },
    ],
    articles: [{ title: "German Scientists Achieve Solar Milestone", source: "Nature", url: "#" }],
    affectedMarkets: [
      { symbol: "ENPH", name: "Enphase Energy", changePercent: 8.2 },
      { symbol: "FSLR", name: "First Solar", changePercent: 6.7 },
      { symbol: "DAX", name: "DAX", changePercent: 1.3 },
    ],
  },
  {
    id: "4",
    title: "Central Bank Rate Decision",
    type: "finance",
    location: { lat: 51.5074, lng: -0.1278, country: "UK" },
    impact: 8,
    impactLevel: "high",
    date: "2024-05-26",
    description: "Bank of England announces unexpected rate cut",
    detailedDescription:
      "In a surprise move, the Bank of England has cut interest rates by 50 basis points, citing concerns about economic growth and deflationary pressures. The decision came despite earlier guidance suggesting rates would remain steady. The central bank also announced an expansion of its quantitative easing program and new measures to support lending to small businesses.",
    impactReason:
      "The unexpected rate cut signals serious concerns about the UK economy and will have immediate effects on currency markets, bond yields, and equity valuations. Lower rates typically boost stock prices but weaken the currency. The move may pressure other central banks to follow suit, potentially triggering a global easing cycle. Financial sector margins will be compressed while borrowers benefit.",
    relevantStocks: [
      { symbol: "HSBC", name: "HSBC Holdings", changePercent: -2.1 },
      { symbol: "BARC", name: "Barclays PLC", changePercent: -1.8 },
      { symbol: "LLOY", name: "Lloyds Banking", changePercent: -1.5 },
      { symbol: "RBS", name: "NatWest Group", changePercent: -1.9 },
    ],
    articles: [{ title: "BoE Cuts Rates Amid Economic Concerns", source: "Reuters", url: "#" }],
    affectedMarkets: [
      { symbol: "GBP", name: "GBP/USD", changePercent: -1.2 },
      { symbol: "FTSE", name: "FTSE 100", changePercent: 2.1 },
    ],
  },
  {
    id: "5",
    title: "Climate Summit Agreement",
    type: "climate",
    location: { lat: -23.5505, lng: -46.6333, country: "Brazil" },
    impact: 9,
    impactLevel: "high",
    date: "2024-05-25",
    description: "Nations commit to accelerated carbon reduction targets",
    detailedDescription:
      "At the Climate Summit, nations committed to accelerated carbon reduction targets, aiming to achieve net-zero emissions by 2050. The agreement includes measures for increased renewable energy adoption, stricter regulations on industrial emissions, and funding for climate resilience projects in developing countries.",
    impactReason:
      "This commitment to accelerated carbon reduction targets will drive significant changes in global energy and industrial sectors. Companies involved in renewable energy, carbon capture, and sustainable technologies will see increased demand and investment. However, industries heavily reliant on fossil fuels may face challenges and potential declines.",
    relevantStocks: [
      { symbol: "TSLA", name: "Tesla", changePercent: 4.3 },
      { symbol: "ICLN", name: "Clean Energy ETF", changePercent: 5.1 },
      { symbol: "AAPL", name: "Apple Inc.", changePercent: 3.6 },
      { symbol: "GOOGL", name: "Alphabet Inc.", changePercent: 2.8 },
    ],
    articles: [{ title: "Historic Climate Deal Reached", source: "The Guardian", url: "#" }],
    affectedMarkets: [
      { symbol: "TSLA", name: "Tesla", changePercent: 4.3 },
      { symbol: "ICLN", name: "Clean Energy ETF", changePercent: 5.1 },
    ],
  },
  {
    id: "6",
    title: "Emerging Market Currency Crisis",
    type: "economic",
    location: { lat: 28.6139, lng: 77.209, country: "India" },
    impact: 6,
    impactLevel: "medium",
    date: "2024-05-24",
    description: "Regional currency volatility affects trade",
    detailedDescription:
      "Currency markets in the Indian region have shown significant volatility, leading to concerns about trade stability and economic growth. The crisis has affected both domestic and international investors, with a notable impact on sectors exposed to foreign exchange risk.",
    impactReason:
      "The currency crisis will likely disrupt trade flows and investment patterns within the region. Companies with substantial foreign currency exposure may face financial challenges. Central banks will need to intervene to stabilize currencies, potentially affecting monetary policies.",
    relevantStocks: [
      { symbol: "INR", name: "INR/USD", changePercent: -0.8 },
      { symbol: "SENSEX", name: "BSE Sensex", changePercent: -1.5 },
      { symbol: "RELI", name: "Reliance Industries", changePercent: -2.3 },
      { symbol: "TCS", name: "Tata Consultancy Services", changePercent: -1.9 },
    ],
    articles: [{ title: "Currency Markets Show Volatility", source: "WSJ", url: "#" }],
    affectedMarkets: [
      { symbol: "INR", name: "INR/USD", changePercent: -0.8 },
      { symbol: "SENSEX", name: "BSE Sensex", changePercent: -1.5 },
    ],
  },
  {
    id: "7",
    title: "Oil Production Agreement",
    type: "economic",
    location: { lat: 25.2048, lng: 55.2708, country: "UAE" },
    impact: 5,
    impactLevel: "low",
    date: "2024-05-23",
    description: "OPEC+ extends production cuts",
    detailedDescription:
      "OPEC+ has extended its production cuts to support global oil prices and stabilize markets. The agreement aims to reduce excess supply and address concerns about oversupply, which has been impacting oil prices negatively.",
    impactReason:
      "The extended production cuts are expected to have a stabilizing effect on oil prices, benefiting oil-producing nations and companies. However, the reduction in supply may also lead to higher prices for consumers and industries dependent on oil.",
    relevantStocks: [
      { symbol: "WTI", name: "WTI Crude", changePercent: 0.9 },
      { symbol: "XOM", name: "Exxon Mobil", changePercent: 0.6 },
      { symbol: "CVX", name: "Chevron", changePercent: 0.7 },
      { symbol: "BP", name: "BP PLC", changePercent: 0.8 },
    ],
    articles: [{ title: "OPEC+ Maintains Output Strategy", source: "Bloomberg", url: "#" }],
    affectedMarkets: [
      { symbol: "WTI", name: "WTI Crude", changePercent: 0.9 },
      { symbol: "XOM", name: "Exxon Mobil", changePercent: 0.6 },
    ],
  },
  {
    id: "8",
    title: "Trade Dispute Resolution",
    type: "political",
    location: { lat: 39.9042, lng: 116.4074, country: "China" },
    impact: 7,
    impactLevel: "medium",
    date: "2024-05-22",
    description: "Major trade partners reach compromise",
    detailedDescription:
      "China and its major trade partners have reached a compromise to resolve ongoing disputes, focusing on increased market access, intellectual property protection, and trade balance adjustments. The resolution includes provisions for joint trade committees and dispute resolution mechanisms.",
    impactReason:
      "The resolution of trade disputes will likely lead to increased trade volumes and economic growth. Companies with operations in affected regions will benefit from improved market conditions. However, the specifics of the compromise may have varying impacts on different sectors and industries.",
    relevantStocks: [
      { symbol: "SSE", name: "Shanghai Composite", changePercent: 1.7 },
      { symbol: "BABA", name: "Alibaba", changePercent: 2.3 },
      { symbol: "JD", name: "JD.com", changePercent: 1.9 },
      { symbol: "WYNN", name: "Wynn Resorts", changePercent: 2.1 },
    ],
    articles: [{ title: "Trade Tensions Ease", source: "Reuters", url: "#" }],
    affectedMarkets: [
      { symbol: "SSE", name: "Shanghai Composite", changePercent: 1.7 },
      { symbol: "BABA", name: "Alibaba", changePercent: 2.3 },
    ],
  },
]

export const mockMarketData: MarketData[] = [
  {
    symbol: "SPX",
    name: "S&P 500",
    price: 5847.23,
    change: 45.67,
    changePercent: 0.79,
    data: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 5800 + Math.random() * 100,
    })),
  },
  {
    symbol: "DJI",
    name: "Dow Jones",
    price: 42863.45,
    change: -123.45,
    changePercent: -0.29,
    data: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 42800 + Math.random() * 150,
    })),
  },
  {
    symbol: "IXIC",
    name: "NASDAQ",
    price: 18342.67,
    change: 89.23,
    changePercent: 0.49,
    data: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 18300 + Math.random() * 100,
    })),
  },
  {
    symbol: "FTSE",
    name: "FTSE 100",
    price: 8234.56,
    change: 12.34,
    changePercent: 0.15,
    data: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: 8200 + Math.random() * 80,
    })),
  },
]

export const mockNews = [
  "Breaking: G20 Summit concludes with major trade agreements",
  "Tech stocks rally on AI innovation announcements",
  "Renewable energy sector sees record investment",
  "Central banks coordinate on inflation strategy",
  "Climate summit reaches historic carbon reduction deal",
  "Emerging markets show resilience amid volatility",
]
