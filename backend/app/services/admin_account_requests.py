"""Admin account approval queue — promotion requests only."""



from __future__ import annotations



from fastapi import HTTPException, status

from sqlalchemy.orm import Session, joinedload



from app import schemas

from app.models import (

    AccountApprovalRequest,

    AccountRequestStatus,

    AccountRequestType,

    User,

    UserRole,

)

from app.schemas.enums import (

    AccountRequestStatus as AccountRequestStatusSchema,

    AccountRequestType as AccountRequestTypeSchema,

    ActivityVariant,

    UserRole as UserRoleSchema,

)

from app.services.admin_counsellors import validate_promotion_candidate

from app.services.account_emails import notify_account_request_approved

from app.services.platform_activity import record_platform_activity

from app.services.user_roles import (

    get_active_role_values,

    grant_counsellor_role,

    user_has_active_role,

)



_OPEN_STATUSES = (

    AccountRequestStatus.pending_review,

    AccountRequestStatus.verifying_id,

)





def _get_open_request_or_404(

    db: Session, request_id: int

) -> AccountApprovalRequest:

    request = (

        db.query(AccountApprovalRequest)

        .options(joinedload(AccountApprovalRequest.user))

        .filter(

            AccountApprovalRequest.id == request_id,

            AccountApprovalRequest.status.in_(_OPEN_STATUSES),

        )

        .first()

    )

    if request is None:

        raise HTTPException(

            status_code=status.HTTP_404_NOT_FOUND,

            detail="Account request not found",

        )

    return request





def _primary_role(db: Session, user_id: int) -> UserRoleSchema:

    roles = get_active_role_values(db, user_id)

    if UserRole.student.value in roles:

        return UserRoleSchema.student

    if roles:

        return UserRoleSchema(roles[0])

    return UserRoleSchema.student





def _map_account_request(

    request: AccountApprovalRequest, user: User, *, db: Session

) -> schemas.AccountRequestItem:

    return schemas.AccountRequestItem(

        id=request.id,

        user_id=user.id,

        type=AccountRequestTypeSchema(request.type.value),

        name=user.full_name,

        email=user.email,

        role=_primary_role(db, user.id),

        status=AccountRequestStatusSchema(request.status.value),

        date=request.created_at,

        note=request.note,

    )





def list_account_requests(db: Session) -> schemas.AccountRequestListResponse:

    rows = (

        db.query(AccountApprovalRequest, User)

        .join(User, AccountApprovalRequest.user_id == User.id)

        .filter(

            AccountApprovalRequest.status.in_(_OPEN_STATUSES),

            AccountApprovalRequest.type == AccountRequestType.promotion,

        )

        .order_by(AccountApprovalRequest.created_at.desc())

        .all()

    )

    return schemas.AccountRequestListResponse(

        requests=[

            _map_account_request(request, user, db=db)

            for request, user in rows

        ]

    )





def approve_account_request(

    db: Session, request_id: int, admin: User

) -> schemas.AccountRequestActionResponse:

    request = _get_open_request_or_404(db, request_id)

    user = request.user

    request_type = request.type



    if request.type == AccountRequestType.promotion:

        if user_has_active_role(db, user.id, UserRole.counsellor):

            db.delete(request)

            db.commit()

            return schemas.AccountRequestActionResponse(

                id=request_id,

                status="approved",

                message="User already has an active counsellor role.",

            )

        validate_promotion_candidate(db, user.id)

        grant_counsellor_role(db, user_id=user.id, granted_by=admin.id)

        record_platform_activity(

            db,

            title="Counsellor Promotion Approved",

            description=f"{user.full_name} promoted from Student to Peer Counsellor",

            variant=ActivityVariant.primary,

            entity_type="user",

            entity_id=str(user.id),

        )

    else:

        raise HTTPException(

            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,

            detail="Unknown account request type",

        )



    db.delete(request)

    db.commit()

    notify_account_request_approved(user, request_type=request_type)

    return schemas.AccountRequestActionResponse(

        id=request_id,

        status="approved",

        message="Account request approved.",

    )





def reject_account_request(

    db: Session, request_id: int, _admin: User

) -> schemas.AccountRequestActionResponse:

    request = _get_open_request_or_404(db, request_id)



    db.delete(request)

    db.commit()



    return schemas.AccountRequestActionResponse(

        id=request_id,

        status="rejected",

        message="Account request rejected.",

    )


