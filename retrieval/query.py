import psycopg2
from config.settings import POSTGRES_URL
from config.gemini import embed


def embed_text(text: str) -> list[float]:
    return embed(text)


def retrieve(query: str, top_k: int = 3) -> list[str]:
    query_embedding = embed_text(query)

    conn = psycopg2.connect(POSTGRES_URL)
    cur = conn.cursor()

    cur.execute("""
        SELECT content FROM knowledge_base
        ORDER BY embedding <-> %s::vector
        LIMIT %s
    """, (query_embedding, top_k))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [row[0] for row in rows]


if __name__ == "__main__":
    results = retrieve("what is the enterprise pricing?")
    for i, chunk in enumerate(results):
        print(f"\n--- Chunk {i+1} ---\n{chunk}")
