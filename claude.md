# CLAUDE.md

This file guides Claude Code when working in this repository. Read it fully before making changes.

## Project: Autonomous Lead Ops & Onboarding Agent System

A multi-agent system that handles inbound leads end-to-end: intake → qualification → routing → onboarding → follow-up. No human in the loop except approval gates on production-writing actions. This is a portfolio project demonstrating production-grade agent engineering — the bar is "reliable, not just demo-able."

## Core Principles (do not violate)

1. **Nothing writes to production without a guardrail.** Every action that sends an email, charges a card, or creates an external record must pass through schema validation, an action allowlist, and (for external-facing or irreversible actions) a human approval gate.
2. **Every agent run is traced.** No silent execution. If you add an agent step, it must emit a trace span.
3. **No vibes — agents act on retrieved context or stored memory, never on assumptions.** If an agent needs a fact, it retrieves it or reads memory.
4. **Evals gate changes.** Before marking any agent feature "done," there must be a test case in the eval suite covering it. Routing/decision logic changes require the eval suite to pass.
5. **Tools are typed and validated.** Every tool call has a strict input/output schema. Reject malformed calls; never pass unvalidated model output to an external API.

## Architecture

```
Webhook (FastAPI) → Orchestrator (LangGraph)
                       ├── Intake Agent      (parse, enrich, score lead)
                       ├── Routing Agent     (hot → book call | warm → nurture | cold → decline)
                       ├── Onboarding Agent  (CRM record, welcome, onboarding doc, kickoff)
                       └── Content Agent      (grounded follow-up emails & social posts)

Shared services:
  - Retrieval:  pgvector over company docs/pricing/tickets
  - Memory:     per-customer summarized interaction history (Postgres)
  - Tools/MCP:  CRM, Calendar, Email, Payments + one custom MCP server
  - Guardrails: schema validation, action allowlist, human approval gate
  - Observability: Langfuse tracing on every run
```

## Tech Stack

- **Language:** Python 3.11+
- **Orchestration:** LangGraph (stateful graph; agents are nodes, handoffs are edges)
- **API/entrypoint:** FastAPI (webhook receives leads)
- **LLM:** google gemini (use the Messages API; model strings configurable via env)
- **Retrieval:** pgvector (Postgres extension)
- **Memory:** Postgres table, summarized per customer
- **Tracing:** Langfuse
- **Integrations:** Attio or HubSpot (CRM), Google Calendar, Resend or Gmail (email), Stripe test mode (payments)
- **Custom MCP server:** wrap a fake fulfillment API (build this yourself — it's the differentiator)
- **Deploy:** Railway or Fly.io (must run live)

## Repository Layout

```
/agents          # one module per agent: intake.py, routing.py, onboarding.py, content.py
/orchestrator    # LangGraph graph definition, state schema, handoff logic
/tools           # typed tool wrappers (crm.py, calendar.py, email.py, payments.py)
/mcp_server      # the custom MCP server you build
/retrieval       # vector store setup, ingestion, query
/memory          # per-customer memory read/write + summarization
/guardrails      # schema validators, action allowlist, approval gate
/evals           # synthetic test leads + expected outcomes + runner
/observability   # Langfuse setup + trace helpers
/api             # FastAPI app, webhook routes
/config          # settings, env loading
tests/           # unit tests
```

## Build Order (do not skip ahead)

Build incrementally. A working 3-agent system with solid evals beats a half-broken 6-agent one.

1. **Skeleton:** FastAPI webhook + LangGraph graph with a single pass-through node + Langfuse tracing wired in. Prove a request flows through and produces a trace.
2. **Intake agent:** parse raw lead → structured schema, classify intent, score. Add eval cases for parsing/scoring.
3. **Tools (typed) + one integration:** start with CRM. Every tool gets a schema and validation. Route intake output into a CRM record behind the approval gate.
4. **Routing agent:** decision logic (hot/warm/cold) with handoff edges. Add eval cases with known-correct outcomes; measure routing accuracy.
5. **Retrieval:** ingest company docs into pgvector; have an agent answer from retrieved context.
6. **Memory:** summarize each interaction, store per customer, read it back on repeat contact.
7. **Onboarding + Content agents:** wire remaining integrations (calendar, email, payments).
8. **Custom MCP server:** build it, then have an agent consume it as a tool.
9. **Guardrails hardening:** approval gates on all external writes, action allowlist per agent.
10. **Eval dashboard + demo:** full eval run with numbers, end-to-end demo trace.

## Guardrail Requirements (enforce in code)

- **Schema validation:** Pydantic models for every tool input/output. Reject and log on failure; never silently coerce.
- **Action allowlist:** each agent declares which tools it may call. Calls outside the list are blocked and traced.
- **Approval gate:** external emails, payment charges, and irreversible writes pause for human approval (a queue/flag the demo can show). Internal/reversible actions may auto-proceed.
- **Confidence escalation:** if an agent's confidence is below threshold, escalate to human instead of acting.

## Eval Requirements

- A corpus of synthetic leads in `/evals` with labeled expected outcomes (route-to-sales, decline, edge cases, adversarial/prompt-injection cases).
- Metrics tracked: routing accuracy, content hallucination rate (grounded vs. ungrounded claims), unauthorized-write count (must be 0), tool-call schema-failure rate.
- A runner that executes the suite and prints a results table. Decision-logic changes must pass before merge.

## Conventions

- Secrets only via env vars (`.env`, never committed). Provide `.env.example`.
- Use Stripe and any payment tooling in **test mode only** — never live keys.
- Keep agent prompts in versioned files under each agent module, not inline string literals scattered around.
- Every external API call wrapped with retry + timeout + error trace.
- Write the README as you go: architecture diagram, setup steps, eval numbers, demo link.

## What "Done" Looks Like

- A lead can be POSTed to the webhook and flow automatically to a booked calendar event (hot) or a polite decline (cold), with a full Langfuse trace.
- The eval suite runs and reports real numbers (e.g., routing accuracy %, 0 unauthorized writes).
- At least one custom MCP server exists and is consumed by an agent.
- Retrieval and per-customer memory are both demonstrably used (not mocked).
- All external writes are gated. Deployed and running live.

## Things NOT To Do

- Do not mock integrations that are meant to be real (the point is a live stack).
- Do not let an agent write to an external system without passing the guardrail layer.
- Do not add an agent or tool without a corresponding eval case and trace span.
- Do not expand scope before the current build-order step works end-to-end.
- Do not hardcode model outputs into tool calls without schema validation.