#!/bin/bash
set -e

echo "[startup] running DB setup..."
python -m retrieval.setup

echo "[startup] ingesting knowledge base..."
python -m retrieval.ingest

echo "[startup] starting server..."
uvicorn api.main:app --host 0.0.0.0 --port "${PORT:-8000}"
