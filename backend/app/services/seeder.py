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
        "description": "Leading AI lab behind GPT-4, DALL-E, and Whisper.",
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
]

DEMO_UPDATES = [
    {
        "competitor_index": 0,
        "title": "GPT-4o mini pricing reduced by 60%",
        "content_raw": (
            "We are reducing the price of GPT-4o mini by 60% for both input and output tokens. "
            "This makes it our most cost-efficient model for high-volume applications."
        ),
        "ai_summary": (
            "OpenAI slashes GPT-4o mini pricing by 60%, making it significantly cheaper "
            "for high-volume API users and startups."
        ),
        "category": "Pricing",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 2,
    },
    {
        "competitor_index": 0,
        "title": "Structured outputs now GA",
        "content_raw": (
            "Structured outputs is now generally available. This feature guarantees that "
            "model responses conform exactly to your supplied JSON Schema."
        ),
        "ai_summary": (
            "OpenAI makes Structured Outputs GA, ensuring GPT-4o responses strictly "
            "follow JSON Schema — eliminates parsing errors in production."
        ),
        "category": "Feature",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 5,
    },
    {
        "competitor_index": 1,
        "title": "Claude 3.5 Sonnet — new capabilities",
        "content_raw": (
            "Claude 3.5 Sonnet brings major upgrades including computer use in beta, "
            "200K context window improvements, and new tool use features."
        ),
        "ai_summary": (
            "Anthropic releases Claude 3.5 Sonnet with computer-use capability (beta), "
            "directly competing with AI agent frameworks."
        ),
        "category": "Feature",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 8,
    },
    {
        "competitor_index": 1,
        "title": "Prompt caching now available",
        "content_raw": (
            "Prompt caching lets you cache frequently used context, reducing costs by up to 90% "
            "and latency by up to 85% for repeated prompts."
        ),
        "ai_summary": (
            "Anthropic launches prompt caching — up to 90% cost reduction for repeated "
            "prompts, major advantage for long-context applications."
        ),
        "category": "Feature",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 12,
    },
    {
        "competitor_index": 2,
        "title": "Transformers 4.45 released",
        "content_raw": (
            "This release adds support for Llama 3.2 Vision models, improves quantization "
            "support, and fixes numerous bugs in tokenization."
        ),
        "ai_summary": (
            "Hugging Face Transformers 4.45 adds Llama 3.2 Vision support and better "
            "quantization — key update for open-source model deployments."
        ),
        "category": "Feature",
        "impact": "Medium",
        "source_type": "github",
        "days_ago": 3,
    },
    {
        "competitor_index": 2,
        "title": "Inference Endpoints price reduction",
        "content_raw": (
            "We're reducing prices on Inference Endpoints by up to 30% across all hardware tiers, "
            "making dedicated model hosting more accessible."
        ),
        "ai_summary": (
            "Hugging Face cuts Inference Endpoints pricing by up to 30%, increasing "
            "competitive pressure on managed AI inference providers."
        ),
        "category": "Pricing",
        "impact": "Medium",
        "source_type": "rss",
        "days_ago": 15,
    },
    {
        "competitor_index": 3,
        "title": "Mistral Large 2 released",
        "content_raw": (
            "Mistral Large 2 is our most capable model yet, with 128k context, "
            "multilingual support, and function calling. Available via API and open weights."
        ),
        "ai_summary": (
            "Mistral releases Large 2 with 128k context and open weights — rare "
            "combination of frontier capability with open-source availability."
        ),
        "category": "Announcement",
        "impact": "High",
        "source_type": "rss",
        "days_ago": 6,
    },
    {
        "competitor_index": 3,
        "title": "Mistral API — function calling improved",
        "content_raw": (
            "We've significantly improved function calling reliability, with parallel tool calls "
            "now supported and a 40% reduction in hallucinated function invocations."
        ),
        "ai_summary": (
            "Mistral improves function calling with parallel tool support and 40% fewer "
            "hallucinations — strengthens position in agentic AI use cases."
        ),
        "category": "Feature",
        "impact": "Medium",
        "source_type": "rss",
        "days_ago": 20,
    },
]


def seed_demo_data(db: Session) -> None:
    if db.query(Competitor).filter(Competitor.is_demo.is_(True)).count() > 0:
        return

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
