from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.dependencies import require_admin
from app.models import User
from app.services.admin_analytics import get_admin_analytics

router = APIRouter(prefix="/admin/reports", tags=["Admin Reports"])


@router.get("/analytics", response_model=schemas.AdminAnalyticsResponse)
def get_analytics_report(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_analytics(db)


@router.get("/trends", response_model=schemas.SessionTrendResponse)
def get_trends_report(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_analytics(db).session_trend


@router.get("/sessions", response_model=schemas.StatusDistributionResponse)
def get_sessions_report(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_analytics(db).status_distribution


@router.get("/resources", response_model=list[schemas.TopResourceItem])
def get_resources_report(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_analytics(db).top_resources


@router.get("/exports")
def get_exports_report(_: User = Depends(require_admin)):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Report export is not implemented yet",
    )
