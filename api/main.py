import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from orchestrator.graph import lead_graph

app = FastAPI(title="Lead Ops Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LeadPayload(BaseModel):
    name: str
    email: str
    company: str
    message: str


@app.post("/webhook/lead")
async def receive_lead(payload: LeadPayload):
    try:
        initial_state = {"raw_lead": payload.model_dump()}
        result = lead_graph.invoke(initial_state)
        return {"status": "ok", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/approvals")
async def get_approvals():
    from tools.crm import get_pending_approvals
    return {"pending": get_pending_approvals()}
