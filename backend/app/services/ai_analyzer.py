import json
import logging
import re
import time
from typing import Dict

from openai import OpenAI

from ..config import get_settings

logger = logging.getLogger(__name__)

MOCK_SUMMARIES = [
    {
        "ai_summary": "Launches a new API endpoint enabling real-time streaming responses, reducing latency by up to 60% for interactive applications.",
        "category": "Feature",
        "impact": "High",
    },
    {
        "ai_summary": "Reduces pricing for standard tier by 20%, making the product more accessible to smaller teams and indie developers.",
        "category": "Pricing",
        "impact": "High",
    },
    {
        "ai_summary": "Fixes a bug where webhook delivery would silently fail under high load conditions, improving reliability for production integrations.",
        "category": "Fix",
        "impact": "Medium",
    },
    {
        "ai_summary": "Adds native Slack and Microsoft Teams integration, allowing teams to receive automated alerts without custom webhook setup.",
        "category": "Integration",
        "impact": "Medium",
    },
    {
        "ai_summary": "Announces deprecation of v1 API endpoints effective in 90 days, with migration guide provided for all affected endpoints.",
        "category": "Deprecation",
        "impact": "High",
    },
    {
        "ai_summary": "Improves dashboard load time by 40% through optimized query caching and lazy loading of non-critical UI components.",
        "category": "Feature",
        "impact": "Low",
    },
    {
        "ai_summary": "Introduces role-based access control (RBAC) with granular permissions, enabling enterprise teams to enforce least-privilege policies.",
        "category": "Feature",
        "impact": "High",
    },
    {
        "ai_summary": "Expands data residency options to include EU and APAC regions, addressing compliance requirements for GDPR and local data laws.",
        "category": "Announcement",
        "impact": "High",
    },
]

ANALYZE_PROMPT = """Analyze this competitor product update and return a JSON object with exactly these fields:

- "ai_summary": 1-2 sentence plain English summary of what changed and why it matters to competitors (max 200 chars)
- "category": exactly one of: Feature, Fix, Pricing, Integration, Deprecation, Announcement, Other
- "impact": exactly one of: High, Medium, Low

Title: {title}
Content: {content}

Return ONLY valid JSON, no markdown, no explanation."""

GAP_ANALYSIS_PROMPT = """You are a competitive intelligence analyst. Based on recent competitor updates below, identify strategic gaps for this product.

Your product: {your_product}

Recent competitor updates:
{updates_text}

Return ONLY valid JSON with this structure:
{{
  "gaps": [
    {{
      "feature": "specific feature/capability name",
      "competitor": "which competitor has it",
      "urgency": "High|Medium|Low",
      "description": "1-2 sentences on why this matters and what to build"
    }}
  ],
  "summary": "2-3 sentence strategic overview of the competitive landscape",
  "top_threats": ["threat1", "threat2", "threat3"]
}}

Return 3-6 gaps maximum. Focus on actionable items."""


def _get_client() -> OpenAI:
    settings = get_settings()
    return OpenAI(
        api_key=settings.openai_api_key or "mock",
        base_url=settings.openai_base_url,
    )


def _call_llm(prompt: str, mock_response: Dict) -> Dict:
    settings = get_settings()
    if settings.use_mock:
        time.sleep(0.05)
        return mock_response

    client = _get_client()
    try:
        resp = client.chat.completions.create(
            model=settings.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=400,
        )
        raw = resp.choices[0].message.content.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return json.loads(raw)
    except Exception as e:
        logger.warning("LLM error: %s", e)
        return mock_response


def analyze_update(title: str, content: str, index: int = 0) -> Dict:
    """Classify and summarise a competitor update, sanitising category and impact to whitelists."""
    mock = MOCK_SUMMARIES[index % len(MOCK_SUMMARIES)]
    prompt = ANALYZE_PROMPT.format(
        title=title[:200],
        content=(content or "")[:800],
    )
    result = _call_llm(prompt, mock)
    return {
        "ai_summary": str(result.get("ai_summary", mock["ai_summary"]))[:500],
        "category": result.get("category", "Other")
        if result.get("category")
        in [
            "Feature",
            "Fix",
            "Pricing",
            "Integration",
            "Deprecation",
            "Announcement",
            "Other",
        ]
        else "Other",
        "impact": result.get("impact", "Medium")
        if result.get("impact") in ["High", "Medium", "Low"]
        else "Medium",
    }


def run_gap_analysis(your_product: str, updates: list) -> Dict:
    """Identify competitive gaps by comparing recent competitor updates against the given product description."""
    mock_gap = {
        "gaps": [
            {
                "feature": "Real-time collaboration",
                "competitor": "Competitor A",
                "urgency": "High",
                "description": "Competitor A launched live multiplayer editing. Teams expect this as table stakes now.",
            },
            {
                "feature": "AI-powered onboarding",
                "competitor": "Competitor B",
                "urgency": "Medium",
                "description": "Competitor B uses LLMs to generate personalized onboarding flows. Reduces time-to-value significantly.",
            },
            {
                "feature": "Usage-based pricing tier",
                "competitor": "Competitor A",
                "urgency": "High",
                "description": "Competitor A cut prices 20% and added pay-as-you-go. You risk losing cost-sensitive customers.",
            },
        ],
        "summary": "Competitors are aggressively investing in collaboration features and price reductions. The gap in real-time features and pricing flexibility poses the highest near-term risk to your market position.",
        "top_threats": [
            "Price erosion from Competitor A's 20% reduction",
            "Real-time collaboration now an expected feature",
            "AI-assisted onboarding reducing competitor churn",
        ],
    }

    if not updates:
        return mock_gap

    updates_text = "\n".join(
        f"- [{u.get('competitor_name', 'Unknown')}] {u.get('title', '')}: {u.get('ai_summary') or u.get('content_raw', '')[:150]}"
        for u in updates[:20]
    )

    prompt = GAP_ANALYSIS_PROMPT.format(
        your_product=your_product[:500],
        updates_text=updates_text,
    )
    return _call_llm(prompt, mock_gap)
