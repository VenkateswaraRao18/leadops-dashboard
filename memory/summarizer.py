from typing import Optional
from config.gemini import generate


def summarize_interaction(existing_summary: Optional[str], current_interaction: dict) -> str:
    if existing_summary:
        context = f"Previous summary:\n{existing_summary}\n\n"
    else:
        context = "This is the first interaction.\n\n"

    prompt = f"""You are a CRM assistant. Update the customer memory summary with the latest interaction.

{context}Latest interaction:
- Name: {current_interaction.get('name')}
- Company: {current_interaction.get('company')}
- Intent: {current_interaction.get('intent')}
- Score: {current_interaction.get('score')}
- Route: {current_interaction.get('route')}
- Status: {current_interaction.get('status')}
- Date: {current_interaction.get('date')}

Write a concise updated summary (max 100 words) capturing everything known about this customer.
Include: who they are, their company, past interactions, routing history, and current status."""

    return generate(prompt).strip()
