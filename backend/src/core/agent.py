"""
Artispreneur v3 Agent — Full ROSTR pipeline with PAL + RAG DAL + Streaming.
Integrated from rostr-agent-framework.
"""
import json
import logging
from typing import Any, AsyncGenerator, Optional

import httpx

from .config import settings
from .pal import PALCompiler, CompiledInstruction, pal as default_pal
from .rag import RAGPipeline

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# SYSTEM PROMPT — from rostr-agent-framework MASTER_AGENT_PROMPT.md, adapted
# ═══════════════════════════════════════════════════════════════════════════════

SYSTEM_PROMPT = """You are the Artispreneur AI Agent — a music industry intelligence system built on the ROSTR framework.

## YOUR CAPABILITIES
You help independent artists, labels, managers, and music professionals with:
- **Contact Discovery**: Finding radio stations, playlist curators, venues, blogs, labels, podcasts
- **Outreach**: Writing personalized pitch emails, press releases, booking inquiries
- **Release Planning**: Strategy, timeline, asset checklists, market analysis
- **Industry Research**: Market trends, competitive analysis, genre insights
- **Career Strategy**: Growth planning, audience building, monetization

## HOW YOU WORK
1. **PAL Compiler** extracts intent and domain from every message
2. **RAG DAL** retrieves relevant knowledge from the database when research is needed
3. **NPAO** prioritizes tasks by urgency and business impact
4. **Context Memory** tracks session history for continuity

## RESPONSE GUIDELINES
- Be specific, actionable, and concise — no generic advice
- When recommending contacts, mention names, locations, and relevance
- Use bullet points for lists, bold for key terms
- If you don't know something specific, say so and suggest where to look
- Default to helping the user take the next concrete step

## MUSIC INDUSTRY KNOWLEDGE
You have access to 79,000+ verified music industry contacts across 14 resource types.
You understand genres, sub-genres, regional scenes, and career stages.
You know the difference between a college radio station and a commercial one,
an independent playlist curator and a Spotify editorial playlist,
a DIY venue and an AEG-owned room.

You are helpful, knowledgeable, and direct. Art means business."""

MUSIC_AGENT_SYSTEM = SYSTEM_PROMPT + """

## MUSIC AGENT SPECIALIZATION
As the Music Agent, your primary job is connecting artists with the right industry contacts.
When users ask about finding contacts:
1. Identify their genre, location, and career stage
2. Recommend specific resource types (radio, blogs, playlists, venues, labels)
3. Explain WHY each type matters for their specific goal
4. Provide actionable next steps with templates when appropriate

For outreach: Always provide a concrete template the user can adapt.
For research: Always cite your reasoning, not just conclusions.
For strategy: Always break it into phases with clear milestones."""


# ── RAG Pipeline (lazy init) ──────────────────────────────────────────────────

_rag: Optional[RAGPipeline] = None


def get_rag() -> RAGPipeline:
    global _rag
    if _rag is None:
        from pathlib import Path
        _rag = RAGPipeline(storage_path=Path(settings.data_dir) / "knowledge")
    return _rag


# ── Agent Runner ───────────────────────────────────────────────────────────────

async def run_agent(
    prompt: str,
    provider: str = "anthropic",
    api_key: str = "",
    model: str = "",
    session_id: str = "default",
    workspace_id: Optional[str] = None,
    user: Optional[dict] = None,
    history: Optional[list[dict]] = None,
    enable_rag: bool = True,
) -> dict[str, Any]:
    """Full agent pipeline: PAL → RAG → LLM → Response."""

    # Step 1: PAL Compile
    compiler = default_pal  # Use global instance

    # Step 2: RAG DAL — retrieve relevant knowledge
    knowledge_context = ""
    if enable_rag:
        try:
            rag = get_rag()
            report = await rag.research(prompt, namespace=f"workspace_{workspace_id or 'default'}")
            if report.findings:
                knowledge_context = report.to_markdown()[:2000]
        except Exception as e:
            logger.warning(f"RAG research failed: {e}")

    # Step 3: Full PAL compilation with context
    compiled = compiler.compile(
        raw_input=prompt,
        workspace_id=workspace_id,
        user=user,
        knowledge=knowledge_context,
    )

    # Step 4: Resolve provider
    provider = provider or settings.default_provider
    api_key = api_key or _get_key(provider)
    model = model or compiled.runtime_config.get("model", _default_model(provider))

    if not api_key:
        return _fallback(compiled)

    # Step 5: Build messages
    system = MUSIC_AGENT_SYSTEM if compiled.intent.domain.value == "music" else SYSTEM_PROMPT
    if knowledge_context:
        system += f"\n\n## Research Context\n{knowledge_context[:1500]}"
    if compiled.context.to_prompt():
        system += f"\n\n{compiled.context.to_prompt()}"

    messages = [{"role": "user", "content": compiled.enhanced_prompt}]
    if history:
        # Transform history to API format
        formatted = []
        for h in history[-10:]:
            role = "assistant" if h.get("role") == "assistant" else "user"
            formatted.append({"role": role, "content": h.get("content", "")})
        messages = formatted + messages

    # Step 6: Call LLM
    try:
        if provider == "openai":
            reply = await _call_openai(api_key, model, system, messages)
        else:
            reply = await _call_anthropic(api_key, model, system, messages)
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        reply = _fallback_text(compiled)

    return {
        "message": reply,
        "intent": compiled.intent.primary_intent,
        "domain": compiled.intent.domain.value,
        "agent_type": compiled.route.agent_type,
        "priority_score": compiled.priority_score,
        "npao_phase": compiled.npao_phase,
        "model": model,
        "provider": provider,
        "success": True,
        "knowledge_used": bool(knowledge_context),
    }


