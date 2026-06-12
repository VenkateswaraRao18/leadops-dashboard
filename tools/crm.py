from pydantic import BaseModel, EmailStr
from observability.tracer import log_span


# --- input/output schemas (CLAUDE.md: every tool must be typed) ---

class CreateContactInput(BaseModel):
    name: str
    email: str
    company: str
    intent: str
    score: float
    route: str


class CreateContactOutput(BaseModel):
    contact_id: str
    status: str
    message: str


# --- approval gate ---

REQUIRES_APPROVAL = True  # external write — must pass approval gate

_pending_approvals: list[dict] = []  # in-memory queue for demo


def request_approval(action: str, payload: dict) -> str:
    entry = {"action": action, "payload": payload, "approved": False}
    _pending_approvals.append(entry)
    print(f"[approval gate] action '{action}' queued for human approval")
    print(f"[approval gate] payload: {payload}")
    return f"pending_approval_{len(_pending_approvals)}"


def get_pending_approvals() -> list[dict]:
    return _pending_approvals


# --- mock CRM implementation ---

_crm_db: dict = {}  # fake in-memory CRM


def _create_contact_in_crm(data: CreateContactInput) -> CreateContactOutput:
    contact_id = f"contact_{len(_crm_db) + 1}"
    _crm_db[contact_id] = data.model_dump()
    print(f"[crm] contact created: {contact_id} — {data.name} ({data.company})")
    return CreateContactOutput(
        contact_id=contact_id,
        status="created",
        message=f"Contact {data.name} from {data.company} created successfully"
    )


# --- tool entrypoint (called by agents) ---

def create_crm_contact(input_data: dict, trace=None) -> dict:
    # validate input — reject malformed calls (CLAUDE.md requirement)
    try:
        validated = CreateContactInput(**input_data)
    except Exception as e:
        log_span(trace, "crm_create_contact", input=input_data, output={"error": str(e)})
        raise ValueError(f"CRM tool input validation failed: {e}")

    # approval gate for external write
    if REQUIRES_APPROVAL:
        approval_id = request_approval("create_crm_contact", validated.model_dump())
        log_span(trace, "crm_create_contact",
                 input=validated.model_dump(),
                 output={"status": "pending_approval", "approval_id": approval_id})
        return {"status": "pending_approval", "approval_id": approval_id}

    # execute if approved
    result = _create_contact_in_crm(validated)
    log_span(trace, "crm_create_contact",
             input=validated.model_dump(),
             output=result.model_dump())
    return result.model_dump()
