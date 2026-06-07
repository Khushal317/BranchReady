from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.core.exceptions import AppError
from app.models.bank import Bank
from app.models.feedback import Feedback
from app.models.process import Process
from app.schemas.bank import BankRead
from app.schemas.feedback import FeedbackCreate, FeedbackRead
from app.schemas.process import ProcessRead

router = APIRouter(tags=["public"])


@router.get("/banks", response_model=list[BankRead])
def list_banks(db: Session = Depends(get_database)) -> list[Bank]:
    return list(db.scalars(select(Bank).order_by(Bank.bank_name)).all())


@router.get("/processes", response_model=list[ProcessRead])
def list_processes(
    bank_id: int | None = None,
    q: str | None = Query(default=None, min_length=1),
    db: Session = Depends(get_database),
) -> list[Process]:
    query = select(Process).where(Process.status == "active")

    if bank_id is not None:
        query = query.where(Process.bank_id == bank_id)

    if q:
        search = f"%{q.strip()}%"
        query = query.where(
            or_(
                Process.process_name.ilike(search),
                Process.customer_friendly_title.ilike(search),
                Process.employee_friendly_title.ilike(search),
            )
        )

    return list(db.scalars(query.order_by(Process.process_name)).all())


@router.get("/processes/{process_id}", response_model=ProcessRead)
def get_process(process_id: int, db: Session = Depends(get_database)) -> Process:
    process = db.get(Process, process_id)
    if process is None or process.status != "active":
        raise AppError("Process not found.", status.HTTP_404_NOT_FOUND)

    return process


@router.post(
    "/feedback",
    response_model=FeedbackRead,
    status_code=status.HTTP_201_CREATED,
)
def create_feedback(
    payload: FeedbackCreate, db: Session = Depends(get_database)
) -> Feedback:
    feedback = Feedback(**payload.model_dump())
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback
