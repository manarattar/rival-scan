from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Competitor, Update
from ..schemas import GapAnalysisRequest, GapAnalysisResponse
from ..services.ai_analyzer import run_gap_analysis

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/gaps", response_model=GapAnalysisResponse)
def gap_analysis(body: GapAnalysisRequest, db: Session = Depends(get_db)):
    """Run LLM-powered gap analysis against recent competitor updates for the given product."""
    q = db.query(Update)
    if body.competitor_ids:
        q = q.filter(Update.competitor_id.in_(body.competitor_ids))
    updates = q.order_by(Update.fetched_at.desc()).limit(30).all()

    updates_with_names = []
    for u in updates:
        comp = db.query(Competitor).filter(Competitor.id == u.competitor_id).first()
        updates_with_names.append(
            {
                "competitor_name": comp.name if comp else "Unknown",
                "title": u.title,
                "ai_summary": u.ai_summary,
                "content_raw": u.content_raw,
                "category": u.category,
            }
        )

    result = run_gap_analysis(body.your_product_description, updates_with_names)

    gaps = result.get("gaps", [])
    return GapAnalysisResponse(
        gaps=gaps,
        summary=result.get("summary", ""),
        top_threats=result.get("top_threats", []),
    )
