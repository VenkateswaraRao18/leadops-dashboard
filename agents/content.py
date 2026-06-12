from pathlib import Path
from observability.tracer import create_trace, log_span
from retrieval.query import retrieve
from config.gemini import generate

WARM_PROMPT = (Path(__file__).parent / "prompts" / "content_warm_prompt.txt").read_text()
COLD_PROMPT = (Path(__file__).parent / "prompts" / "content_cold_prompt.txt").read_text()


def content_node(state: dict) -> dict:
    from orchestrator.state import LeadState

    lead_state = LeadState(**state)
    trace = create_trace("content_node", metadata={"email": lead_state.email, "route": lead_state.route})

    print(f"[content] generating {lead_state.route} email for {lead_state.name}")

    if lead_state.route == "warm":
        context_chunks = retrieve(f"{lead_state.intent} features benefits {lead_state.company}", top_k=2)
        context = "\n\n".join(context_chunks)

        memory_text = lead_state.memory.get("summary", "No previous interactions.") if lead_state.memory else "No previous interactions."

        prompt = WARM_PROMPT.format(
            name=lead_state.name,
            company=lead_state.company,
            intent=lead_state.intent,
            score=lead_state.score,
            memory=memory_text,
            context=context,
        )

    else:  # cold
        prompt = COLD_PROMPT.format(
            name=lead_state.name,
            company=lead_state.company,
            intent=lead_state.intent,
            score=lead_state.score,
        )

    email = generate(prompt)
    print(f"[content] {lead_state.route} email:\n{email}")

    lead_state.status = f"content_{lead_state.route}_sent"

    log_span(trace, "content_node",
             input={"route": lead_state.route, "intent": lead_state.intent},
             output={"email_generated": True, "route": lead_state.route})

    return lead_state.model_dump()
