"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

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

export function DashboardView() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [industry, setIndustry] = useState<string>("All")

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
            <Button variant="default" disabled title="Coming soon">
              Summarize article
            </Button>
          </div>
        </div>

        {/* Error/Loading */}
        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}
        {loading && (
          <div className="text-sm text-muted-foreground">Loading news…</div>
        )}

        {/* Articles list */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <a key={a.uuid} href={a.url} target="_blank" rel="noreferrer" className="group">
              <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
                <div className="aspect-[16/9] bg-muted overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.image_url || "/vercel.svg"}
                    alt={a.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{a.category || "Other"}</Badge>
                  </div>
                  <h3 className="font-semibold leading-snug line-clamp-2">
                    {a.title}
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    <span>By {a.source || "Unknown"}</span>
                    <span className="mx-1">•</span>
                    <time dateTime={a.published_at}>
                      {new Date(a.published_at).toLocaleString()}
                    </time>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>

        {!loading && !error && filtered.length === 0 && (
          <div className="text-sm text-muted-foreground">No articles found.</div>
        )}
      </div>
    </div>
  )
}
