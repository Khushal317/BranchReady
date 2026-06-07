from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Contributor(Base):
    __tablename__ = "contributors"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    role: Mapped[str | None] = mapped_column(String(120))
    bank: Mapped[str | None] = mapped_column(String(200))
    branch_city: Mapped[str | None] = mapped_column(String(200))
    contact: Mapped[str | None] = mapped_column(String(200))
    contribution_count: Mapped[int] = mapped_column(Integer, default=0)
    payment_status: Mapped[str | None] = mapped_column(String(80))
    trust_score: Mapped[int] = mapped_column(Integer, default=0)
