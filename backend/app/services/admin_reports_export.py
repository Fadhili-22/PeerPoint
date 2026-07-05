"""On-demand admin report generation (CSV and PDF)."""

from __future__ import annotations

import csv
import io
from dataclasses import dataclass
from datetime import datetime, timezone

from fpdf import FPDF
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import SessionRating, SessionRequest, SessionRequestStatus, User
from app.services.admin_analytics import (
    _build_counsellor_performance,
    _build_top_resources,
)
from app.services.admin_dashboard import get_admin_dashboard


@dataclass
class PlatformSummaryReport:
    generated_at: datetime
    total_students: int
    total_counsellors: int
    monthly_active_students: int
    sessions_pending: int
    sessions_accepted: int
    sessions_rejected: int
    sessions_completed: int
    ratings_total: int
    ratings_average_stars: float | None
    published_resources: int
    top_resources: list


@dataclass
class CounsellorPerformanceReportRow:
    name: str
    email: str
    sessions_completed: int
    response_rate: int
    average_rating: float | None
    ratings_count: int
    status: str


def _session_status_counts(db: Session) -> dict[str, int]:
    """Session counts by status; aligns with analytics status buckets plus pending."""
    rows = (
        db.query(SessionRequest.status, func.count(SessionRequest.id))
        .group_by(SessionRequest.status)
        .all()
    )
    counts = {status: count for status, count in rows}
    return {
        "pending": counts.get(SessionRequestStatus.pending, 0),
        "accepted": counts.get(SessionRequestStatus.accepted, 0),
        "rejected": counts.get(SessionRequestStatus.rejected, 0),
        "completed": counts.get(SessionRequestStatus.completed, 0),
    }


def _ratings_summary(db: Session) -> tuple[int, float | None]:
    total = db.query(func.count(SessionRating.id)).scalar() or 0
    average = db.query(func.avg(SessionRating.stars)).scalar()
    return total, round(float(average), 2) if average is not None else None


def build_platform_summary_report(db: Session) -> PlatformSummaryReport:
    dashboard = get_admin_dashboard(db)
    session_counts = _session_status_counts(db)
    ratings_total, ratings_average = _ratings_summary(db)
    return PlatformSummaryReport(
        generated_at=datetime.now(timezone.utc),
        total_students=dashboard.total_students,
        total_counsellors=dashboard.total_counsellors,
        monthly_active_students=dashboard.monthly_active_students,
        sessions_pending=session_counts["pending"],
        sessions_accepted=session_counts["accepted"],
        sessions_rejected=session_counts["rejected"],
        sessions_completed=session_counts["completed"],
        ratings_total=ratings_total,
        ratings_average_stars=ratings_average,
        published_resources=dashboard.published_resources,
        top_resources=_build_top_resources(db),
    )


def build_counsellor_performance_report(
    db: Session,
) -> list[CounsellorPerformanceReportRow]:
    now = datetime.now(timezone.utc)
    performance = _build_counsellor_performance(db, now=now)
    if not performance:
        return []

    counsellor_ids = [item.id for item in performance]
    users = {
        user.id: user
        for user in db.query(User).filter(User.id.in_(counsellor_ids)).all()
    }
    rating_rows = (
        db.query(
            SessionRating.counsellor_id,
            func.count(SessionRating.id),
            func.avg(SessionRating.stars),
        )
        .filter(SessionRating.counsellor_id.in_(counsellor_ids))
        .group_by(SessionRating.counsellor_id)
        .all()
    )
    rating_by_counsellor = {
        counsellor_id: (count, avg)
        for counsellor_id, count, avg in rating_rows
    }

    report_rows: list[CounsellorPerformanceReportRow] = []
    for item in performance:
        user = users[item.id]
        ratings_count, average = rating_by_counsellor.get(item.id, (0, None))
        report_rows.append(
            CounsellorPerformanceReportRow(
                name=item.name,
                email=user.email,
                sessions_completed=item.sessions_handled,
                response_rate=item.response_rate,
                average_rating=round(float(average), 2) if average is not None else None,
                ratings_count=ratings_count,
                status="Active" if user.is_active else "Inactive",
            )
        )
    return report_rows


def platform_summary_csv(report: PlatformSummaryReport) -> bytes:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["PeerPoint Platform Summary Report"])
    writer.writerow(["Generated at", report.generated_at.isoformat()])
    writer.writerow([])
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total students", report.total_students])
    writer.writerow(["Total counsellors", report.total_counsellors])
    writer.writerow(["Monthly active students (30 days)", report.monthly_active_students])
    writer.writerow(["Sessions pending", report.sessions_pending])
    writer.writerow(["Sessions accepted", report.sessions_accepted])
    writer.writerow(["Sessions rejected", report.sessions_rejected])
    writer.writerow(["Sessions completed", report.sessions_completed])
    writer.writerow(["Total ratings", report.ratings_total])
    writer.writerow(
        [
            "Average rating (stars)",
            report.ratings_average_stars if report.ratings_average_stars is not None else "",
        ]
    )
    writer.writerow(["Published resources", report.published_resources])
    writer.writerow([])
    writer.writerow(["Top resources"])
    writer.writerow(["Title", "Category", "Views", "Saves"])
    for resource in report.top_resources:
        writer.writerow([resource.title, resource.category, resource.views, resource.saves])
    return buffer.getvalue().encode("utf-8-sig")


