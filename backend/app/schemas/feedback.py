from datetime import datetime

from pydantic import BaseModel


class FeedbackBase(BaseModel):
    bank_id: int | None = None
    process_id: int | None = None
    feedback_type: str
    user_feedback: str
    suggested_correction: str | None = None
    contact: str | None = None
    status: str = "new"


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackUpdate(BaseModel):
    feedback_type: str | None = None
    user_feedback: str | None = None
    suggested_correction: str | None = None
    contact: str | None = None
    status: str | None = None


class FeedbackRead(FeedbackBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
