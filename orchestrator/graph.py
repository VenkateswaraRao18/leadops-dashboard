from datetime import datetime
from langgraph.graph import StateGraph, END
from agents.intake import intake_node
from agents.routing import routing_node, route_condition
from agents.onboarding import onboarding_node
from agents.content import content_node
from memory.engram_client import load_context, save_interaction


def memory_load_node(state: dict) -> dict:
    from orchestrator.state import LeadState
    lead_state = LeadState(**state)

    email = lead_state.raw_lead.get("email")
    if email:
        context = load_context(email)
        if context:
            lead_state.memory = {"summary": context}
            lead_state.is_returning_customer = True
            print(f"[memory] returning customer: {email}")
            print(f"[memory] context: {context[:120]}...")
        else:
            print(f"[memory] new customer: {email}")

    return lead_state.model_dump()


def memory_save_node(state: dict) -> dict:
    from orchestrator.state import LeadState
    lead_state = LeadState(**state)

    email = lead_state.email or lead_state.raw_lead.get("email")
    if not email:
        return lead_state.model_dump()

    save_interaction(email, {
        "name": lead_state.name,
        "company": lead_state.company,
        "intent": lead_state.intent,
        "score": lead_state.score,
        "route": lead_state.route,
        "status": lead_state.status,
        "date": datetime.now().strftime("%Y-%m-%d"),
    })

    return lead_state.model_dump()


def build_graph():
    graph = StateGraph(dict)

    graph.add_node("memory_load", memory_load_node)
    graph.add_node("intake", intake_node)
    graph.add_node("routing", routing_node)
    graph.add_node("onboarding", onboarding_node)
    graph.add_node("content", content_node)
    graph.add_node("memory_save", memory_save_node)

    graph.set_entry_point("memory_load")
    graph.add_edge("memory_load", "intake")
    graph.add_edge("intake", "routing")
    graph.add_edge("onboarding", "memory_save")
    graph.add_edge("content", "memory_save")
    graph.add_edge("memory_save", END)

    graph.add_conditional_edges(
        "routing",
        route_condition,
        {
            "hot":  "onboarding",
            "warm": "content",
            "cold": "content",
        }
    )

    return graph.compile()


lead_graph = build_graph()
