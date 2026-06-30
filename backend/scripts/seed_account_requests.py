"""Seed sample promotion account approval requests (idempotent).



Creates open promotion requests for promotion candidates that do not already

have one.



Usage:

    python -m scripts.seed_account_requests

"""



from app.database import SessionLocal

from app.models import (

    AccountApprovalRequest,

    AccountRequestStatus,

    AccountRequestType,

    PromotionCandidate,

)



_OPEN_STATUSES = (

    AccountRequestStatus.pending_review,

    AccountRequestStatus.verifying_id,

)





def _has_open_request(

    db, user_id: int, request_type: AccountRequestType

) -> bool:

    return (

        db.query(AccountApprovalRequest)

        .filter(

            AccountApprovalRequest.user_id == user_id,

            AccountApprovalRequest.type == request_type,

            AccountApprovalRequest.status.in_(_OPEN_STATUSES),

        )

        .first()

        is not None

    )





def seed_account_requests() -> None:

    db = SessionLocal()

    created = 0

    try:

        candidates = db.query(PromotionCandidate).all()

        for candidate in candidates:

            if _has_open_request(db, candidate.user_id, AccountRequestType.promotion):

                continue

            db.add(

                AccountApprovalRequest(

                    user_id=candidate.user_id,

                    type=AccountRequestType.promotion,

                    status=AccountRequestStatus.pending_review,

                    note="Promotion candidate awaiting admin review",

                )

            )

            created += 1



        db.commit()

        print(f"Account approval requests ready ({created} new row(s) created)")

    finally:

        db.close()





def main() -> None:

    seed_account_requests()





if __name__ == "__main__":

    main()


