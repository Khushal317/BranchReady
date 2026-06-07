from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    bank_id: Mapped[int | None] = mapped_column(ForeignKey("banks.id"))
    process_id: Mapped[int | None] = mapped_column(ForeignKey("processes.id"))
    feedback_type: Mapped[str] = mapped_column(String(120))
    user_feedback: Mapped[str] = mapped_column(Text)
    suggested_correction: Mapped[str | None] = mapped_column(Text)
    contact: Mapped[str | None] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(50), default="new")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
