from pydantic import BaseModel, EmailStr

from app.schemas.enums import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.student


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_verified: bool

    class Config:
        from_attributes = True


class UpdateUser(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: str
    roles: list[str] = []


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AuthUserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    roles: list[UserRole]
    is_verified: bool

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    user: AuthUserResponse
    token: Token
    redirect_to: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
