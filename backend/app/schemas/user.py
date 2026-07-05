from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.enums import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    admission_number: str = Field(..., min_length=1, max_length=32)
    phone: str
    role: UserRole = UserRole.student

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        trimmed = value.strip()
        digits = trimmed[1:] if trimmed.startswith("+") else trimmed
        if not digits.isdigit():
            raise ValueError(
                "Phone number must contain digits only (optional leading +)."
            )
        if not 10 <= len(digits) <= 13:
            raise ValueError("Phone number must be 10-13 digits.")
        return digits


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    admission_number: str | None
    role: UserRole
    is_verified: bool
    email_verified: bool

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
    admission_number: str | None
    roles: list[UserRole]
    is_verified: bool
    email_verified: bool

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    user: AuthUserResponse
    token: Token
    redirect_to: str


class RegisterResponse(BaseModel):
    user: UserResponse
    message: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr
