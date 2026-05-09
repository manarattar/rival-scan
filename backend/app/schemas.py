from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class CompetitorCreate(BaseModel):
    name: str
    website_url: str
    changelog_url: Optional[str] = None
    github_repo: Optional[str] = None
    rss_url: Optional[str] = None
    logo_emoji: Optional[str] = "🏢"
    color: Optional[str] = "#6366f1"
    description: Optional[str] = None


class CompetitorResponse(BaseModel):
    id: int
    name: str
    website_url: str
    changelog_url: Optional[str] = None
    github_repo: Optional[str] = None
    rss_url: Optional[str] = None
    logo_emoji: str
    color: str
    description: Optional[str] = None
    created_at: datetime
    last_fetched_at: Optional[datetime] = None
    fetch_status: str
    is_demo: bool
    update_count: Optional[int] = 0

    class Config:
        from_attributes = True


class UpdateResponse(BaseModel):
    id: int
    competitor_id: int
    competitor_name: Optional[str] = None
    competitor_color: Optional[str] = None
    competitor_emoji: Optional[str] = None
    title: str
    content_raw: Optional[str] = None
    url: Optional[str] = None
    published_at: Optional[datetime] = None
    fetched_at: datetime
    ai_summary: Optional[str] = None
    category: str
    impact: str
    source_type: str

    class Config:
        from_attributes = True


class GapAnalysisRequest(BaseModel):
    your_product_description: str
    competitor_ids: Optional[List[int]] = None


class GapItem(BaseModel):
    feature: str
    competitor: str
    urgency: str
    description: str


class GapAnalysisResponse(BaseModel):
    gaps: List[GapItem]
    summary: str
    top_threats: List[str]
