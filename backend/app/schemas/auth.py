from typing import Literal

from pydantic import Field, model_validator

from app.schemas.common import ORMModel
from app.schemas.user import UserOut


class LoginRequest(ORMModel):
    username: str
    password: str


class SignupRequest(ORMModel):
    username: str
    name: str
    password: str = Field(min_length=4)
    mobile: str | None = None
    phone: str | None = None
    mobile_number: str | None = None
    role: Literal["admin", "staff"] = "staff"

    @model_validator(mode="after")
    def _normalize_mobile(self) -> "SignupRequest":
        value = (self.mobile or self.phone or self.mobile_number or "").strip()
        if not value:
            raise ValueError("Mobile number is required")
        self.mobile = value
        return self


class TokenResponse(ORMModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
