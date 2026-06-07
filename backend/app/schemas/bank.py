from pydantic import BaseModel


class BankBase(BaseModel):
    bank_name: str
    bank_type: str | None = None
    country: str = "India"
    website: str | None = None
    notes: str | None = None


class BankCreate(BankBase):
    pass


class BankUpdate(BaseModel):
    bank_name: str | None = None
    bank_type: str | None = None
    country: str | None = None
    website: str | None = None
    notes: str | None = None


class BankRead(BankBase):
    id: int

    model_config = {"from_attributes": True}
