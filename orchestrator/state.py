from typing import Optional
from pydantic import BaseModel


class LeadState(BaseModel):
    # raw input from webhook
    raw_lead: dict

    # filled by intake agent
    name: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    intent: Optional[str] = None
    score: Optional[float] = None
    reasoning: Optional[str] = None

    # filled by routing agent
    route: Optional[str] = None  # hot | warm | cold

    # memory (loaded at start, saved at end)
    memory: Optional[dict] = None
    is_returning_customer: bool = False

    # status tracking
    status: str = "received"
    trace_id: Optional[str] = None
    errors: list[str] = []
