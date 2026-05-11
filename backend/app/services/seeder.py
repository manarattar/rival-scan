import os
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from ..models import Competitor, Update

DEMO_COMPETITORS = [
    {
        "name": "OpenAI",
        "website_url": "https://openai.com",
        "changelog_url": "https://platform.openai.com/docs/changelog",
        "github_repo": None,
        "rss_url": None,
        "logo_emoji": "🤖",
        "color": "#10a37f",
        "description": "GPT-4, DALL-E, Whisper — the leading commercial AI lab.",
    },
    {
        "name": "Anthropic",
        "website_url": "https://anthropic.com",
        "changelog_url": "https://docs.anthropic.com/en/release-notes/api",
        "github_repo": None,
        "rss_url": None,
        "logo_emoji": "⚡",
        "color": "#c17940",
        "description": "AI safety company and creator of the Claude model family.",
    },
    {
        "name": "Hugging Face",
        "website_url": "https://huggingface.co",
        "changelog_url": None,
        "github_repo": "huggingface/transformers",
        "rss_url": "https://huggingface.co/blog/feed.xml",
        "logo_emoji": "🤗",
        "color": "#ffd21e",
        "description": "Open-source ML platform hosting 500k+ models and datasets.",
    },
    {
        "name": "Mistral AI",
        "website_url": "https://mistral.ai",
        "changelog_url": None,
        "github_repo": "mistralai/mistral-src",
        "rss_url": None,
        "logo_emoji": "🌊",
        "color": "#ff7000",
        "description": "European AI lab focused on open and efficient language models.",
    },
    {
        "name": "Perplexity",
        "website_url": "https://www.perplexity.ai",
        "changelog_url": None,
        "github_repo": None,
        "rss_url": None,
        "logo_emoji": "🔍",
        "color": "#20b2aa",
        "description": "AI-powered answer engine combining search and LLMs.",
    },
    {
        "name": "Groq",
        "website_url": "https://groq.com",
        "changelog_url": None,
        "github_repo": "groq/groq-python",
        "rss_url": None,
        "logo_emoji": "⚡",
        "color": "#f43f5e",
        "description": "Ultra-fast LLM inference via custom LPU hardware.",
    },
    {
        "name": "Vercel",
        "website_url": "https://vercel.com",
        "changelog_url": "https://vercel.com/changelog",
        "github_repo": None,
        "rss_url": None,
        "logo_emoji": "▲",
        "color": "#ffffff",
        "description": "Frontend cloud platform — Next.js, Edge Functions, AI SDK.",
    },
    {
        "name": "Linear",
        "website_url": "https://linear.app",
        "changelog_url": "https://linear.app/changelog",
        "github_repo": None,
        "rss_url": None,
        "logo_emoji": "📐",
        "color": "#5e6ad2",
        "description": "Modern project management tool built for software teams.",
    },
]

