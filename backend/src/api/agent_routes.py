"""Agent routes — chat + stream + RAG research + knowledge management."""
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..core.agent import run_agent, run_agent_stream
from ..core.rag import RAGPipeline
from .dependencies import get_optional_user, get_current_user

# RAG pipeline singleton
_rag: RAGPipeline | None = None
def _get_rag() -> RAGPipeline:
    global _rag
    if _rag is None:
        from pathlib import Path
        from ..core.config import settings
        _rag = RAGPipeline(storage_path=Path(settings.data_dir) / "knowledge")
    return _rag

router = APIRouter(prefix="/api/v1/agent", tags=["agent"])


class ChatRequest(BaseModel):
    prompt: str
    provider: str = "anthropic"
    api_key: str = ""
    model: str = ""
    session_id: str = "default"
    workspace_id: str | None = None
    history: list[dict] | None = None
    enable_rag: bool = True


class ChatResponse(BaseModel):
    message: str
    intent: str
    domain: str
    agent_type: str
    priority_score: float
    npao_phase: str
    model: str
    provider: str
    success: bool
    knowledge_used: bool


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, user: dict | None = Depends(get_optional_user)):
    result = await run_agent(
        prompt=req.prompt,
        provider=req.provider,
        api_key=req.api_key,
        model=req.model,
        session_id=f"{user['id']}:{req.session_id}" if user else req.session_id,
        workspace_id=req.workspace_id,
        user=user,
        history=req.history,
        enable_rag=req.enable_rag,
    )
    return ChatResponse(**result)


@router.post("/stream")
async def chat_stream(req: ChatRequest, user: dict | None = Depends(get_optional_user)):
    async def event_stream():
        async for event in run_agent_stream(
            prompt=req.prompt,
            provider=req.provider,
            api_key=req.api_key,
            model=req.model,
            session_id=f"{user['id']}:{req.session_id}" if user else req.session_id,
            workspace_id=req.workspace_id,
            user=user,
            history=req.history,
            enable_rag=req.enable_rag,
        ):
            yield event

    return StreamingResponse(event_stream(), media_type="text/event-stream")


class ResearchRequest(BaseModel):
    query: str
    namespace: str = "global"


@router.post("/research")
async def research(req: ResearchRequest, user: dict | None = Depends(get_optional_user)):
    """Run RAG DAL research on a query. Returns structured findings with source credibility."""
    rag = _get_rag()
    report = await rag.research(req.query, namespace=req.namespace)
    return {
        "query": report.query,
        "passes_run": report.passes_run,
        "overall_confidence": report.overall_confidence,
        "sources_consulted": report.sources_consulted,
        "findings": report.findings,
        "open_questions": report.open_questions,
        "raw_sources": report.raw_sources,
        "markdown": report.to_markdown(),
    }


class KnowledgeUploadRequest(BaseModel):
    text: str
    source_url: str = ""
    source_title: str = "User Upload"
    namespace: str = "global"
    chunk_size: int = 1000


@router.post("/knowledge/upload")
async def upload_knowledge(req: KnowledgeUploadRequest, user: dict = Depends(get_current_user)):
    """Upload text to the knowledge base. Text is chunked and indexed for later retrieval."""
    rag = _get_rag()
    entry_ids = rag.knowledge_base.chunk_and_store(
        text=req.text,
        source_url=req.source_url,
        source_title=req.source_title,
        namespace=req.namespace,
        chunk_size=req.chunk_size,
    )
    return {"stored": len(entry_ids), "entry_ids": entry_ids, "namespace": req.namespace}


@router.get("/knowledge/search")
async def search_knowledge(
    q: str,
    namespace: str = "global",
    limit: int = 5,
    user: dict | None = Depends(get_optional_user),
):
    """Search the knowledge base for relevant entries."""
    rag = _get_rag()
    entries = rag.knowledge_base.search(q, namespace=namespace, limit=limit)
    return {
        "query": q,
        "results": [
            {
                "entry_id": e.entry_id,
                "summary": e.summary,
                "source_url": e.source_url,
                "source_title": e.source_title,
                "tier": e.tier,
                "credibility_score": e.credibility_score,
                "confidence": e.confidence,
                "retrieved_date": e.retrieved_date.isoformat(),
            }
            for e in entries
        ],
    }
