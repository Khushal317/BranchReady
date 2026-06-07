from datetime import date

from pydantic import BaseModel


BRANCH_VARIATION_WARNING = (
    "Branch-specific variation is possible. Please confirm with your branch "
    "before visiting, especially if your case is sensitive or the information "
    "is old."
)

UNAVAILABLE_MESSAGE = (
    "We do not have verified information for this exact bank/process yet. "
    "Please check with your branch before visiting."
)


class ProcessAnswer(BaseModel):
    available: bool
    message: str
    branch_variation_warning: str = BRANCH_VARIATION_WARNING
    last_verified_date: date | None = None
    confidence_status: str
    process_id: int | None = None
    bank_id: int | None = None
    process_title: str | None = None
    required_documents: str | None = None
    optional_documents: str | None = None
    form_name: str | None = None
    form_link: str | None = None
    originals_required: str | None = None
    photocopies_required: str | None = None
    self_attestation_required: str | None = None
    branch_visit_required: bool | None = None
    online_possible: bool | None = None
    estimated_time: str | None = None
    customer_steps: str | None = None
    employee_steps: str | None = None
    common_rejection_reasons: str | None = None
    escalation_required: str | None = None
    public_notes: str | None = None


def unavailable_answer(bank_id: int | None = None) -> ProcessAnswer:
    return ProcessAnswer(
        available=False,
        message=UNAVAILABLE_MESSAGE,
        bank_id=bank_id,
        confidence_status="unavailable",
    )
