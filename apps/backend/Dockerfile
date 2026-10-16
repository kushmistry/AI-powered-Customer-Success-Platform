# ---- Backend Dockerfile ----
# Python 3.12 slim image for the FastAPI backend
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies required for building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose default API port (Render overrides with dynamic $PORT at runtime)
EXPOSE 8000

# Run database migrations and start FastAPI on dynamic $PORT (enables --reload if DEBUG=true)
CMD ["sh", "-c", "alembic upgrade head && if [ \"$DEBUG\" = \"true\" ]; then uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --reload; else uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}; fi"]
