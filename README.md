# Lead Ops Agent

An AI-powered lead qualification and routing system built with LangGraph, Google Gemini, and Engram memory. Automatically scores inbound leads, routes them to the right workflow, and remembers returning customers.

---

## How It Works

```
Inbound Lead (webhook)
        │
        ▼
┌─────────────────┐
│  memory_load    │  ← fetch returning customer context from Engram
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    intake       │  ← parse lead + score 0–100 with Gemini
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    routing      │  ← classify: hot / warm / cold
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌─────────┐
│  hot   │ │  warm/  │
│onboard │ │ content │
└────┬───┘ └────┬────┘
     └────┬─────┘
          ▼
┌─────────────────┐
│  memory_save    │  ← persist interaction to Engram
└─────────────────┘
```

---

## Features

- **Lead Scoring** — Gemini scores each lead 0–100 based on intent, company, and message
- **Smart Routing** — Automatically routes to hot (sales call), warm (nurture), or cold (content) workflows
- **Persistent Memory** — Engram remembers returning customers across sessions; prior context influences scoring
- **Observability** — Every node traced with Langfuse for latency, inputs, and outputs
- **REST API** — FastAPI backend with webhook endpoint for CRM and form integrations
- **Dashboard** — Next.js frontend for viewing lead pipeline and routing decisions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Orchestration | [LangGraph](https://github.com/langchain-ai/langgraph) |
| LLM | Google Gemini 2.0 Flash |
| Memory | [Engram](https://engram-api-venky.fly.dev) |
| API | FastAPI |
| Frontend | Next.js |
| Observability | Langfuse |
| Database | PostgreSQL (Render managed) |
| Deploy | Render |

---

## Project Structure

```
lead_ops_agent/
├── agents/
│   ├── intake.py        # parse + score lead with Gemini
│   ├── routing.py       # hot/warm/cold routing decision
│   ├── onboarding.py    # workflow for hot leads
│   ├── content.py       # workflow for warm/cold leads
│   └── prompts/         # prompt templates
├── api/
│   └── main.py          # FastAPI app, /webhook/lead endpoint
├── config/
│   ├── settings.py      # env var loading
│   └── gemini.py        # Gemini client
├── memory/
│   └── engram_client.py # load_context() and save_interaction()
├── observability/
│   └── tracer.py        # Langfuse trace + span helpers
├── orchestrator/
│   ├── graph.py         # LangGraph state machine
│   └── state.py         # LeadState schema
├── retrieval/           # RAG pipeline for product knowledge
├── tools/
│   └── crm.py           # CRM integration helpers
├── frontend/            # Next.js dashboard
├── render.yaml          # Render deployment config
└── start.sh             # server startup script
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ (for frontend)
- PostgreSQL
- [Google Gemini API key](https://aistudio.google.com/apikey)
- [Engram API key](https://engram-api-venky.fly.dev)

### Setup

```bash
# clone
git clone https://github.com/VenkateswaraRao18/leadops-dashboard.git
cd leadops-dashboard

# python env
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# environment variables
cp .env.example .env
# fill in your keys in .env
```

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash

POSTGRES_URL=postgresql://user:password@localhost:5432/lead_ops

LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=https://cloud.langfuse.com

ENGRAM_API_KEY=your_engram_api_key_here
ENGRAM_BASE_URL=https://engram-api-venky.fly.dev
```

### Run

```bash
# backend
bash start.sh

# frontend (separate terminal)
cd frontend
npm install
npm run dev
```

API runs at `http://localhost:8000`, dashboard at `http://localhost:3000`.

---

## API

### `POST /webhook/lead`

Submit an inbound lead for processing.

```json
{
  "name": "Jane Smith",
  "email": "jane@acme.com",
  "company": "Acme Corp",
  "message": "We need a solution for automating our sales pipeline for 50 reps."
}
```

**Response:**

```json
{
  "status": "ok",
  "result": {
    "name": "Jane Smith",
    "score": 87.5,
    "route": "hot",
    "intent": "sales automation at scale",
    "status": "routed_hot"
  }
}
```

### `GET /health`

```json
{ "status": "ok" }
```

### `GET /approvals`

Returns leads pending human approval.

---

## Routing Logic

| Score | Route | Action |
|---|---|---|
| 75–100 | **hot** | Immediate onboarding flow, sales notification |
| 40–74 | **warm** | Nurture sequence, relevant content |
| 0–39 | **cold** | Self-serve content, newsletter |

---

## Memory & Returning Customers

Engram stores each lead interaction as a structured memory. On the next visit:

1. `memory_load` fetches prior context using the lead's email
2. Context is injected into the intake prompt — previous score, intent, and route influence the new score
3. After processing, `memory_save` persists the updated interaction

This means a lead who previously scored 45 (warm) but now shows stronger intent will be re-scored with that history in mind.

---

## Deploy to Render

The `render.yaml` defines the full stack — API, frontend, and managed PostgreSQL database.

1. Push to GitHub
2. Connect repo to [Render](https://render.com)
3. Set environment variables in Render dashboard
4. Deploy — Render provisions the database and starts both services

---

## Observability

All LangGraph nodes are traced with Langfuse. Each request produces:
- A root trace with the lead email as identifier
- Child spans per node (intake, routing, onboarding/content, memory)
- Input/output captured at each step for debugging

View traces at [cloud.langfuse.com](https://cloud.langfuse.com).
