import psycopg2
from config.settings import POSTGRES_URL

def setup_vector_table():
    conn = psycopg2.connect(POSTGRES_URL)
    cur = conn.cursor()

    cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    cur.execute("DROP TABLE IF EXISTS knowledge_base;")
    # 3072 dimensions = gemini-embedding-001 output size
    cur.execute("""
        CREATE TABLE IF NOT EXISTS knowledge_base (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            embedding vector(3072),
            source TEXT
        );
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("[retrieval] vector table ready")


if __name__ == "__main__":
    setup_vector_table()
