from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.bank import Bank


def seed_union_bank() -> None:
    db = SessionLocal()
    try:
        existing_bank = db.scalar(
            select(Bank).where(Bank.bank_name == "Union Bank of India")
        )
        if existing_bank is None:
            db.add(
                Bank(
                    bank_name="Union Bank of India",
                    bank_type="public",
                    country="India",
                    website="https://www.unionbankofindia.co.in/",
                    notes="Initial MVP bank.",
                )
            )
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_union_bank()