DEMO_UPDATES = [
    # OpenAI
    {
        "competitor_index": 0,
        "title": "GPT-4o mini pricing reduced by 60%",
        "content_raw": "We are reducing the price of GPT-4o mini by 60% for both input and output tokens. This makes it our most cost-efficient model for high-volume applications.",
        "ai_summary": "OpenAI slashes GPT-4o mini pricing by 60%, making it significantly cheaper for high-volume API users and startups.",
        "category": "Pricing",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 2,
    },
    {
        "competitor_index": 0,
        "title": "Structured outputs now GA",
        "content_raw": "Structured outputs is now generally available. This feature guarantees that model responses conform exactly to your supplied JSON Schema.",
        "ai_summary": "OpenAI makes Structured Outputs GA — GPT-4o responses now strictly follow JSON Schema, eliminating parsing errors in production.",
        "category": "Feature",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 5,
    },
    {
        "competitor_index": 0,
        "title": "o3 and o4-mini reasoning models launched",
        "content_raw": "OpenAI releases o3 and o4-mini, the next generation of reasoning models with improved performance on math, coding, and science benchmarks.",
        "ai_summary": "OpenAI launches o3 and o4-mini reasoning models — major capability jump for complex problem-solving and code generation tasks.",
        "category": "Announcement",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 18,
    },
    # Anthropic
    {
        "competitor_index": 1,
        "title": "Claude 3.5 Sonnet — computer use in beta",
        "content_raw": "Claude 3.5 Sonnet brings major upgrades including computer use in beta, 200K context window improvements, and new tool use features.",
        "ai_summary": "Anthropic releases Claude 3.5 Sonnet with computer-use capability (beta), directly competing with AI agent frameworks.",
        "category": "Feature",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 8,
    },
    {
        "competitor_index": 1,
        "title": "Prompt caching cuts costs by up to 90%",
        "content_raw": "Prompt caching lets you cache frequently used context, reducing costs by up to 90% and latency by up to 85% for repeated prompts.",
        "ai_summary": "Anthropic launches prompt caching — up to 90% cost reduction for repeated prompts, major advantage for long-context applications.",
        "category": "Feature",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 12,
    },
    {
        "competitor_index": 1,
        "title": "Claude 3.7 Sonnet — extended thinking mode",
        "content_raw": "Claude 3.7 Sonnet introduces extended thinking, allowing the model to reason through complex problems step by step before responding.",
        "ai_summary": "Anthropic adds extended thinking to Claude 3.7 Sonnet — chain-of-thought reasoning now visible, competing directly with OpenAI o-series.",
        "category": "Feature",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 22,
    },
    # Hugging Face
    {
        "competitor_index": 2,
        "title": "Transformers 4.45 — Llama 3.2 Vision support",
        "content_raw": "This release adds support for Llama 3.2 Vision models, improves quantization support, and fixes numerous bugs in tokenization.",
        "ai_summary": "Hugging Face Transformers 4.45 adds Llama 3.2 Vision support and better quantization — key update for open-source model deployments.",
        "category": "Feature",
        "impact": "Medium",
        "source_type": "github",
        "days_ago": 3,
    },
    {
        "competitor_index": 2,
        "title": "Inference Endpoints price reduction 30%",
        "content_raw": "We're reducing prices on Inference Endpoints by up to 30% across all hardware tiers, making dedicated model hosting more accessible.",
        "ai_summary": "Hugging Face cuts Inference Endpoints pricing by up to 30%, increasing competitive pressure on managed AI inference providers.",
        "category": "Pricing",
        "impact": "Medium",
        "source_type": "rss",
        "days_ago": 15,
    },
    # Mistral
    {
        "competitor_index": 3,
        "title": "Mistral Large 2 — 128k context, open weights",
        "content_raw": "Mistral Large 2 is our most capable model yet, with 128k context, multilingual support, and function calling. Available via API and open weights.",
        "ai_summary": "Mistral releases Large 2 with 128k context and open weights — rare combination of frontier capability with open-source availability.",
        "category": "Announcement",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 6,
    },
    {
        "competitor_index": 3,
        "title": "Parallel function calling with 40% fewer hallucinations",
        "content_raw": "We've significantly improved function calling reliability, with parallel tool calls now supported and a 40% reduction in hallucinated function invocations.",
        "ai_summary": "Mistral improves function calling with parallel tool support and 40% fewer hallucinations — strengthens position in agentic AI use cases.",
        "category": "Feature",
        "impact": "Medium",
        "source_type": "rss",
        "days_ago": 20,
    },
    # Perplexity
    {
        "competitor_index": 4,
        "title": "Perplexity Pro adds real-time web search in AI answers",
        "content_raw": "Perplexity Pro now includes unlimited real-time web search, citations for every claim, and multi-step research mode for complex queries.",
        "ai_summary": "Perplexity Pro expands real-time search with citations and multi-step research — raising the bar for AI-powered information retrieval.",
        "category": "Feature",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 4,
    },
    {
        "competitor_index": 4,
        "title": "Perplexity API now available — $5 per 1k searches",
        "content_raw": "Developers can now access Perplexity's search-augmented LLM via API at $5 per 1,000 requests, with streaming support included.",
        "ai_summary": "Perplexity launches developer API at $5/1k requests — opens search-grounded AI responses to third-party apps for the first time.",
        "category": "Announcement",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 14,
    },
    # Groq
    {
        "competitor_index": 5,
        "title": "Llama 3.1 405B now on GroqCloud at 100+ tok/s",
        "content_raw": "GroqCloud now serves Llama 3.1 405B at over 100 tokens per second, the fastest inference speed available for a frontier open-source model.",
        "ai_summary": "Groq serves Llama 3.1 405B at 100+ tok/s — the fastest inference for any frontier open-source model, pressure on API latency expectations.",
        "category": "Announcement",
        "impact": "High",
        "source_type": "github",
        "days_ago": 7,
    },
    {
        "competitor_index": 5,
        "title": "Free tier expanded — 30 req/min for all models",
        "content_raw": "Groq expands its free tier to 30 requests per minute across all hosted models, making it the most generous free inference tier in the market.",
        "ai_summary": "Groq raises free tier to 30 req/min — most generous free inference offering available, likely to drive rapid developer adoption.",
        "category": "Pricing",
        "impact": "Medium",
        "source_type": "rss",
        "days_ago": 25,
    },
    # Vercel
    {
        "competitor_index": 6,
        "title": "AI SDK 3.0 — unified streaming for all LLM providers",
        "content_raw": "Vercel AI SDK 3.0 introduces a unified streaming API that works across OpenAI, Anthropic, Mistral, and 20+ other providers with a single interface.",
        "ai_summary": "Vercel AI SDK 3.0 unifies LLM streaming across 20+ providers — significantly lowers the barrier to switching or multi-provider AI apps.",
        "category": "Feature",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 9,
    },
    {
        "competitor_index": 6,
        "title": "v0 exits beta — AI UI code generation goes GA",
        "content_raw": "v0 by Vercel is now generally available. Generate React + Tailwind UI components from text prompts, with direct deploy to Vercel.",
        "ai_summary": "Vercel's v0 AI UI generator goes GA — direct competition for frontend developers, lowering the skill floor for building polished UIs.",
        "category": "Announcement",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 17,
    },
    # Linear
    {
        "competitor_index": 7,
        "title": "Linear AI — auto-triage and duplicate detection",
        "content_raw": "Linear now uses AI to automatically triage incoming issues, detect duplicates, and suggest assignees based on past work patterns.",
        "ai_summary": "Linear adds AI-powered issue triage and duplicate detection — reduces manual PM overhead and positions against Jira's AI features.",
        "category": "Feature",
        "impact": "Medium",
        "source_type": "rss",
        "days_ago": 11,
    },
    {
        "competitor_index": 7,
        "title": "Cycles 2.0 — sprints with automatic scope management",
        "content_raw": "Cycles 2.0 brings automatic scope management, carry-over tracking, and team velocity insights to Linear's sprint planning workflow.",
        "ai_summary": "Linear upgrades Cycles with automatic scope management and velocity tracking — direct challenge to Jira and Shortcut for sprint planning.",
        "category": "Feature",
        "impact": "Medium",
        "source_type": "rss",
        "days_ago": 28,
    },
]


