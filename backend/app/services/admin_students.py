"""Admin student directory — list, detail, and session counts."""



from __future__ import annotations



from datetime import datetime, timedelta, timezone



from fastapi import HTTPException, status

from sqlalchemy import func, or_

from sqlalchemy.orm import Session



from app import schemas

from app.models import (

    SessionRequest,

    User,

    UserRole,

    UserRoleAssignment,

)

from app.services.session_requests import count_completed_sessions_for_student
from app.services.account_emails import (
    notify_account_deactivated,
    notify_account_reactivated,
)





def list_admin_students(

    db: Session,

    *,

    search: str | None = None,

) -> schemas.AdminStudentListResponse:

    query = (

        db.query(User)

        .join(

            UserRoleAssignment,

            (UserRoleAssignment.user_id == User.id)

            & (UserRoleAssignment.role == UserRole.student)

            & (UserRoleAssignment.is_active.is_(True)),

        )

    )



    if search and search.strip():

        term = f"%{search.strip()}%"

        query = query.filter(

            or_(

                User.full_name.ilike(term),

                User.email.ilike(term),

            )

        )



    rows = query.order_by(User.full_name.asc()).all()

    return schemas.AdminStudentListResponse(

        students=[_map_admin_student(user, db=db) for user in rows]

    )





def get_admin_student(db: Session, student_id: int) -> schemas.AdminStudentDetail:

    user = (

        db.query(User)

        .join(

            UserRoleAssignment,

            (UserRoleAssignment.user_id == User.id)

            & (UserRoleAssignment.role == UserRole.student)

            & (UserRoleAssignment.is_active.is_(True)),

        )

        .filter(User.id == student_id)

        .first()

    )

    if user is None:

        raise HTTPException(

            status_code=status.HTTP_404_NOT_FOUND,

            detail="Student not found",

        )



    base = _map_admin_student(user, db=db)

    return schemas.AdminStudentDetail(

        **base.model_dump(),

        recent_activity=_synthesize_recent_activity(db, student_id),

    )




def toggle_student_active(
    db: Session, student_id: int
) -> schemas.AdminStudentToggleActiveResponse:
    user = (
        db.query(User)
        .join(
            UserRoleAssignment,
            (UserRoleAssignment.user_id == User.id)
            & (UserRoleAssignment.role == UserRole.student)
            & (UserRoleAssignment.is_active.is_(True)),
        )
        .filter(User.id == student_id)
        .first()
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    if user.is_active:
        notify_account_reactivated(user)
        message = "Student account reactivated."
    else:
        notify_account_deactivated(user)
        message = "Student account deactivated."

    return schemas.AdminStudentToggleActiveResponse(
        user_id=user.id,
        is_active=user.is_active,
        message=message,
    )





def _active_student_ids_subquery(db: Session):

    return (

        db.query(UserRoleAssignment.user_id)

        .filter(

            UserRoleAssignment.role == UserRole.student,

            UserRoleAssignment.is_active.is_(True),

        )

        .distinct()

        .subquery()

    )





def get_admin_student_stats(db: Session) -> dict[str, int]:

    """Server-side KPI counts for the admin students page header."""

    now = datetime.now(timezone.utc)

    week_ago = now - timedelta(days=7)

    month_ago = now - timedelta(days=30)

    student_ids = _active_student_ids_subquery(db)



    total = (

        db.query(func.count())

        .select_from(student_ids)

        .scalar()

        or 0

    )



    active_this_week = (

        db.query(func.count(User.id))

        .filter(

            User.id.in_(db.query(student_ids.c.user_id)),

            User.last_active_at.isnot(None),

            User.last_active_at >= week_ago,

        )

        .scalar()

        or 0

    )



    new_this_month = (

        db.query(func.count(User.id))

        .filter(

            User.id.in_(db.query(student_ids.c.user_id)),

            User.created_at >= month_ago,

        )

        .scalar()

        or 0

    )



    return {

        "total": total,

        "active_this_week": active_this_week,

        "new_this_month": new_this_month,

    }





def _map_admin_student(user: User, *, db: Session) -> schemas.AdminStudentItem:

    return schemas.AdminStudentItem(

        user_id=user.id,

        full_name=user.full_name,

        email=user.email,

        phone=user.phone,

        is_active=user.is_active,

        sessions=count_completed_sessions_for_student(db, user.id),

        last_active_at=user.last_active_at,

        created_at=user.created_at,

    )





def _synthesize_recent_activity(db: Session, student_id: int) -> list[str]:

    rows = (

        db.query(SessionRequest)

        .filter(SessionRequest.student_id == student_id)

        .order_by(SessionRequest.requested_at.desc())

        .limit(5)

        .all()

    )

    lines: list[str] = []

    for req in rows:

        topic = req.other_topic if req.topic.value == "Other" and req.other_topic else req.topic.value

        date_str = req.requested_at.strftime("%b %d, %Y")

        status_label = req.status.value.capitalize()

        lines.append(f"{topic} session — {status_label} ({date_str})")

    return lines

