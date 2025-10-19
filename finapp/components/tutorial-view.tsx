"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"
import {
	BookOpen,
	TrendingUp,
	Newspaper,
	Globe2,
	ChevronRight,
	PlayCircle,
	LineChart,
	BarChart3,
	Sparkles,
} from "lucide-react"
import GeminiChat from "@/components/gemini-chat"

interface Lesson {
  id: string
  title: string
  tag?: string
  summary: string
  icon: LucideIcon
  content: React.ReactNode
}

const lessonsData: Lesson[] = [
	{
		id: "intro-trading",
		title: "Intro to trading",
		tag: "Basics",
		summary: "What trading means and common approaches.",
		icon: TrendingUp,
		content: (
			<div className="space-y-4">
				<p>
					Trading is buying and selling assets (like stocks) to reach goals such as growth or income. Time horizon
					matters: minutes to years.
				</p>
				<ul className="list-disc pl-5 space-y-2">
					<li>
						<strong>Long‑term</strong>: Focus on business results and compounding.
					</li>
					<li>
						<strong>Short‑term</strong>: Reacts quickly to news and data.
					</li>
					<li>
						<strong>Orders</strong>: Market (instant) vs. Limit (your price).
					</li>
					<li>
						<strong>Risk</strong>: Diversify and use position sizing you’re comfortable with.
					</li>
				</ul>
				<div className="rounded-md bg-muted p-4 text-sm">
					Example: Place a simulated <strong>limit order</strong> instead of a market order when liquidity is low to
					control your entry price.
				</div>
				<div className="flex items-start gap-2 rounded-md border p-3">
					<PlayCircle className="mt-0.5 h-4 w-4 text-primary" />
					<div className="text-sm">
						Try it: On the <strong>News</strong> tab, search for "earnings" and press <strong>Summarize</strong> on a
						headline. Note how short‑term traders react to earnings surprises.
					</div>
				</div>
			</div>
		),
	},
	{
		id: "intro-market",
		title: "Intro to market",
		tag: "Basics",
		summary: "What a market is and why prices move.",
		icon: BarChart3,
		content: (
			<div className="space-y-4">
				<p>
					Markets are where buyers and sellers meet to exchange assets. Prices move with supply, demand, and
					expectations about the future.
				</p>
				<div className="rounded-md bg-muted p-4 text-sm">
					News changes expectations about profits, growth, or risk — that’s why headlines can move prices.
				</div>
				<div className="flex items-start gap-2 rounded-md border p-3">
					<PlayCircle className="mt-0.5 h-4 w-4 text-primary" />
					<div className="text-sm">
						Try it: Use the <strong>Industry</strong> filter on the News page to compare sentiment shifts across
						sectors (e.g., Technology vs. Energy) for the same keyword.
					</div>
				</div>
			</div>
		),
	},
	{
		id: "intro-stock",
		title: "Intro to stock",
		tag: "Basics",
		summary: "What a stock represents and key terms.",
		icon: LineChart,
		content: (
			<div className="space-y-4">
				<p>
					A stock is ownership in a company. Share prices reflect the market’s view of future cash flows,
					competitiveness, and risk.
				</p>
				<ul className="list-disc pl-5 space-y-2">
					<li>
						<strong>Ticker</strong>: Short symbol (e.g., AAPL).
					</li>
					<li>
						<strong>Market cap</strong>: Company size by value of shares.
					</li>
					<li>
						<strong>Earnings</strong>: Report card that often moves prices.
					</li>
				</ul>
				<div className="rounded-md bg-muted p-4 text-sm">
					Example: When a large‑cap stock like <strong>AAPL</strong> reports earnings above expectations, indexes can
					move with it due to index weighting.
				</div>
			</div>
		),
	},
	{
		id: "intro-news",
		title: "Intro to article news & price impact",
		tag: "Guide",
		summary: "How headlines affect markets and how to use our News page.",
		icon: Newspaper,
		content: (
			<div className="space-y-4">
				<p>
					News can change expectations about revenue, costs, or risk. That shift moves prices.
				</p>
				<ol className="list-decimal pl-5 space-y-2">
					<li>
						Open the <strong>News</strong> page. Use the search bar and <em>Industry</em> filter to focus.
					</li>
					<li>
						Click an article to read the source, or press <strong>Summarize</strong> to open the AI panel.
					</li>
					<li>
						<strong>Drag & drop</strong> a headline/card into the AI chat to prefill a summary request.
					</li>
					<li>
						The AI produces a clear summary, explains market meaning, and highlights sector/stock impact.
					</li>
				</ol>
				<div className="rounded-md bg-muted p-4 text-sm">
					Tip: The AI uses grounded web search from the article link to keep answers current.
				</div>
				<div className="flex items-start gap-2 rounded-md border p-3">
					<PlayCircle className="mt-0.5 h-4 w-4 text-primary" />
					<div className="text-sm">
						Example from the app: Drag a semiconductor headline into chat and ask “Who could benefit/lose?” The
						summary will surface tickers and catalysts.
					</div>
				</div>
			</div>
		),
	},
	{
		id: "map-tutorial",
		title: "Map Tutorial",
		tag: "Guide",
		summary: "Explore global events and their locations.",
		icon: Globe2,
		content: (
			<div className="space-y-4">
				<ul className="list-disc pl-5 space-y-2">
					<li>Use the globe to see where impactful events occur.</li>
					<li>Hover or select a point to read a short description.</li>
					<li>Use the list to the right to browse recent events.</li>
				</ul>
				<div className="rounded-md bg-muted p-4 text-sm">
					Example: Zoom into a region after a supply‑chain disruption to see affected hubs and nearby companies.
				</div>
			</div>
		),
	},
]

