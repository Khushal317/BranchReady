from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Process(Base):
    __tablename__ = "processes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    bank_id: Mapped[int] = mapped_column(ForeignKey("banks.id"), index=True)
    process_name: Mapped[str] = mapped_column(String(200), index=True)
    process_category: Mapped[str | None] = mapped_column(String(120))
    customer_friendly_title: Mapped[str] = mapped_column(String(250))
    employee_friendly_title: Mapped[str | None] = mapped_column(String(250))
    required_documents: Mapped[str] = mapped_column(Text)
    optional_documents: Mapped[str | None] = mapped_column(Text)
    form_name: Mapped[str | None] = mapped_column(String(250))
    form_link: Mapped[str | None] = mapped_column(String(500))
    originals_required: Mapped[str] = mapped_column(String(40))
    photocopies_required: Mapped[str] = mapped_column(String(40))
    self_attestation_required: Mapped[str] = mapped_column(String(40))
    branch_visit_required: Mapped[bool] = mapped_column(Boolean, default=True)
    online_possible: Mapped[bool] = mapped_column(Boolean, default=False)
    estimated_time: Mapped[str | None] = mapped_column(String(250))
    customer_steps: Mapped[str] = mapped_column(Text)
    employee_steps: Mapped[str | None] = mapped_column(Text)
    common_rejection_reasons: Mapped[str | None] = mapped_column(Text)
    escalation_required: Mapped[str | None] = mapped_column(Text)
    branch_variation_note: Mapped[str | None] = mapped_column(Text)
    last_verified_date: Mapped[date | None] = mapped_column(Date)
    verified_by: Mapped[str | None] = mapped_column(String(200))
    source_type: Mapped[str | None] = mapped_column(String(120))
    confidence_status: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(50), default="active")
    internal_notes: Mapped[str | None] = mapped_column(Text)
    public_notes: Mapped[str | None] = mapped_column(Text)

    bank: Mapped["Bank"] = relationship(back_populates="processes")
