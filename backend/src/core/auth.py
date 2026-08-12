"""JWT auth utilities — compatible with frontend AuthProvider."""
import hashlib
import json
import os
import uuid
from datetime import datetime, timedelta
from pathlib import Path

from jose import jwt

from .config import settings


def _users_path() -> Path:
    p = Path(settings.data_dir) / "users.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    if not p.exists():
        p.write_text("[]")
    return p


def _load_users() -> list[dict]:
    return json.loads(_users_path().read_text())


def _save_users(users: list[dict]) -> None:
    _users_path().write_text(json.dumps(users, indent=2))


def _hash_password(password: str, salt: str) -> str:
    return hashlib.sha256((password + salt).encode()).hexdigest()


def create_user(email: str, password: str, name: str) -> dict:
    users = _load_users()
    if any(u["email"] == email for u in users):
        raise ValueError("Email already registered")
    salt = os.urandom(16).hex()
    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": name,
        "password_hash": _hash_password(password, salt),
        "salt": salt,
        "plan": "free",
        "workspace_ids": [],
        "created_at": datetime.utcnow().isoformat(),
    }
    users.append(user)
    _save_users(users)
    return _sanitize(user)


def authenticate(email: str, password: str) -> dict | None:
    users = _load_users()
    for u in users:
        if u["email"] == email:
            if _hash_password(password, u["salt"]) == u["password_hash"]:
                return _sanitize(u)
    return None


def get_user_by_id(user_id: str) -> dict | None:
    users = _load_users()
    for u in users:
        if u["id"] == user_id:
            return _sanitize(u)
    return None


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=settings.jwt_expire_days),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload["sub"]
    except Exception:
        return None


def _sanitize(user: dict) -> dict:
    return {k: v for k, v in user.items() if k not in ("password_hash", "salt")}
