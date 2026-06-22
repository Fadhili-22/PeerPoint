from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, utils, oauth2
from ..database import get_db
from ..schemas.enums import UserRole
from ..services.user_roles import (
    compute_login_redirect,
    get_active_role_values,
    grant_role,
)
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["Authentication"])


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
        roles=[UserRole(role) for role in active_roles],
        is_verified=user.is_verified,
    )


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=schemas.UserResponse)
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

    new_user = models.User(**user_data)
    db.add(new_user)
    db.flush()

    grant_role(db, user_id=new_user.id, role=UserRole.student, granted_by=None)

    db.commit()
    db.refresh(new_user)

    return new_user


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

    active_roles = get_active_role_values(db, user.id)
    access_token = oauth2.create_access_token(
        data={"user_id": user.id, "roles": active_roles}
    )

    return schemas.LoginResponse(
        user=_build_auth_user_response(user, db),
        token=schemas.Token(access_token=access_token, token_type="bearer"),
        redirect_to=compute_login_redirect(active_roles, user.is_verified),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(_: models.User = Depends(oauth2.get_current_user)):
    # TODO: implement
    raise NotImplementedError


@router.get("/me", response_model=schemas.AuthUserResponse)
def get_current_auth_user(
    current_user: models.User = Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    return _build_auth_user_response(current_user, db)


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(_: schemas.ForgotPasswordRequest):
    # TODO: implement
    raise NotImplementedError


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(_: schemas.ResetPasswordRequest):
    # TODO: implement
    raise NotImplementedError
