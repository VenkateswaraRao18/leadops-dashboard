import json
import re
from pathlib import Path

from pydantic import BaseModel
from config.gemini import generate
from observability.tracer import create_trace, log_span

PROMPT = (Path(__file__).parent / "prompts" / "routing_prompt.txt").read_text()


class RoutingDecision(BaseModel):
    route: str  # hot | warm | cold
    reason: str
    next_action: str


def decide_route(lead_data: dict) -> RoutingDecision:
    prompt = PROMPT.format(**lead_data)
    text = generate(prompt).strip()

    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON found in response: {text}")

    data = json.loads(match.group())
    return RoutingDecision(**data)


def routing_node(state: dict) -> dict:
    from orchestrator.state import LeadState

    lead_state = LeadState(**state)
    trace = create_trace("routing_node", metadata={"email": lead_state.email})

    decision = decide_route({
        "name": lead_state.name,
        "company": lead_state.company,
        "intent": lead_state.intent,
        "score": lead_state.score,
        "reasoning": lead_state.reasoning,
    })

    lead_state.route = decision.route
    lead_state.status = f"routed_{decision.route}"

    print(f"[routing] {lead_state.name} → {decision.route.upper()}")
    print(f"[routing] reason: {decision.reason}")
    print(f"[routing] next action: {decision.next_action}")

    log_span(trace, "routing_node",
             input={"score": lead_state.score, "intent": lead_state.intent},
             output={"route": decision.route, "next_action": decision.next_action})

    return lead_state.model_dump()


def route_condition(state: dict) -> str:
    return state.get("route", "cold")
