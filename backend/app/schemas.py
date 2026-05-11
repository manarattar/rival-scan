from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator


class CompetitorCreate(BaseModel):
    name: str
    website_url: str
    changelog_url: Optional[str] = None
    github_repo: Optional[str] = None
    rss_url: Optional[str] = None
    logo_emoji: Optional[str] = "🏢"
    color: Optional[str] = "#6366f1"
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_must_be_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        if len(v) > 100:
            raise ValueError("Name must be 100 characters or fewer")
        return v

    @field_validator("website_url")
    @classmethod
    def website_url_must_be_valid(cls, v: str) -> str:
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            raise ValueError("website_url must start with http:// or https://")
        if len(v) > 500:
            raise ValueError("URL must be 500 characters or fewer")
        return v


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

    @field_validator("your_product_description")
    @classmethod
    def description_must_be_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Product description cannot be empty")
        if len(v) > 1000:
            raise ValueError("Description must be 1000 characters or fewer")
        return v


class GapItem(BaseModel):
    feature: str
    competitor: str
    urgency: str
    description: str


class GapAnalysisResponse(BaseModel):
    gaps: List[GapItem]
    summary: str
    top_threats: List[str]