def seed_demo_data(db: Session) -> None:
    reseed = os.environ.get("RESEED", "").lower() == "true"
    existing = db.query(Competitor).filter(Competitor.is_demo.is_(True)).count()
    if existing > 0 and not reseed:
        return
    if existing > 0 and reseed:
        demo_ids = [
            r.id
            for r in db.query(Competitor.id).filter(Competitor.is_demo.is_(True)).all()
        ]
        db.query(Update).filter(Update.competitor_id.in_(demo_ids)).delete(
            synchronize_session=False
        )
        db.query(Competitor).filter(Competitor.id.in_(demo_ids)).delete(
            synchronize_session=False
        )
        db.commit()

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    competitors = []
    for c in DEMO_COMPETITORS:
        comp = Competitor(
            **c,
            created_at=now,
            last_fetched_at=now,
            fetch_status="ok",
            is_demo=True,
        )
        db.add(comp)
        competitors.append(comp)
    db.flush()

    for u in DEMO_UPDATES:
        comp = competitors[u["competitor_index"]]
        published = now - timedelta(days=u["days_ago"])
        update = Update(
            competitor_id=comp.id,
            title=u["title"],
            content_raw=u["content_raw"],
            url=comp.website_url,
            published_at=published,
            fetched_at=now,
            ai_summary=u["ai_summary"],
            category=u["category"],
            impact=u["impact"],
            source_type=u["source_type"],
        )
        db.add(update)

    db.commit()