def counsellor_performance_csv(rows: list[CounsellorPerformanceReportRow], *, generated_at: datetime) -> bytes:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["PeerPoint Counsellor Performance Report"])
    writer.writerow(["Generated at", generated_at.isoformat()])
    writer.writerow([])
    writer.writerow(
        [
            "Name",
            "Email",
            "Sessions completed",
            "Response rate (%)",
            "Average rating",
            "Ratings count",
            "Account status",
        ]
    )
    for row in rows:
        writer.writerow(
            [
                row.name,
                row.email,
                row.sessions_completed,
                row.response_rate,
                row.average_rating if row.average_rating is not None else "",
                row.ratings_count,
                row.status,
            ]
        )
    return buffer.getvalue().encode("utf-8-sig")


class _ReportPDF(FPDF):
    def __init__(self, title: str):
        super().__init__()
        self.report_title = title

    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.cell(0, 10, self.report_title, new_x="LMARGIN", new_y="NEXT", align="C")

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")


def _pdf_safe(text: str) -> str:
    return text.encode("latin-1", errors="replace").decode("latin-1")


def platform_summary_pdf(report: PlatformSummaryReport) -> bytes:
    pdf = _ReportPDF("Platform Summary Report")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, _pdf_safe(f"Generated: {report.generated_at.strftime('%Y-%m-%d %H:%M UTC')}"), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    summary_rows = [
        ("Total students", str(report.total_students)),
        ("Total counsellors", str(report.total_counsellors)),
        ("Monthly active students (30 days)", str(report.monthly_active_students)),
        ("Sessions pending", str(report.sessions_pending)),
        ("Sessions accepted", str(report.sessions_accepted)),
        ("Sessions rejected", str(report.sessions_rejected)),
        ("Sessions completed", str(report.sessions_completed)),
        ("Total ratings", str(report.ratings_total)),
        (
            "Average rating (stars)",
            str(report.ratings_average_stars) if report.ratings_average_stars is not None else "N/A",
        ),
        ("Published resources", str(report.published_resources)),
    ]
    col_w = (90, 90)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(col_w[0], 8, "Metric", border=1)
    pdf.cell(col_w[1], 8, "Value", border=1, new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    for label, value in summary_rows:
        pdf.cell(col_w[0], 8, _pdf_safe(label), border=1)
        pdf.cell(col_w[1], 8, _pdf_safe(value), border=1, new_x="LMARGIN", new_y="NEXT")

    pdf.ln(6)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 8, "Top resources", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "B", 9)
    headers = ["Title", "Category", "Views", "Saves"]
    widths = [70, 45, 25, 25]
    for header, width in zip(headers, widths):
        pdf.cell(width, 8, header, border=1)
    pdf.ln()
    pdf.set_font("Helvetica", "", 9)
    for resource in report.top_resources:
        pdf.cell(widths[0], 8, _pdf_safe(resource.title[:40]), border=1)
        pdf.cell(widths[1], 8, _pdf_safe(resource.category[:24]), border=1)
        pdf.cell(widths[2], 8, str(resource.views), border=1)
        pdf.cell(widths[3], 8, str(resource.saves), border=1, new_x="LMARGIN", new_y="NEXT")

    out = pdf.output()
    return bytes(out) if not isinstance(out, bytes) else out


def counsellor_performance_pdf(
    rows: list[CounsellorPerformanceReportRow], *, generated_at: datetime
) -> bytes:
    pdf = _ReportPDF("Counsellor Performance Report")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, _pdf_safe(f"Generated: {generated_at.strftime('%Y-%m-%d %H:%M UTC')}"), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    headers = [
        "Name",
        "Email",
        "Sessions",
        "Response %",
        "Avg rating",
        "Ratings",
        "Status",
    ]
    widths = [28, 42, 18, 22, 22, 18, 18]
    pdf.set_font("Helvetica", "B", 8)
    for header, width in zip(headers, widths):
        pdf.cell(width, 8, header, border=1)
    pdf.ln()
    pdf.set_font("Helvetica", "", 8)
    for row in rows:
        pdf.cell(widths[0], 8, _pdf_safe(row.name[:18]), border=1)
        pdf.cell(widths[1], 8, _pdf_safe(row.email[:28]), border=1)
        pdf.cell(widths[2], 8, str(row.sessions_completed), border=1)
        pdf.cell(widths[3], 8, str(row.response_rate), border=1)
        pdf.cell(
            widths[4],
            8,
            str(row.average_rating) if row.average_rating is not None else "N/A",
            border=1,
        )
        pdf.cell(widths[5], 8, str(row.ratings_count), border=1)
        pdf.cell(widths[6], 8, row.status, border=1, new_x="LMARGIN", new_y="NEXT")

    out = pdf.output()
    return bytes(out) if not isinstance(out, bytes) else out
