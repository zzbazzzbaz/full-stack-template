from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

_password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return _password_hash.verify(plain, hashed)


def create_access_token(
    *,
    subject: str,
    secret: str,
    algorithm: str,
    expires_minutes: int,
) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, secret, algorithm=algorithm)


def decode_subject(*, token: str, secret: str, algorithms: list[str]) -> str:
    payload = jwt.decode(token, secret, algorithms=algorithms)
    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject:
        raise ValueError("invalid token subject")
    return subject
