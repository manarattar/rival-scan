from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Competitor, Update
from ..schemas import UpdateResponse

router = APIRouter(prefix="/updates", tags=["updates"])


def _enrich_update(update: Update, db: Session) -> UpdateResponse:
    data = UpdateResponse.model_validate(update)
    comp = db.query(Competitor).filter(Competitor.id == update.competitor_id).first()
    if comp:
        data.competitor_name = comp.name
        data.competitor_color = comp.color
        data.competitor_emoji = comp.logo_emoji
    return data


@router.get("", response_model=List[UpdateResponse])
def list_updates(
    competitor_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    impact: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    """List updates with optional filters for competitor, category, and impact."""
    q = db.query(Update)
    if competitor_id is not None:
        q = q.filter(Update.competitor_id == competitor_id)
    if category:
        q = q.filter(Update.category == category)
    if impact:
        q = q.filter(Update.impact == impact)
    updates = q.order_by(Update.fetched_at.desc()).limit(limit).all()
    return [_enrich_update(u, db) for u in updates]
