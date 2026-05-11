import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Update
from ..schemas import GapAnalysisRequest, GapAnalysisResponse
from ..services.ai_analyzer import run_gap_analysis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/gaps", response_model=GapAnalysisResponse)
def gap_analysis(body: GapAnalysisRequest, db: Session = Depends(get_db)):
    """Run LLM-powered gap analysis against recent competitor updates for the given product."""
    try:
        q = db.query(Update).options(joinedload(Update.competitor))
        if body.competitor_ids:
            q = q.filter(Update.competitor_id.in_(body.competitor_ids))
        updates = q.order_by(Update.fetched_at.desc()).limit(30).all()

        updates_with_names = [
            {
                "competitor_name": u.competitor.name if u.competitor else "Unknown",
                "title": u.title,
                "ai_summary": u.ai_summary,
                "content_raw": u.content_raw,
                "category": u.category,
            }
            for u in updates
        ]

        result = run_gap_analysis(body.your_product_description, updates_with_names)

        if not isinstance(result, dict):
            result = {}

        gaps = result.get("gaps", [])
        if not isinstance(gaps, list):
            gaps = []

        return GapAnalysisResponse(
            gaps=gaps,
            summary=result.get("summary", ""),
            top_threats=result.get("top_threats", [])
            if isinstance(result.get("top_threats"), list)
            else [],
        )
    except Exception as e:
        logger.error("Gap analysis error: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
