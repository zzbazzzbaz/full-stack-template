from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

_password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return _password_hash.verify(plain, hashed)


JWT_ALGORITHM = "HS256"


def create_access_token(
    *,
    subject: str,
    secret: str,
    expires_minutes: int,
    algorithm: str = JWT_ALGORITHM,
) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, secret, algorithm=algorithm)


def decode_subject(*, token: str, secret: str) -> str:
    payload = jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject:
        raise ValueError("invalid token subject")
    return subject
