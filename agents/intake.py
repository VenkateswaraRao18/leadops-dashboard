import json
import re
from pathlib import Path

from pydantic import BaseModel
from config.gemini import generate
from observability.tracer import create_trace, log_span

PROMPT = (Path(__file__).parent / "prompts" / "intake_prompt.txt").read_text()


class ParsedLead(BaseModel):
    name: str
    email: str
    company: str
    intent: str
    score: float
    reasoning: str


def parse_and_score(raw_lead: dict) -> ParsedLead:
    prompt = PROMPT.format(raw_lead=json.dumps(raw_lead, indent=2))
    text = generate(prompt).strip()

    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON found in response: {text}")

    data = json.loads(match.group())
    return ParsedLead(**data)


def intake_node(state: dict) -> dict:
    from orchestrator.state import LeadState

    lead_state = LeadState(**state)
    trace = create_trace("intake_node", metadata={"email": lead_state.raw_lead.get("email")})

    parsed = parse_and_score(lead_state.raw_lead)

    lead_state.name = parsed.name
    lead_state.email = parsed.email
    lead_state.company = parsed.company
    lead_state.intent = parsed.intent
    lead_state.score = parsed.score
    lead_state.status = "intake_complete"
    lead_state.reasoning = parsed.reasoning

    print(f"[intake] {parsed.name} | {parsed.company} | score={parsed.score} | intent={parsed.intent}")
    print(f"[intake] reasoning: {parsed.reasoning}")

    log_span(trace, "intake_node",
             input=lead_state.raw_lead,
             output={"score": parsed.score, "intent": parsed.intent})

    return lead_state.model_dump()
