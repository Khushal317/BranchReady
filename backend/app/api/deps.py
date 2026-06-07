from fastapi import Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AppError
from app.db.session import get_db

bearer_scheme = HTTPBearer(auto_error=False)


def get_database(db: Session = Depends(get_db)) -> Session:
    return db


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> None:
    if credentials is None or credentials.credentials != settings.admin_token:
        raise AppError("Admin authentication required.", status.HTTP_401_UNAUTHORIZED)
