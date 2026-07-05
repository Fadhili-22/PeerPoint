from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.dependencies import require_admin
from app.models import User, UserRole
from app.schemas.enums import (
    BookingSessionStatus,
    CounsellorProfileStatus,
)
from app.services.admin_account_requests import (
    approve_account_request as approve_account_request_service,
    list_account_requests as list_account_requests_service,
    reject_account_request as reject_account_request_service,
)
from app.services.admin_counsellors import (
    demote_counsellor as demote_counsellor_service,
    list_admin_counsellors,
    list_promotable_students,
    list_promotion_candidates,
    toggle_counsellor_active as toggle_counsellor_active_service,
    validate_promotion_target,
)
from app.services.admin_dashboard import get_admin_dashboard
from app.services.admin_sessions import list_admin_sessions
from app.services.admin_students import (
    get_admin_student as get_admin_student_service,
    list_admin_students as list_admin_students_service,
    toggle_student_active as toggle_student_active_service,
)
from app.services.admin_analytics import get_admin_analytics
from app.services.platform_activity import list_platform_activity
from app.services.session_ratings import list_admin_ratings
from app.services.user_roles import (
    get_active_role_values,
    grant_counsellor_role,
    user_has_active_role,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=schemas.AdminDashboardResponse)
def get_admin_dashboard_route(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_dashboard(db)


@router.get("/account-requests", response_model=schemas.AccountRequestListResponse)
def list_account_requests(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return list_account_requests_service(db)


@router.post(
    "/account-requests/{request_id}/approve",
    response_model=schemas.AccountRequestActionResponse,
)
def approve_account_request(
    request_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return approve_account_request_service(db, request_id, admin)


@router.post(
    "/account-requests/{request_id}/reject",
    response_model=schemas.AccountRequestActionResponse,
)
def reject_account_request(
    request_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return reject_account_request_service(db, request_id, admin)


@router.get("/students", response_model=schemas.AdminStudentListResponse)
def list_students(
    search: str | None = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return list_admin_students_service(db, search=search)


@router.get("/students/{student_id}", response_model=schemas.AdminStudentDetail)
def get_student(
    student_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_student_service(db, student_id)


@router.post(
    "/students/{student_id}/toggle-active",
    response_model=schemas.AdminStudentToggleActiveResponse,
)
def toggle_student_active_route(
    student_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return toggle_student_active_service(db, student_id)


@router.get("/counsellors", response_model=schemas.AdminCounsellorListResponse)
def list_admin_counsellors_route(
    status: CounsellorProfileStatus | None = None,
    search: str | None = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    counsellors = list_admin_counsellors(
        db, status_filter=status, search=search
    )
    return schemas.AdminCounsellorListResponse(counsellors=counsellors)


@router.get("/counsellors/promotion-candidates", response_model=schemas.PromotionCandidateListResponse)
def list_promotion_candidates_route(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    candidates = list_promotion_candidates(db)
    return schemas.PromotionCandidateListResponse(candidates=candidates)


@router.get(
    "/counsellors/promotable-students",
    response_model=schemas.PromotableStudentListResponse,
)
def list_promotable_students_route(
    search: str | None = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    students = list_promotable_students(db, search=search)
    return schemas.PromotableStudentListResponse(students=students)


@router.post("/counsellors/promote/{user_id}", response_model=schemas.PromoteCounsellorResponse)
def promote_counsellor(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if user_has_active_role(db, user_id, UserRole.counsellor):
        roles = get_active_role_values(db, user_id)
        return schemas.PromoteCounsellorResponse(
            user_id=user_id,
            roles=roles,
            message="User already has an active counsellor role.",
        )

    validate_promotion_target(db, user_id)

    grant_counsellor_role(db, user_id=user_id, granted_by=admin.id)
    db.commit()

    roles = get_active_role_values(db, user_id)
    return schemas.PromoteCounsellorResponse(
        user_id=user_id,
        roles=roles,
        message=(
            "Counsellor role granted and a default counsellor profile was created. "
            "The counsellor can complete their profile via PUT /counsellor/me/profile."
        ),
    )


@router.post(
    "/counsellors/{counsellor_id}/toggle-active",
    response_model=schemas.AdminStudentToggleActiveResponse,
)
def toggle_counsellor_active_route(
    counsellor_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return toggle_counsellor_active_service(db, counsellor_id)


@router.post(
    "/counsellors/{user_id}/demote",
    response_model=schemas.DemoteCounsellorResponse,
)
def demote_counsellor_route(
    user_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return demote_counsellor_service(db, user_id)


@router.get("/sessions", response_model=schemas.AdminSessionListResponse)
def list_admin_sessions_route(
    status: BookingSessionStatus | None = None,
    search: str | None = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    sessions = list_admin_sessions(db, status_filter=status, search=search)
    return schemas.AdminSessionListResponse(sessions=sessions)


@router.get("/notifications", response_model=schemas.PlatformActivityListResponse)
def list_admin_notifications(
    limit: int = Query(default=20, ge=1, le=100),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return list_platform_activity(db, limit=limit)


@router.get("/analytics", response_model=schemas.AdminAnalyticsResponse)
def get_admin_analytics_route(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_analytics(db)


@router.get("/ratings", response_model=schemas.AdminRatingListResponse)
def list_admin_ratings_route(
    counsellor_id: int | None = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    ratings = list_admin_ratings(db, counsellor_id=counsellor_id)
    return schemas.AdminRatingListResponse(ratings=ratings)
