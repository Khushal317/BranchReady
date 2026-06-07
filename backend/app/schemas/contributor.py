from pydantic import BaseModel


class ContributorBase(BaseModel):
    name: str
    role: str | None = None
    bank: str | None = None
    branch_city: str | None = None
    contact: str | None = None
    contribution_count: int = 0
    payment_status: str | None = None
    trust_score: int = 0


class ContributorCreate(ContributorBase):
    pass


class ContributorUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    bank: str | None = None
    branch_city: str | None = None
    contact: str | None = None
    contribution_count: int | None = None
    payment_status: str | None = None
    trust_score: int | None = None


class ContributorRead(ContributorBase):
    id: int

    model_config = {"from_attributes": True}
