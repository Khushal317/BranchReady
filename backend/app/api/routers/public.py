from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.core.exceptions import AppError
from app.models.bank import Bank
from app.models.feedback import Feedback
from app.models.process import Process
from app.schemas.answer import ProcessAnswer, unavailable_answer
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


@router.get("/answer", response_model=ProcessAnswer)
def get_process_answer(
    bank_id: int,
    q: str = Query(min_length=1),
    db: Session = Depends(get_database),
) -> ProcessAnswer:
    bank = db.get(Bank, bank_id)
    if bank is None:
        return unavailable_answer(bank_id=bank_id)

    query_text = q.strip()
    exact_match = db.scalar(
        select(Process)
        .where(
            Process.bank_id == bank_id,
            Process.status == "active",
            or_(
                Process.process_name.ilike(query_text),
                Process.customer_friendly_title.ilike(query_text),
                Process.employee_friendly_title.ilike(query_text),
            ),
        )
        .order_by(Process.process_name)
    )

    if exact_match is None:
        search = f"%{query_text}%"
        exact_match = db.scalar(
            select(Process)
            .where(
                Process.bank_id == bank_id,
                Process.status == "active",
                or_(
                    Process.process_name.ilike(search),
                    Process.customer_friendly_title.ilike(search),
                    Process.employee_friendly_title.ilike(search),
                ),
            )
            .order_by(Process.process_name)
        )

    if exact_match is None:
        return unavailable_answer(bank_id=bank_id)

    return ProcessAnswer(
        available=True,
        message="Based on our stored process data.",
        last_verified_date=exact_match.last_verified_date,
        confidence_status=exact_match.confidence_status,
        process_id=exact_match.id,
        bank_id=exact_match.bank_id,
        process_title=exact_match.customer_friendly_title,
        required_documents=exact_match.required_documents,
        optional_documents=exact_match.optional_documents,
        form_name=exact_match.form_name,
        form_link=exact_match.form_link,
        originals_required=exact_match.originals_required,
        photocopies_required=exact_match.photocopies_required,
        self_attestation_required=exact_match.self_attestation_required,
        branch_visit_required=exact_match.branch_visit_required,
        online_possible=exact_match.online_possible,
        estimated_time=exact_match.estimated_time,
        customer_steps=exact_match.customer_steps,
        employee_steps=exact_match.employee_steps,
        common_rejection_reasons=exact_match.common_rejection_reasons,
        escalation_required=exact_match.escalation_required,
        branch_variation_note=exact_match.branch_variation_note,
        public_notes=exact_match.public_notes,
    )


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
