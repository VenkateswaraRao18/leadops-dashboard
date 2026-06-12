import psycopg2
from datetime import datetime
from typing import Optional
from config.settings import POSTGRES_URL


def load_memory(email: str) -> Optional[dict]:
    conn = psycopg2.connect(POSTGRES_URL)
    cur = conn.cursor()

    cur.execute("""
        SELECT email, summary, interaction_count, last_seen
        FROM customer_memory WHERE email = %s
    """, (email,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return None

    return {
        "email": row[0],
        "summary": row[1],
        "interaction_count": row[2],
        "last_seen": str(row[3]),
    }


def save_memory(email: str, summary: str):
    conn = psycopg2.connect(POSTGRES_URL)
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO customer_memory (email, summary, interaction_count, last_seen, updated_at)
        VALUES (%s, %s, 1, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
            summary = EXCLUDED.summary,
            interaction_count = customer_memory.interaction_count + 1,
            last_seen = NOW(),
            updated_at = NOW()
    """, (email, summary))

    conn.commit()
    cur.close()
    conn.close()
    print(f"[memory] saved for {email}")
