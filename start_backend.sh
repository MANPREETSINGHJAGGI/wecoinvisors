#!/usr/bin/env bash
set -e

export PYTHONUNBUFFERED=1
export PORT=${PORT:-8000}
export HOST=${HOST:-127.0.0.1}

# Load .env if present
if [ -f ".env" ]; then
  set -o allexport
  source .env
  set +o allexport
fi

echo "Starting FastAPI on http://$HOST:$PORT"
uvicorn app.main:app --host "$HOST" --port "$PORT" --reload
