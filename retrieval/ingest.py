import psycopg2
from pathlib import Path
from config.settings import POSTGRES_URL
from config.gemini import embed


def embed_text(text: str) -> list[float]:
    return embed(text)


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks


def ingest_document(filepath: str):
    text = Path(filepath).read_text()
    chunks = chunk_text(text)

    conn = psycopg2.connect(POSTGRES_URL)
    cur = conn.cursor()

    # clear existing docs from this source
    cur.execute("DELETE FROM knowledge_base WHERE source = %s", (filepath,))

    for i, chunk in enumerate(chunks):
        embedding = embed_text(chunk)
        cur.execute(
            "INSERT INTO knowledge_base (content, embedding, source) VALUES (%s, %s, %s)",
            (chunk, embedding, filepath)
        )
        print(f"[ingest] chunk {i+1}/{len(chunks)} ingested")

    conn.commit()
    cur.close()
    conn.close()
    print(f"[ingest] done — {len(chunks)} chunks from {filepath}")


if __name__ == "__main__":
    from retrieval.setup import setup_vector_table
    setup_vector_table()
    ingest_document("retrieval/docs/company.txt")
