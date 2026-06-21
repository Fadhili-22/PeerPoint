from fastapi import APIRouter, Depends, Query

from app import schemas
from app.database import get_db
from app.dependencies import require_admin
from app.models import User, UserRole, UserRoleAssignment
from app.schemas.enums import CounsellorProfileStatus, StudentProfileStatus
from app.services.user_roles import get_active_role_values, grant_counsellor_role
from sqlalchemy.orm import Session

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=schemas.AdminDashboardResponse)
def get_admin_dashboard(_: User = Depends(require_admin)):
    # TODO: implement
    raise NotImplementedError


@router.get("/account-requests", response_model=schemas.AccountRequestListResponse)
def list_account_requests(_: User = Depends(require_admin)):
    # TODO: implement
    raise NotImplementedError


@router.post(
    "/account-requests/{request_id}/approve",
    response_model=schemas.AccountRequestActionResponse,
)
def approve_account_request(
    request_id: int,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.post(
    "/account-requests/{request_id}/reject",
    response_model=schemas.AccountRequestActionResponse,
)
def reject_account_request(
    request_id: int,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.get("/students", response_model=schemas.AdminStudentListResponse)
def list_students(
    search: str | None = None,
    status: StudentProfileStatus | None = None,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.get("/students/{student_id}", response_model=schemas.AdminStudentDetail)
def get_student(
    student_id: int,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.get("/counsellors", response_model=schemas.AdminCounsellorListResponse)
def list_admin_counsellors(
    status: CounsellorProfileStatus | None = None,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.get("/counsellors/promotion-candidates", response_model=schemas.PromotionCandidateListResponse)
def list_promotion_candidates(_: User = Depends(require_admin)):
    # TODO: implement
    raise NotImplementedError


@router.post("/counsellors/promote/{user_id}", response_model=schemas.PromoteCounsellorResponse)
def promote_counsellor(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
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


@router.get("/sessions", response_model=schemas.AdminSessionListResponse)
def list_admin_sessions(_: User = Depends(require_admin)):
    # TODO: implement
    raise NotImplementedError


@router.get("/notifications", response_model=schemas.PlatformActivityListResponse)
def list_admin_notifications(_: User = Depends(require_admin)):
    # TODO: implement
    raise NotImplementedError