async def run_agent_stream(
    prompt: str,
    provider: str = "anthropic",
    api_key: str = "",
    model: str = "",
    session_id: str = "default",
    workspace_id: Optional[str] = None,
    user: Optional[dict] = None,
    history: Optional[list[dict]] = None,
    enable_rag: bool = True,
) -> AsyncGenerator[str, None]:
    """Streaming agent pipeline — yields SSE events."""

    # PAL compile (same as above)
    knowledge_context = ""
    if enable_rag:
        try:
            rag = get_rag()
            report = await rag.research(prompt, namespace=f"workspace_{workspace_id or 'default'}")
            if report.findings:
                knowledge_context = report.to_markdown()[:2000]
        except Exception as e:
            logger.warning(f"RAG research failed: {e}")

    compiled = default_pal.compile(
        raw_input=prompt, workspace_id=workspace_id, user=user, knowledge=knowledge_context,
    )

    provider = provider or settings.default_provider
    api_key = api_key or _get_key(provider)
    model = model or compiled.runtime_config.get("model", _default_model(provider))

    # Yield metadata first
    yield f"data: {json.dumps({'type': 'meta', 'intent': compiled.intent.primary_intent, 'domain': compiled.intent.domain.value, 'agent_type': compiled.route.agent_type, 'npao_phase': compiled.npao_phase, 'priority_score': compiled.priority_score})}\n\n"

    if not api_key:
        # Stream fallback response character by character
        text = _fallback_text(compiled)
        for i in range(0, len(text), 20):
            yield f"data: {json.dumps({'type': 'chunk', 'content': text[i:i+20]})}\n\n"
        yield f"data: {json.dumps({'type': 'done', 'success': True})}\n\n"
        return

    # Build messages
    system = MUSIC_AGENT_SYSTEM if compiled.intent.domain.value == "music" else SYSTEM_PROMPT
    if knowledge_context:
        system += f"\n\n## Research Context\n{knowledge_context[:1500]}"

    messages = [{"role": "user", "content": compiled.enhanced_prompt}]
    if history:
        formatted = []
        for h in history[-10:]:
            role = "assistant" if h.get("role") == "assistant" else "user"
            formatted.append({"role": role, "content": h.get("content", "")})
        messages = formatted + messages

    # Stream from LLM
    try:
        if provider == "openai":
            async for chunk in _stream_openai(api_key, model, system, messages):
                yield chunk
        else:
            async for chunk in _stream_anthropic(api_key, model, system, messages):
                yield chunk
    except Exception as e:
        logger.error(f"Stream failed: {e}")
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    yield f"data: {json.dumps({'type': 'done', 'success': True, 'domain': compiled.intent.domain.value})}\n\n"


# ── LLM Providers ──────────────────────────────────────────────────────────────

async def _call_anthropic(api_key: str, model: str, system: str, messages: list) -> str:
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key, "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={"model": model, "system": system, "messages": messages, "max_tokens": 2048},
        )
        resp.raise_for_status()
        return resp.json()["content"][0]["text"]


