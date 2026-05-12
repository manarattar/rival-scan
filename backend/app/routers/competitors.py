import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Competitor, Update
from ..schemas import CompetitorCreate, CompetitorResponse
from ..services.ai_analyzer import analyze_update
from ..services.fetcher import fetch_updates

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/competitors", tags=["competitors"])


def _enrich(competitor: Competitor, db: Session) -> CompetitorResponse:
    count = db.query(Update).filter(Update.competitor_id == competitor.id).count()
    data = CompetitorResponse.model_validate(competitor)
    data.update_count = count
    return data


@router.get("", response_model=List[CompetitorResponse])
def list_competitors(db: Session = Depends(get_db)):
    """Return all tracked competitors ordered by creation date, newest first."""
    competitors = db.query(Competitor).order_by(Competitor.created_at.desc()).all()
    return [_enrich(c, db) for c in competitors]


@router.post("", response_model=CompetitorResponse, status_code=201)
def create_competitor(
    body: CompetitorCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Create a new competitor and kick off a background fetch of its updates."""
    competitor = Competitor(**body.model_dump())
    db.add(competitor)
    db.commit()
    db.refresh(competitor)
    background_tasks.add_task(_fetch_and_store, competitor.id)
    return _enrich(competitor, db)


@router.delete("/{competitor_id}", status_code=204)
def delete_competitor(competitor_id: int, db: Session = Depends(get_db)):
    """Delete a competitor and all its associated updates; 404 if not found, 403 if demo."""
    competitor = db.query(Competitor).filter(Competitor.id == competitor_id).first()
    if not competitor:
        raise HTTPException(status_code=404, detail="Competitor not found")
    if competitor.is_demo:
        raise HTTPException(
            status_code=403, detail="Demo competitors cannot be deleted"
        )
    db.delete(competitor)
    db.commit()


@router.post("/refresh-all")
def refresh_all_competitors(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Trigger a background re-fetch for every competitor. Used by the scheduled cron job."""
    competitors = db.query(Competitor).all()
    for competitor in competitors:
        competitor.fetch_status = "fetching"
        background_tasks.add_task(_fetch_and_store, competitor.id)
    db.commit()
    return {"queued": len(competitors)}


@router.post("/{competitor_id}/refresh", response_model=CompetitorResponse)
def refresh_competitor(
    competitor_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Trigger a background re-fetch for an existing competitor; 404 if not found."""
    competitor = db.query(Competitor).filter(Competitor.id == competitor_id).first()
    if not competitor:
        raise HTTPException(status_code=404, detail="Competitor not found")
    background_tasks.add_task(_fetch_and_store, competitor_id)
    competitor.fetch_status = "fetching"
    db.commit()
    db.refresh(competitor)
    return _enrich(competitor, db)


def _fetch_and_store(competitor_id: int):
    from ..database import SessionLocal

    db = SessionLocal()
    try:
        competitor = db.query(Competitor).filter(Competitor.id == competitor_id).first()
        if not competitor:
            return
        competitor.fetch_status = "fetching"
        db.commit()

        raw_updates = fetch_updates(competitor)

        existing_titles = {
            u.title
            for u in db.query(Update.title)
            .filter(Update.competitor_id == competitor_id)
            .all()
        }

        new_count = 0
        for i, raw in enumerate(raw_updates):
            if raw["title"] in existing_titles:
                continue
            analysis = analyze_update(raw["title"], raw.get("content_raw", ""), i)
            update = Update(
                competitor_id=competitor_id,
                title=raw["title"],
                content_raw=raw.get("content_raw", ""),
                url=raw.get("url", ""),
                published_at=raw.get("published_at"),
                source_type=raw.get("source_type", "unknown"),
                ai_summary=analysis["ai_summary"],
                category=analysis["category"],
                impact=analysis["impact"],
            )
            db.add(update)
            new_count += 1

        competitor.fetch_status = "ok"
        competitor.last_fetched_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()
    except Exception as e:
        logger.error("Fetch/store error for competitor %s: %s", competitor_id, e)
        try:
            competitor = (
                db.query(Competitor).filter(Competitor.id == competitor_id).first()
            )
            if competitor:
                competitor.fetch_status = "error"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