export function TutorialView() {
	const [active, setActive] = useState<string>(lessonsData[0].id)

	const activeLesson = useMemo(() => lessonsData.find((l) => l.id === active)!, [active])
	const index = useMemo(() => lessonsData.findIndex((l) => l.id === active), [active])
	const total = lessonsData.length
	const progress = ((index + 1) / total) * 100

  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined)

  const goNext = () => {
		if (index < total - 1) {
			setActive(lessonsData[index + 1].id)
		}
	}

  const handleAskAI = () => {
    const lesson = lessonsData[index]
    const prompt = `Teach me more about: ${lesson.title}. Use simple bullets and give 2 practical examples related to this app.`
    setChatPrompt(prompt)
    setChatOpen(true)
  }

	return (
		<div className="h-full w-full overflow-auto bg-gradient-to-b from-background to-muted/20">
			<div className="container mx-auto p-6">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
					{/* Sidebar */}
					<Card className="md:col-span-4 lg:col-span-3 p-0 h-[70vh] sticky top-6">
						<ScrollArea className="h-full">
							<div className="p-4 space-y-2">
								<h3 className="text-sm font-semibold text-muted-foreground mb-2">Mini lessons</h3>
								{lessonsData.map((l) => (
									<button
										key={l.id}
										onClick={() => setActive(l.id)}
										className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent/60 transition ${active === l.id ? "bg-accent" : ""}`}
									>
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-2">
												<l.icon className="h-4 w-4 text-primary" />
												<span className="font-medium">{l.title}</span>
											</div>
											{l.tag && <Badge variant="secondary">{l.tag}</Badge>}
										</div>
										<p className="text-xs text-muted-foreground mt-1 line-clamp-2">{l.summary}</p>
									</button>
								))}
							</div>
						</ScrollArea>
					</Card>

					{/* Content */}
					<Card className="md:col-span-8 lg:col-span-9 p-6 min-h-[70vh]">
						{/* Header with icon and progress */}
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<activeLesson.icon className="h-6 w-6 text-primary" />
								<div>
									<h2 className="text-xl font-semibold leading-tight">{activeLesson.title}</h2>
									{activeLesson.tag ? (
										<div className="mt-1">
											<Badge variant="secondary">{activeLesson.tag}</Badge>
										</div>
									) : null}
								</div>
							</div>
							<div className="text-xs text-muted-foreground">Lesson {index + 1} of {total}</div>
						</div>
						<div className="mb-6">
							<div className="h-2 w-full rounded bg-muted">
								<div
									className="h-2 rounded bg-primary transition-all"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>

						<div className="prose prose-slate dark:prose-invert max-w-none">
							{activeLesson.content}
						</div>

            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" onClick={handleAskAI}>
                <Sparkles className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
							<div className="flex items-center justify-end">
								<Button onClick={goNext} disabled={index >= total - 1}>
									Next
									<ChevronRight className="ml-1 h-4 w-4" />
								</Button>
							</div>
            </div>
					</Card>
				</div>
			</div>

      {/* Gemini Chat */}
      <GeminiChat open={chatOpen} onOpenChange={setChatOpen} initialPrompt={chatPrompt} />
		</div>
	)
}

export default TutorialView
