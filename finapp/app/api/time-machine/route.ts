import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MARKET_AUX_KEY = process.env.MARKETAUX_API_KEY!;
const BATCH_SIZE = 2;

// --- Country centroid fallback map ---
const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  US: { lat: 39.8283, lng: -98.5795 },
  CA: { lat: 56.1304, lng: -106.3468 },
  GB: { lat: 55.3781, lng: -3.436 },
  FR: { lat: 46.2276, lng: 2.2137 },
  DE: { lat: 51.1657, lng: 10.4515 },
  JP: { lat: 36.2048, lng: 138.2529 },
  CN: { lat: 35.8617, lng: 104.1954 },
  IN: { lat: 20.5937, lng: 78.9629 },
  KR: { lat: 35.9078, lng: 127.7669 },
  AU: { lat: -25.2744, lng: 133.7751 },
  BR: { lat: -14.235, lng: -51.9253 },
  MX: { lat: 23.6345, lng: -102.5528 },
  SG: { lat: 1.3521, lng: 103.8198 },
  HK: { lat: 22.3193, lng: 114.1694 },
};

// --- Fetch Marketaux articles for a specific date ---
async function fetchMarketauxByDate(date: string) {
  // Date should be in YYYY-MM-DD format
  // Filter for finance-related news with entities
  const url = `https://api.marketaux.com/v1/news/all?filter_entities=true&language=en&countries=us&published_on=${date}&limit=50&api_token=${MARKET_AUX_KEY}`;
  
  console.log(`📅 Fetching Marketaux articles for ${date}`);
  
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to fetch Marketaux news for ${date}: ${res.status}`);
    throw new Error(`Failed to fetch Marketaux news for ${date}`);
  }
  
  const data = await res.json();
  console.log(`✅ Marketaux returned ${data.data?.length || 0} articles for ${date}`);
  
  return data.data || [];
}

// --- Trim articles for Gemini ---
function trimArticlesForGemini(articles: any[]) {
  return articles.map((a) => ({
    title: a.title,
    summary: a.description || a.snippet || "",
    published_at: a.published_at,
    url: a.url,
    image_url: a.image_url,
    entities: a.entities?.slice(0, 3) || [],
    sentiment: a.overall_sentiment_label,
    sentiment_score: a.overall_sentiment_score,
    country: a.country || "",
    topic: a.topic || "",
  }));
}

// --- Basic impact hint from sentiment ---
function impactFromSentiment(score: number) {
  if (score > 0.4) return { color: "green", impact: Math.round(score * 10) };
  if (score < -0.4) return { color: "red", impact: Math.round(Math.abs(score) * 10) };
  return { color: "yellow", impact: 5 };
}

// --- Format date to YYYY-MM-DD ---
function formatDateOnly(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

// --- Gemini prompt ---
const buildPrompt = (articles: any[], targetDate: string) => `
You are a financial and market intelligence analyst. Analyze these ${articles.length} market news articles and produce structured market-impact events.

Rules:
- Only include events with clear positive or negative market impact.
- Each event must include all required fields using EXACT property names from the schema below.
- Focus on market relevance: always identify related public companies, sectors, or indices.
- If the event involves a company or organization, include its stock ticker and company name in relevant_stocks.
  - If multiple companies are mentioned, include up to 3 most relevant ones.
  - If no public ticker is found, include [{"ticker": null, "name": "<organization name>"}].
- For location and country:
  - Always determine the country where the event occurred or is most relevant to (use ISO 2-letter country codes like "US", "GB", "CN", etc.).
  - If tied to a company or organization, use its headquarters city and country.
  - If the event is regional, use the main city where it occurred and its country.
  - If no city can be determined, use the **country centroid** coordinates for that country.
  - Always return valid numeric coordinates (latitude/longitude). Avoid zeroes; use null only if absolutely indeterminable.
  - Always include the event_country field with the 2-letter country code.
- For event_img: Always use the article's image_url field if available. This image will be displayed in the event detail view.
- For impact_score (1-10 scale) - CRITICAL SCORING RULES:
  - ⚠️ NEVER default to 5/10. This is the most common mistake. ⚠️
  - ⚠️ DO NOT give everything the same score. Differentiate between events. ⚠️
  - FORCE yourself to use the full range: aim for 70% of events at 1-3, 25% at 4-7, 5% at 8-10.
  - Start by assuming every event is a 2, then adjust up or down based on these criteria:
  
  SCORING GUIDE:
  - 1: Routine/expected news with no surprises (earnings in line, regular updates, minor price changes)
  - 2: Standard business news (normal announcements, typical quarterly results, minor partnerships)
  - 3: Noteworthy but not unusual (solid earnings beat, mid-size deal, new product in existing line)
  - 4: Genuinely significant for the company (major earnings surprise, important acquisition, key executive change)
  - 5: Sector-moving news (affects multiple companies, notable regulatory news, significant market shift)
  - 6: Industry-reshaping events (major disruption, transformative technology, important policy change)
  - 7: Multi-sector impact (large economic indicator, significant geopolitical development, major scandal)
  - 8: Economy-wide effects (central bank rate decision, major trade war development, critical policy shift)
  - 9: Market crisis level (financial system stress, major war/conflict, severe economic shock)
  - 10: Historical catastrophic events ONLY (2008 financial crisis, COVID-19 pandemic declaration, 9/11)
  
  EVALUATION PROCESS:
  - Ask: "Will this matter in 1 week?" If no → score 1-2
  - Ask: "Will this matter in 1 month?" If no → score 2-3
  - Ask: "Will this matter in 1 year?" If no → score 3-4
  - Ask: "Will this reshape the industry?" If yes → score 5-7
  - Ask: "Is this a once-in-a-year event?" If yes → score 7-8
  - Ask: "Is this a once-in-a-decade event?" If yes → score 9-10
  
- For impact_color (MUST match the score):
  - "green": impact_score 1-3 (low impact)
  - "yellow": impact_score 4-7 (medium impact)
  - "red": impact_score 8-10 (high impact)
- Output **only valid JSON** as an array matching the schema. Do not include explanations or extra text.

Schema:
[
  {
    "event_title": "",
    "event_img": "",
    "event_longitude": null,
    "event_latitude": null,
    "event_country": "",
    "event_summary": "",
    "event_category": "",
    "article_link": "",
    "impact_score": 0,
    "impact_reason": "",
    "impact_color": "green" | "yellow" | "red",
    "relevant_stocks": [{"ticker": "", "name": ""}],
    "event_date": ""
  }
]

Articles:
${JSON.stringify(articles, null, 2)}
`;

// --- Parse Gemini JSON safely ---
function parseGeminiResponse(text: string) {
  try {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) return [];
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.log("Failed parsing Gemini output:", text);
    return [];
  }
}

// --- Process Gemini batch ---
async function processBatch(articles: any[], targetDate: string) {
  const prompt = buildPrompt(articles, targetDate);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Gemini raw output:", text.slice(0, 400));
    return parseGeminiResponse(text);
  } catch (err) {
    console.error("Gemini batch error:", err);
    return [];
  }
}

// --- Normalize Gemini events ---
function normalizeGeminiEvent(e: any, country?: string, targetDate?: string) {
  let longitude = e.event_longitude ?? null;
  let latitude = e.event_latitude ?? null;
  let eventCountry = e.event_country || country || "";

  if ((!longitude || !latitude) && eventCountry && COUNTRY_CENTROIDS[eventCountry.toUpperCase()]) {
    const centroid = COUNTRY_CENTROIDS[eventCountry.toUpperCase()];
    longitude = centroid.lng;
    latitude = centroid.lat;
  }

  return {
    Event_title: e.event_title || "",
    Event_img: e.event_img || "",
    Event_longitude: longitude ?? 0,
    event_latitude: latitude ?? 0,
    event_country: eventCountry,
    event_summary: e.event_summary || "",
    event_category: e.event_category || "General",
    Article_link: e.article_link || "",
    impact_score: e.impact_score ?? 0,
    Impact_reason: e.impact_reason || "",
    impact_color: e.impact_color || "yellow",
    Relevant_stocks: e.relevant_stocks || [],
    event_date: targetDate || formatDateOnly(e.event_date || new Date().toISOString()),
  };
}

// --- API handler ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Required: YYYY-MM-DD format

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required (format: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    console.log(`🕰️  Time Machine: Fetching events for ${date}`);

    // Fetch articles for the specific date
    const raw = await fetchMarketauxByDate(date);
    
    if (!raw || raw.length === 0) {
      console.log(`⚠️  No articles found for ${date}`);
      return NextResponse.json([]);
    }

    const trimmed = trimArticlesForGemini(raw);
    const filtered = trimmed.filter((a) => a.title);

    const enriched = filtered.map((a) => ({
      ...a,
      impact_hint: impactFromSentiment(a.sentiment_score || 0),
    }));

    // Split into batches
    const batches: any[][] = [];
    for (let i = 0; i < enriched.length; i += BATCH_SIZE) {
      batches.push(enriched.slice(i, i + BATCH_SIZE));
    }

    // Process in parallel with Gemini
    console.log(`🤖 Processing ${batches.length} batches with Gemini...`);
    const responses = await Promise.allSettled(batches.map(batch => processBatch(batch, date)));
    const geminiEventsRaw = responses
      .filter((r) => r.status === "fulfilled")
      .flatMap((r: any) => r.value)
      .filter(Boolean);

    console.log(`✅ Gemini processed ${geminiEventsRaw.length} events successfully`);

    const geminiEvents = geminiEventsRaw.map((e, idx) =>
      normalizeGeminiEvent(e, enriched[idx]?.country, date)
    );

    // Fallback for skipped articles (always include these in case Gemini hits rate limits)
    const geminiArticleUrls = new Set(geminiEvents.map((e) => e.Article_link));
    const fallbackEvents = enriched
      .filter((a) => !geminiArticleUrls.has(a.url))
      .map((a) => {
        const countryCode = a.country?.toUpperCase() || "";
        const centroid = COUNTRY_CENTROIDS[countryCode] || { lat: 0, lng: 0 };
        return {
          Event_title: a.title,
          Event_img: a.image_url || "",
          Event_longitude: centroid.lng,
          event_latitude: centroid.lat,
          event_country: countryCode,
          event_summary: a.summary || "",
          event_category: a.topic || "General",
          Article_link: a.url,
          impact_score: a.impact_hint.impact,
          Impact_reason: `Estimated from sentiment: ${a.sentiment || "Unknown"}`,
          impact_color: a.impact_hint.color,
          Relevant_stocks:
            a.entities?.length > 0
              ? a.entities.slice(0, 3).map((e: any) => ({
                  ticker: e.ticker || null,
                  name: e.name || e.entity_name || "Unknown",
                }))
              : [{ ticker: null, name: a.topic || "Unknown" }],
          event_date: date,
        };
      });

    // Combine Gemini events with fallback events
    const allEvents = [...geminiEvents, ...fallbackEvents];

    console.log(`✅ Time Machine: Generated ${allEvents.length} events for ${date} (${geminiEvents.length} from Gemini, ${allEvents.length - geminiEvents.length} fallback)`);
    console.log("📘 Sample event:", allEvents[0]);
    
    return NextResponse.json(allEvents);
    
  } catch (err) {
    console.error("❌ Error in Time Machine API:", err);
    return NextResponse.json(
      { error: 'Failed to fetch historical events' },
      { status: 500 }
    );
  }
}
