"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import GeminiChat from "@/components/gemini-chat"

const ARTICLE_MIME = 'application/vnd.finhk.article+json'

interface Article {
  uuid: string
  title: string
  description?: string
  url: string
  published_at: string
  source: string // treat as author/source
  category: string // used as industry tag
  image_url?: string
}

const SUMMARY_PROMPT_TEMPLATE = `You are a friendly financial explainer bot for a market news website.
Your goal is to help everyday readers understand what a financial or economic news article means — without using confusing jargon.

When the user provides a headline or article text, do the following:

1. 📰 Give a short summary in plain English (2–4 sentences).
2. 💬 Explain what the news means for the economy or the stock market — describe it like you’re talking to a friend, not a trader.
3. 📈 If companies, sectors, or stocks are mentioned, explain how they might be affected (positive, negative, or mixed).
4. 💡 End with a simple takeaway — what’s the big idea or why it matters.

Tone & Style:
- Write clearly, like you’re teaching someone new to finance.
- Avoid buzzwords (e.g., say “stock prices could fall” instead of “bearish sentiment”).
- Be factual and educational, not predictive or advisory.
- Use emojis or headers (📰 📊 💡) to make it easy to read.

Important:
- Summarize the full article content, not just the headline.
- Use the URL to ground your response and rely on the article body.
`;

export function DashboardView() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [industry, setIndustry] = useState<string>("All")
  const [chatOpen, setChatOpen] = useState(false)
  const [seedPrompt, setSeedPrompt] = useState<string | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/news?limit=50`)
        if (!res.ok) {
          const text = await res.text().catch(() => "")
          throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`)
        }
        const json = await res.json()
        if (!cancelled) {
          const items: Article[] = Array.isArray(json?.data) ? json.data : []
          setArticles(items)
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load news")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const industries = useMemo(() => {
    const set = new Set<string>(["All"]) 
    for (const a of articles) set.add(a.category || "Other")
    return Array.from(set)
  }, [articles])

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const byIndustry = industry === "All" || (a.category || "Other") === industry
      const q = query.trim().toLowerCase()
      const byQuery = !q || a.title.toLowerCase().includes(q) || (a.description || "").toLowerCase().includes(q)
      return byIndustry && byQuery
    })
  }, [articles, industry, query])

  const handleSummarize = (article?: Article) => {
    const details = article
      ? `URL: ${article.url}` + (article.description ? `\nExcerpt: ${article.description}` : "")
      : `URL: n/a`;
    const prompt = `${SUMMARY_PROMPT_TEMPLATE}\n${details}`;
    setSeedPrompt(prompt)
    setChatOpen(true)
  }

  const onDragStartArticle = (e: React.DragEvent, a: Article) => {
    // set custom JSON data
    e.dataTransfer.setData(ARTICLE_MIME, JSON.stringify({ title: a.title, url: a.url }))
    // also set uri-list and plain text for broader compatibility
    e.dataTransfer.setData('text/uri-list', a.url)
    e.dataTransfer.setData('text/plain', `Title: ${a.title}\nURL: ${a.url}`)
  }

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News</h1>
          <p className="text-sm text-muted-foreground">Latest articles powered by MarketAux</p>
        </div>

        {/* Search */}
        <div className="w-full">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search headlines..."
            className="h-11"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="industry" className="text-sm text-muted-foreground">Industry</label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div className="sm:ml-auto">
            <Button variant="default" onClick={() => handleSummarize()}>
              Summarize article
            </Button>
          </div>
        </div>

        {/* Error/Loading */}
        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}
        {loading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading news…
          </div>
        )}

        {/* Articles list */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <div key={a.uuid} className="group" draggable onDragStart={(e) => onDragStartArticle(e, a)}>
              <a href={a.url} target="_blank" rel="noreferrer" className="block">
                <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
                  <div className="aspect-[16/9] bg-muted overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image_url || "/vercel.svg"} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{a.category || "Other"}</Badge>
                    </div>
                    <h3 className="font-semibold leading-snug line-clamp-2">{a.title}</h3>
                    <div className="text-xs text-muted-foreground">
                      <span>By {a.source || "Unknown"}</span>
                      <span className="mx-1">•</span>
                      <time dateTime={a.published_at}>{new Date(a.published_at).toLocaleString()}</time>
                    </div>
                  </div>
                </Card>
              </a>
              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleSummarize(a)}>
                  Summarize
                </Button>
              </div>
            </div>
          ))}
        </div>

        {!loading && !error && filtered.length === 0 && (
          <div className="text-sm text-muted-foreground">No articles found.</div>
        )}
      </div>

      {/* Chat sidebar with higher z-index to ensure it can open */}
      <div className="z-[60] relative">
        <GeminiChat open={chatOpen} onOpenChange={setChatOpen} initialPrompt={seedPrompt} />
      </div>
    </div>
  )
}
