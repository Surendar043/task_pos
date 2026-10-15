from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse
from app.schemas.user import UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    identifier = payload.username.strip().lower()
    user = await User.find_one({"$or": [{"email": identifier}, {"username": identifier}]})
    if user is None or not user.active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(user.id), user.role)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


async def _create_signup_user(payload: SignupRequest) -> TokenResponse:
    username = payload.username.strip().lower()
    if not username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is required")

    existing = await User.find_one(User.username == username)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    role = payload.role if payload.role in ("admin", "staff") else "staff"
    user = User(
        name=payload.name.strip(),
        username=username,
        password_hash=hash_password(payload.password),
        role=role,
        phone=(payload.mobile or "").strip() or None,
        active=True,
    )
    await user.insert()

    token = create_access_token(str(user.id), user.role)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/signup", response_model=TokenResponse)
@router.post("/register", response_model=TokenResponse)
async def signup(payload: SignupRequest) -> TokenResponse:
    return await _create_signup_user(payload)


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.post("/change-password")
async def change_password(
    payload: dict,
    user: User = Depends(get_current_user),
) -> dict:
    current = payload.get("current_password", "")
    new = payload.get("new_password", "")
    if len(new) < 4:
        raise HTTPException(status_code=400, detail="New password too short")
    if not verify_password(current, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.password_hash = hash_password(new)
    await user.save()
    return {"ok": True}
