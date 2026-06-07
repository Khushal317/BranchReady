from datetime import date

from pydantic import BaseModel


class ProcessBase(BaseModel):
    bank_id: int
    process_name: str
    process_category: str | None = None
    customer_friendly_title: str
    employee_friendly_title: str | None = None
    required_documents: str
    optional_documents: str | None = None
    form_name: str | None = None
    form_link: str | None = None
    originals_required: str
    photocopies_required: str
    self_attestation_required: str
    branch_visit_required: bool = True
    online_possible: bool = False
    estimated_time: str | None = None
    customer_steps: str
    employee_steps: str | None = None
    common_rejection_reasons: str | None = None
    escalation_required: str | None = None
    branch_variation_note: str | None = None
    last_verified_date: date | None = None
    verified_by: str | None = None
    source_type: str | None = None
    confidence_status: str
    status: str = "active"
    internal_notes: str | None = None
    public_notes: str | None = None


class ProcessCreate(ProcessBase):
    pass


class ProcessUpdate(BaseModel):
    bank_id: int | None = None
    process_name: str | None = None
    process_category: str | None = None
    customer_friendly_title: str | None = None
    employee_friendly_title: str | None = None
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
    branch_variation_note: str | None = None
    last_verified_date: date | None = None
    verified_by: str | None = None
    source_type: str | None = None
    confidence_status: str | None = None
    status: str | None = None
    internal_notes: str | None = None
    public_notes: str | None = None


class ProcessRead(ProcessBase):
    id: int

    model_config = {"from_attributes": True}
