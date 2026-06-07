from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Bank(Base):
    __tablename__ = "banks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    bank_name: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    bank_type: Mapped[str | None] = mapped_column(String(80))
    country: Mapped[str] = mapped_column(String(80), default="India")
    website: Mapped[str | None] = mapped_column(String(500))
    notes: Mapped[str | None] = mapped_column(Text)

    processes: Mapped[list["Process"]] = relationship(back_populates="bank")
