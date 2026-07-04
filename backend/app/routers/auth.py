from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .. import models, schemas, utils, oauth2
from ..database import get_db
from ..models import CounsellorProfileStatus
from ..schemas.enums import UserRole
from ..services.user_roles import (
    compute_login_redirect,
    get_active_role_values,
    grant_role,
    user_has_active_role,
)
from ..services.account_emails import notify_email_verification
from ..services.email import send_email_safe
from ..services.email_messages import password_reset as password_reset_message
from ..services.email_verification import (
    create_email_verification_token,
    verify_email_verification_token,
)
from ..services.password_reset import (
    create_password_reset_token,
    verify_password_reset_token,
)

from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _touch_last_active(db: Session, user: models.User) -> None:
    """Record login time on user + active counsellor profile (Prompt 11)."""
    now = datetime.now(timezone.utc)
    user.last_active_at = now
    profile = user.counsellor_profile
    if (
        profile is not None
        and profile.status == CounsellorProfileStatus.active
        and user_has_active_role(db, user.id, models.UserRole.counsellor)
    ):
        profile.last_active_at = now
    db.commit()


def _authenticate_user(
    db: Session, email: str, password: str
) -> models.User:
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not utils.verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid credentials",
        )
    return user


def _build_auth_user_response(user: models.User, db: Session) -> schemas.AuthUserResponse:
    active_roles = get_active_role_values(db, user.id)
    return schemas.AuthUserResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        admission_number=user.admission_number,
        roles=[UserRole(role) for role in active_roles],
        is_verified=user.is_verified,
        email_verified=user.email_verified,
    )


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=schemas.RegisterResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user.role != UserRole.student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only student self-registration is allowed",
        )

    # enforce strathmore email
    if not user.email.endswith("@strathmore.edu"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must register with a Strathmore email address"
        )
    
    # check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # hash the password
    hashed_password = utils.hash_password(user.password)
    user_data = user.model_dump()
    user_data["password"] = hashed_password
    user_data["role"] = UserRole.student
    user_data["admission_number"] = user.admission_number.strip()

    new_user = models.User(**user_data)
    db.add(new_user)
    db.flush()

    grant_role(db, user_id=new_user.id, role=UserRole.student, granted_by=None)

    db.commit()
    db.refresh(new_user)

    verification_token = create_email_verification_token(new_user.id)
    notify_email_verification(new_user, verification_token)

    return schemas.RegisterResponse(
        user=new_user,
        message=(
            "Account created. Please check your Strathmore email to verify "
            "your address before signing in."
        ),
    )


@router.post(
    "/swagger-token",
    response_model=schemas.Token,
    summary="Swagger Authorize only (flat OAuth2 token)",
    description=(
        "OpenAPI/Swagger UI only. Returns `{access_token, token_type}` at the top "
        "level so the /docs Authorize dialog can store the bearer token. Real "
        "clients must use POST /auth/login, which keeps the nested "
        "`token.access_token` contract."
    ),
)
def swagger_token(
    user_credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = _authenticate_user(
        db, user_credentials.username, user_credentials.password
    )
    _touch_last_active(db, user)
    active_roles = get_active_role_values(db, user.id)
    access_token = oauth2.create_access_token(
        data={"user_id": user.id, "roles": active_roles}
    )
    return schemas.Token(access_token=access_token, token_type="bearer")


@router.post("/login", response_model=schemas.LoginResponse)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = _authenticate_user(
        db, user_credentials.username, user_credentials.password
    )

    _touch_last_active(db, user)
    active_roles = get_active_role_values(db, user.id)
    access_token = oauth2.create_access_token(
        data={"user_id": user.id, "roles": active_roles}
    )

    return schemas.LoginResponse(
        user=_build_auth_user_response(user, db),
        token=schemas.Token(access_token=access_token, token_type="bearer"),
        redirect_to=compute_login_redirect(
            active_roles,
            is_verified=user.is_verified,
            email_verified=user.email_verified,
        ),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    current_user: models.User = Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    _touch_last_active(db, current_user)


@router.get("/me", response_model=schemas.AuthUserResponse)
def get_current_auth_user(
    current_user: models.User = Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    return _build_auth_user_response(current_user, db)


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(
    payload: schemas.ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if user is None:
        # Do not reveal whether the address is registered.
        return {"message": "If that email is registered, a reset link has been sent."}

    reset_token = create_password_reset_token(user.id)
    subject, body = password_reset_message(
        full_name=user.full_name,
        reset_token=reset_token,
    )
    background_tasks.add_task(
        send_email_safe,
        to=user.email,
        subject=subject,
        body_text=body,
    )
    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(
    payload: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    user_id = verify_password_reset_token(payload.token)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    user.password = utils.hash_password(payload.new_password)
    db.commit()


@router.post("/verify-email", status_code=status.HTTP_200_OK)
def verify_email(
    payload: schemas.VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    user_id = verify_email_verification_token(payload.token)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification link",
        )

    if user.email_verified:
        return {"message": "Email already verified"}

    user.email_verified = True
    db.commit()
    return {"message": "Email verified successfully"}


@router.post("/resend-verification", status_code=status.HTTP_202_ACCEPTED)
def resend_verification(
    payload: schemas.ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if (
        user is not None
        and not user.email_verified
        and user_has_active_role(db, user.id, models.UserRole.student)
    ):
        verification_token = create_email_verification_token(user.id)
        background_tasks.add_task(
            notify_email_verification,
            user,
            verification_token,
        )
    return {
        "message": "If that email is registered and unverified, a verification link has been sent."
    }
