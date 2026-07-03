from __future__ import annotations
import httpx
from typing import Optional
from config.settings import ENGRAM_API_KEY, ENGRAM_BASE_URL


def _headers() -> dict:
    return {"X-API-Key": ENGRAM_API_KEY, "Content-Type": "application/json"}


def _safe_user_id(email: str) -> str:
    return email.replace("@", "_at_").replace(".", "_")


def load_context(user_id: str, query: str = "customer history and previous interactions", max_tokens: int = 300) -> str | None:
    """Fetch formatted memory context for injection into agent prompts. Returns None if no memories exist."""
    if not ENGRAM_API_KEY:
        return None
    try:
        response = httpx.get(
            f"{ENGRAM_BASE_URL}/v1/memories/context",
            headers=_headers(),
            params={"query": query, "user_id": _safe_user_id(user_id), "max_tokens": max_tokens},
            timeout=10.0,
        )
        response.raise_for_status()
        context = response.json().get("context", "").strip()
        return context if context else None
    except Exception as e:
        print(f"[engram] load_context failed for {user_id}: {e}")
        return None


def save_interaction(user_id: str, interaction: dict) -> None:
    """Store an interaction as a memory. Engram handles dedup, supersession, and fact extraction."""
    if not ENGRAM_API_KEY:
        return
    content = (
        f"Lead interaction: {interaction.get('name')} from {interaction.get('company')}. "
        f"Intent: {interaction.get('intent')}. Score: {interaction.get('score')}. "
        f"Route: {interaction.get('route')}. Status: {interaction.get('status')}. "
        f"Date: {interaction.get('date')}."
    )
    try:
        response = httpx.post(
            f"{ENGRAM_BASE_URL}/v1/memories",
            headers=_headers(),
            json={"messages": [{"role": "user", "content": content}], "user_id": _safe_user_id(user_id)},
            timeout=30.0,
        )
        response.raise_for_status()
        print(f"[engram] saved memory for {user_id}")
    except Exception as e:
        print(f"[engram] save_interaction failed for {user_id}: {e}")
