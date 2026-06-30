"""Dispatch account lifecycle emails triggered by auth and admin flows."""



from __future__ import annotations



from app.models import AccountRequestType, User

from app.services.email import send_email_safe

from app.services.email_messages import (

    counsellor_promoted,

    email_verification,

)





def notify_email_verification(user: User, token: str) -> None:

    subject, body = email_verification(

        full_name=user.full_name,

        verification_token=token,

    )

    send_email_safe(to=user.email, subject=subject, body_text=body)





def notify_account_request_approved(

    user: User, *, request_type: AccountRequestType

) -> None:

    if request_type == AccountRequestType.promotion:

        subject, body = counsellor_promoted(full_name=user.full_name)

    else:

        return

    send_email_safe(to=user.email, subject=subject, body_text=body)


