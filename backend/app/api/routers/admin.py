from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_database, require_admin
from app.core.config import settings
from app.core.exceptions import AppError
from app.models.bank import Bank
from app.models.feedback import Feedback
from app.models.process import Process
from app.schemas.auth import AdminLoginRequest, AdminLoginResponse
from app.schemas.bank import BankCreate, BankRead, BankUpdate
from app.schemas.feedback import FeedbackRead, FeedbackUpdate
from app.schemas.process import ProcessCreate, ProcessRead, ProcessUpdate

router = APIRouter(tags=["admin"])


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest) -> AdminLoginResponse:
    if (
        payload.username != settings.admin_username
        or payload.password != settings.admin_password
    ):
        raise AppError("Invalid admin credentials.", status.HTTP_401_UNAUTHORIZED)

    return AdminLoginResponse(access_token=settings.admin_token)


@router.get(
    "/processes",
    response_model=list[ProcessRead],
    dependencies=[Depends(require_admin)],
)
def list_admin_processes(db: Session = Depends(get_database)) -> list[Process]:
    return list(db.scalars(select(Process).order_by(Process.process_name)).all())


@router.post(
    "/processes",
    response_model=ProcessRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_process(
    payload: ProcessCreate, db: Session = Depends(get_database)
) -> Process:
    process = Process(**payload.model_dump())
    db.add(process)
    db.commit()
    db.refresh(process)
    return process


@router.put(
    "/processes/{process_id}",
    response_model=ProcessRead,
    dependencies=[Depends(require_admin)],
)
def update_process(
    process_id: int, payload: ProcessUpdate, db: Session = Depends(get_database)
) -> Process:
    process = db.get(Process, process_id)
    if process is None:
        raise AppError("Process not found.", status.HTTP_404_NOT_FOUND)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(process, field, value)

    db.commit()
    db.refresh(process)
    return process


@router.post(
    "/banks",
    response_model=BankRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_bank(payload: BankCreate, db: Session = Depends(get_database)) -> Bank:
    bank = Bank(**payload.model_dump())
    db.add(bank)
    db.commit()
    db.refresh(bank)
    return bank


@router.put(
    "/banks/{bank_id}",
    response_model=BankRead,
    dependencies=[Depends(require_admin)],
)
def update_bank(
    bank_id: int, payload: BankUpdate, db: Session = Depends(get_database)
) -> Bank:
    bank = db.get(Bank, bank_id)
    if bank is None:
        raise AppError("Bank not found.", status.HTTP_404_NOT_FOUND)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(bank, field, value)

    db.commit()
    db.refresh(bank)
    return bank


@router.get(
    "/feedback",
    response_model=list[FeedbackRead],
    dependencies=[Depends(require_admin)],
)
def list_feedback(db: Session = Depends(get_database)) -> list[Feedback]:
    return list(db.scalars(select(Feedback).order_by(Feedback.created_at.desc())).all())


@router.put(
    "/feedback/{feedback_id}",
    response_model=FeedbackRead,
    dependencies=[Depends(require_admin)],
)
def update_feedback(
    feedback_id: int, payload: FeedbackUpdate, db: Session = Depends(get_database)
) -> Feedback:
    feedback = db.get(Feedback, feedback_id)
    if feedback is None:
        raise AppError("Feedback not found.", status.HTTP_404_NOT_FOUND)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(feedback, field, value)

    db.commit()
    db.refresh(feedback)
    return feedback
