const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function submitLead(payload: Record<string, string>) {
  const res = await fetch(`${API}/webhook/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getApprovals() {
  const res = await fetch(`${API}/approvals`);
  if (!res.ok) throw new Error("Failed to fetch approvals");
  return res.json();
}

export async function getHealth() {
  const res = await fetch(`${API}/health`);
  return res.ok;
}
