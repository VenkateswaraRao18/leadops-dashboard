from pathlib import Path
from observability.tracer import create_trace, log_span
from tools.crm import create_crm_contact
from retrieval.query import retrieve
from config.gemini import generate

PROMPT = (Path(__file__).parent / "prompts" / "onboarding_prompt.txt").read_text()


def onboarding_node(state: dict) -> dict:
    from orchestrator.state import LeadState

    lead_state = LeadState(**state)
    trace = create_trace("onboarding_node", metadata={"email": lead_state.email})

    print(f"[onboarding] processing hot lead: {lead_state.name}")

    # retrieve grounded context from pgvector
    query = f"{lead_state.intent} pricing onboarding for {lead_state.company}"
    context_chunks = retrieve(query, top_k=3)
    context = "\n\n".join(context_chunks)
    print(f"[onboarding] retrieved {len(context_chunks)} context chunks")

    # generate welcome email grounded in retrieved context
    prompt = PROMPT.format(
        name=lead_state.name,
        company=lead_state.company,
        intent=lead_state.intent,
        score=lead_state.score,
        context=context,
    )
    welcome_email = generate(prompt)
    print(f"[onboarding] welcome email:\n{welcome_email}")

    # create CRM record (goes through approval gate)
    crm_result = create_crm_contact({
        "name": lead_state.name,
        "email": lead_state.email,
        "company": lead_state.company,
        "intent": lead_state.intent,
        "score": lead_state.score,
        "route": lead_state.route,
    }, trace=trace)

    lead_state.status = f"onboarding_{crm_result['status']}"

    log_span(trace, "onboarding_node",
             input={"name": lead_state.name, "route": lead_state.route},
             output={"crm": crm_result, "email_generated": True})

    return lead_state.model_dump()
