FROM python:3.14-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_NO_DEV=1

WORKDIR /srv/app

COPY --from=ghcr.io/astral-sh/uv:0.12.23 /uv /uvx /bin/

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev

COPY alembic.ini ./
COPY migrations ./migrations
COPY scripts ./scripts
COPY app ./app

EXPOSE 8000

CMD ["uv", "run", "fastapi", "run", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
