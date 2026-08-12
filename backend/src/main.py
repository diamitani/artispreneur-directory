"""Artispreneur v3 — FastAPI backend with ROSTR-style agent pipeline."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import agent_routes, auth_routes, workspace_routes
from .core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    import logging
    logging.basicConfig(level=logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    yield
    # Shutdown


app = FastAPI(
    title=settings.app_name,
    version="3.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_routes.router)
app.include_router(agent_routes.router)
app.include_router(workspace_routes.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "3.0.0"}
