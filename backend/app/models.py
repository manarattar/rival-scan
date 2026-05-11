from datetime import datetime, timezone

from sqlalchemy import (Boolean, Column, DateTime, ForeignKey, Integer, String,
                        Text)
from sqlalchemy.orm import relationship

from .database import Base


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    website_url = Column(String, nullable=False)
    changelog_url = Column(String, nullable=True)
    github_repo = Column(String, nullable=True)
    rss_url = Column(String, nullable=True)
    logo_emoji = Column(String, default="🏢")
    color = Column(String, default="#6366f1")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_utcnow)
    last_fetched_at = Column(DateTime, nullable=True)
    fetch_status = Column(String, default="pending")  # pending/fetching/ok/error
    is_demo = Column(Boolean, default=False)

    updates = relationship(
        "Update", back_populates="competitor", cascade="all, delete-orphan"
    )


class Update(Base):
    __tablename__ = "updates"

    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, ForeignKey("competitors.id"), nullable=False)
    title = Column(String, nullable=False)
    content_raw = Column(Text, nullable=True)
    url = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=True)
    fetched_at = Column(DateTime, default=_utcnow)
    ai_summary = Column(Text, nullable=True)
    category = Column(String, default="Other")
    impact = Column(String, default="Medium")
    source_type = Column(String, default="unknown")

    competitor = relationship("Competitor", back_populates="updates")