async def _stream_anthropic(api_key: str, model: str, system: str, messages: list) -> AsyncGenerator[str, None]:
    async with httpx.AsyncClient(timeout=120) as client:
        async with client.stream(
            "POST", "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key, "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={
                "model": model, "system": system, "messages": messages,
                "max_tokens": 2048, "stream": True,
            },
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    data = json.loads(line[6:])
                    if data.get("type") == "content_block_delta":
                        text = data.get("delta", {}).get("text", "")
                        if text:
                            yield f"data: {json.dumps({'type': 'chunk', 'content': text})}\n\n"
                    elif data.get("type") == "message_stop":
                        break


async def _call_openai(api_key: str, model: str, system: str, messages: list) -> str:
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [{"role": "system", "content": system}] + messages,
                "max_tokens": 2048,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def _stream_openai(api_key: str, model: str, system: str, messages: list) -> AsyncGenerator[str, None]:
    async with httpx.AsyncClient(timeout=120) as client:
        async with client.stream(
            "POST", "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [{"role": "system", "content": system}] + messages,
                "max_tokens": 2048, "stream": True,
            },
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    data_str = line[6:]
                    if data_str.strip() == "[DONE]":
                        break
                    try:
                        data = json.loads(data_str)
                        delta = data.get("choices", [{}])[0].get("delta", {})
                        text = delta.get("content", "")
                        if text:
                            yield f"data: {json.dumps({'type': 'chunk', 'content': text})}\n\n"
                    except json.JSONDecodeError:
                        pass


# ── Helpers ─────────────────────────────────────────────────────────────────────

def _get_key(provider: str) -> str:
    return {"anthropic": settings.anthropic_api_key, "openai": settings.openai_api_key}.get(provider, "")


def _default_model(provider: str) -> str:
    return {"anthropic": "claude-sonnet-4-20250514", "openai": "gpt-4o"}.get(provider, settings.default_model)


def _fallback(compiled: CompiledInstruction) -> dict:
    return {
        "message": _fallback_text(compiled),
        "intent": compiled.intent.primary_intent,
        "domain": compiled.intent.domain.value,
        "agent_type": compiled.route.agent_type,
        "priority_score": compiled.priority_score,
        "npao_phase": compiled.npao_phase,
        "model": "fallback",
        "provider": "local",
        "success": True,
        "knowledge_used": False,
    }


def _fallback_text(compiled: CompiledInstruction) -> str:
    domain = compiled.intent.domain.value

    if domain == "music":
        if "pitch" in compiled.intent.raw_input.lower() or "email" in compiled.intent.raw_input.lower() or "outreach" in compiled.intent.raw_input.lower():
            return (
                "Here's a professional outreach template:\n\n"
                "**Subject:** [Your Artist Name] — [Genre] submission for [Contact Name]\n\n"
                "Hi [Name],\n\n"
                "I'm [Your Name], a [genre] artist from [city]. I've been following "
                "[their work/publication/station] and think my latest release "
                "[Track/Album Name] would be a great fit for [their audience/playlist/show].\n\n"
                "**Quick stats:** [streaming numbers / notable placements / press quotes]\n\n"
                "**Private link:** [streaming link]\n\n"
                "Thanks for your time and consideration.\n\n"
                "Best,\n[Your Name]"
            )
        return (
            "I can help you with your music career. Here are the areas I specialize in:\n\n"
            "• **Find Contacts** — Radio stations, playlists, venues, blogs, labels, podcasts\n"
            "• **Write Pitches** — Personalized outreach emails that get responses\n"
            "• **Plan Releases** — Strategy, timeline, and asset checklists\n"
            "• **Research** — Market trends, genre insights, competitive analysis\n\n"
            "What genre do you work in, and what's your immediate goal?"
        )

    if domain == "research":
        return (
            "I can research that for you! Here's what I'd look into:\n\n"
            f"1. **Topic:** {compiled.intent.subject[:100]}\n"
            "2. **Sources:** Industry databases, news outlets, community discussions\n"
            "3. **Output:** Structured findings with source credibility ratings\n\n"
            "For the most accurate results, tell me specifically what aspect you want to focus on."
        )

    if domain == "sales":
        return (
            "Ready to help with outreach! Here's my approach:\n\n"
            "1. **Research** the target contact and organization\n"
            "2. **Personalize** based on their recent work/interests\n"
            "3. **Craft** a concise, value-forward message\n"
            "4. **Include** relevant credentials and links\n\n"
            "Who are you trying to reach, and what's your goal?"
        )

    return (
        f"I understand you need help with: {compiled.intent.subject[:150]}\n\n"
        f"**Domain:** {domain} | **Agent:** {compiled.route.agent_type} | "
        f"**Priority:** {compiled.priority_score}/10\n\n"
        "How can I assist you more specifically?"
    )
