from datetime import datetime, timezone
from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.dependencies import require_admin
from app.models import User
from app.services.admin_analytics import get_admin_analytics
from app.services.admin_reports_export import (
    build_counsellor_performance_report,
    build_platform_summary_report,
    counsellor_performance_csv,
    counsellor_performance_pdf,
    platform_summary_csv,
    platform_summary_pdf,
)

router = APIRouter(prefix="/admin/reports", tags=["Admin Reports"])


class ReportFormat(str, Enum):
    pdf = "pdf"
    csv = "csv"


def _file_response(*, content: bytes, filename: str, media_type: str) -> Response:
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


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


@router.get("/platform-summary")
def download_platform_summary_report(
    format: ReportFormat = Query(..., description="Export format: pdf or csv"),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    report = build_platform_summary_report(db)
    stamp = report.generated_at.strftime("%Y%m%d-%H%M%S")
    if format == ReportFormat.csv:
        return _file_response(
            content=platform_summary_csv(report),
            filename=f"platform-summary-{stamp}.csv",
            media_type="text/csv; charset=utf-8",
        )
    if format == ReportFormat.pdf:
        return _file_response(
            content=platform_summary_pdf(report),
            filename=f"platform-summary-{stamp}.pdf",
            media_type="application/pdf",
        )
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail="Unsupported format",
    )


@router.get("/counsellor-performance")
def download_counsellor_performance_report(
    format: ReportFormat = Query(..., description="Export format: pdf or csv"),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    generated_at = datetime.now(timezone.utc)
    rows = build_counsellor_performance_report(db)
    stamp = generated_at.strftime("%Y%m%d-%H%M%S")
    if format == ReportFormat.csv:
        return _file_response(
            content=counsellor_performance_csv(rows, generated_at=generated_at),
            filename=f"counsellor-performance-{stamp}.csv",
            media_type="text/csv; charset=utf-8",
        )
    if format == ReportFormat.pdf:
        return _file_response(
            content=counsellor_performance_pdf(rows, generated_at=generated_at),
            filename=f"counsellor-performance-{stamp}.pdf",
            media_type="application/pdf",
        )
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail="Unsupported format",
    )
