"""
ROSTR PAL Compiler — Full pipeline: Intent → Context → Enhance → Route → Compile
Integrated from rostr-agent-framework for Artispreneur v3 backend.
"""
import json
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Optional

logger = logging.getLogger(__name__)


class Domain(str, Enum):
    CODE = "code"
    DESIGN = "design"
    RESEARCH = "research"
    OPS = "ops"
    SALES = "sales"
    CONTENT = "content"
    DEPLOY = "deploy"
    DEBUG = "debug"
    MUSIC = "music"


class Urgency(str, Enum):
    IMMEDIATE = "immediate"
    QUEUED = "queued"
    SCHEDULED = "scheduled"


@dataclass
class Intent:
    primary_intent: str
    domain: Domain
    subject: str
    constraints: list[str] = field(default_factory=list)
    desired_output: str = ""
    urgency: Urgency = Urgency.QUEUED
    ambiguity_score: float = 0.5
    raw_input: str = ""

    def to_dict(self) -> dict:
        return {
            "primary_intent": self.primary_intent,
            "domain": self.domain.value,
            "subject": self.subject,
            "constraints": self.constraints,
            "desired_output": self.desired_output,
            "urgency": self.urgency.value,
            "ambiguity_score": self.ambiguity_score,
        }


@dataclass
class AgentContext:
    project_context: dict = field(default_factory=dict)
    user_context: dict = field(default_factory=dict)
    org_context: dict = field(default_factory=dict)
    session_context: dict = field(default_factory=dict)
    knowledge_context: str = ""

    def to_prompt(self) -> str:
        parts = []
        if self.knowledge_context:
            parts.append(f"## Relevant Knowledge\n{self.knowledge_context}")
        if self.project_context.get("name"):
            parts.append(f"Project: {self.project_context['name']}")
        if self.session_context.get("previous_tasks"):
            parts.append(
                f"Previous Tasks: {len(self.session_context['previous_tasks'])} completed"
            )
        return "\n".join(parts)


@dataclass
class RouteTarget:
    agent_type: str = "general"
    tools_enabled: dict = field(default_factory=lambda: {
        "web_search": True, "code_execution": False, "file_system": True,
    })
    memory_mode: str = "session"
    output_format: str = "markdown"
    verification_required: bool = False


@dataclass
class CompiledInstruction:
    intent: Intent
    context: AgentContext
    enhanced_prompt: str
    route: RouteTarget
    runtime_config: dict = field(default_factory=dict)
    priority_score: float = 5.0
    npao_phase: str = "development"

    def to_dict(self) -> dict:
        return {
            "intent": self.intent.to_dict(),
            "route": {
                "agent_type": self.route.agent_type,
                "tools_enabled": self.route.tools_enabled,
                "memory_mode": self.route.memory_mode,
                "output_format": self.route.output_format,
                "verification_required": self.route.verification_required,
            },
            "enhanced_prompt": self.enhanced_prompt,
            "runtime_config": self.runtime_config,
            "priority_score": self.priority_score,
            "npao_phase": self.npao_phase,
        }


class IntentExtractor:
    """Extract structured intent from natural language input.
    Uses keyword-based extraction (Haiku-compatible fallback)."""

    INTENT_KEYWORDS = {
        Domain.CODE: ["build", "code", "implement", "create app", "write function", "api", "component"],
        Domain.DESIGN: ["design", "style", "layout", "ui", "ux", "look", "visual"],
        Domain.RESEARCH: ["research", "find", "search", "analyze", "compare", "what is", "how to"],
        Domain.SALES: ["pitch", "email", "outreach", "contact", "reach out", "sell", "promote"],
        Domain.CONTENT: ["write", "blog", "article", "post", "description", "bio", "copy"],
        Domain.DEPLOY: ["deploy", "ship", "publish", "release", "launch", "push"],
        Domain.DEBUG: ["bug", "fix", "error", "broken", "issue", "debug", "not working"],
        Domain.MUSIC: ["music", "artist", "song", "track", "album", "genre", "beat", "mix", "master",
                        "radio", "playlist", "venue", "label", "tour", "gig", "show", "booking"],
        Domain.OPS: ["setup", "configure", "install", "deploy", "migrate", "backup", "monitor"],
    }

    DOMAIN_MAP = {
        "music": Domain.MUSIC, "artist": Domain.MUSIC, "song": Domain.MUSIC,
        "radio": Domain.MUSIC, "playlist": Domain.MUSIC, "venue": Domain.MUSIC,
        "label": Domain.MUSIC, "tour": Domain.MUSIC, "gig": Domain.MUSIC,
        "pitch": Domain.SALES, "outreach": Domain.SALES, "email": Domain.SALES,
        "research": Domain.RESEARCH, "find": Domain.RESEARCH, "search": Domain.RESEARCH,
        "build": Domain.CODE, "code": Domain.CODE, "api": Domain.CODE,
        "design": Domain.DESIGN, "style": Domain.DESIGN, "ui": Domain.DESIGN,
        "bug": Domain.DEBUG, "fix": Domain.DEBUG, "error": Domain.DEBUG,
        "deploy": Domain.DEPLOY, "publish": Domain.DEPLOY, "ship": Domain.DEPLOY,
        "write": Domain.CONTENT, "blog": Domain.CONTENT, "article": Domain.CONTENT,
    }

    def extract(self, raw_input: str) -> Intent:
        lower = raw_input.lower()

        # Score each domain by keyword matches
        scores: dict[Domain, int] = {}
        for domain, keywords in self.INTENT_KEYWORDS.items():
            scores[domain] = sum(1 for kw in keywords if kw in lower)

        # Boost music domain for music-industry terms
        music_boost = sum(1 for kw in ["hip hop", "rap", "r&b", "rock", "pop", "edm", "jazz",
                                        "indie", "folk", "country", "electronic", "soul",
                                        "funk", "reggae", "metal", "punk", "blues", "latin",
                                        "blog", "radio station", "spotify", "apple music",
                                        "soundcloud", "bandcamp"]
                          if kw in lower)
        scores[Domain.MUSIC] = scores.get(Domain.MUSIC, 0) + music_boost * 2

        domain = max(scores, key=lambda k: scores[k]) if any(scores.values()) else Domain.RESEARCH
        confidence = scores[domain] / max(sum(scores.values()), 1)

        # Extract subject as the main noun phrase after domain keywords
        subject = raw_input[:100]

        # Keyword-based urgency
        if any(w in lower for w in ["urgent", "asap", "immediately", "now", "broken", "down"]):
            urgency = Urgency.IMMEDIATE
        elif any(w in lower for w in ["later", "someday", "eventually", "whenever"]):
            urgency = Urgency.SCHEDULED
        else:
            urgency = Urgency.QUEUED

        return Intent(
            primary_intent=raw_input,
            domain=domain,
            subject=subject,
            constraints=[],
            desired_output="",
            urgency=urgency,
            ambiguity_score=1.0 - confidence,
            raw_input=raw_input,
        )


class ContextInjector:
    """Inject workspace, user, and knowledge context into instructions."""

    def inject(
        self,
        workspace_id: Optional[str] = None,
        user: Optional[dict] = None,
        knowledge: Optional[str] = None,
    ) -> AgentContext:
        ctx = AgentContext()

        if workspace_id:
            ctx.project_context["name"] = workspace_id

        if user:
            ctx.user_context = {
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "plan": user.get("plan", "free"),
            }

        if knowledge:
            ctx.knowledge_context = knowledge

        return ctx


class Router:
    """Route instructions to appropriate execution targets."""

    DOMAIN_ROUTING = {
        Domain.CODE: RouteTarget(agent_type="builder", output_format="code",
                                   tools_enabled={"file_system": True, "code_execution": True, "web_search": False}),
        Domain.DESIGN: RouteTarget(agent_type="designer", output_format="file",
                                    tools_enabled={"file_system": True, "web_search": True, "code_execution": False}),
        Domain.RESEARCH: RouteTarget(agent_type="researcher", output_format="markdown",
                                      tools_enabled={"web_search": True, "file_system": False, "code_execution": False}),
        Domain.SALES: RouteTarget(agent_type="outreach", output_format="markdown",
                                   tools_enabled={"web_search": True, "code_execution": False}),
        Domain.CONTENT: RouteTarget(agent_type="writer", output_format="markdown",
                                     tools_enabled={"web_search": True, "code_execution": False}),
        Domain.DEPLOY: RouteTarget(agent_type="deployer", output_format="action",
                                    tools_enabled={"file_system": True, "code_execution": True},
                                    verification_required=True),
        Domain.DEBUG: RouteTarget(agent_type="debugger", output_format="markdown",
                                   tools_enabled={"file_system": True, "code_execution": True, "web_search": True}),
        Domain.MUSIC: RouteTarget(agent_type="music_agent", output_format="markdown",
                                   tools_enabled={"web_search": True, "code_execution": False}),
        Domain.OPS: RouteTarget(agent_type="ops", output_format="action",
                                 tools_enabled={"file_system": True, "code_execution": True},
                                 verification_required=True),
    }

    def route(self, intent: Intent) -> RouteTarget:
        target = self.DOMAIN_ROUTING.get(intent.domain)
        if target is None:
            target = RouteTarget()
        if intent.urgency == Urgency.IMMEDIATE:
            target.memory_mode = "session"
        if intent.ambiguity_score > 0.7:
            target.verification_required = True
        return target


class NPAOScorer:
    """Priority scoring: Phase Urgency × Dependency Impact × Business Impact × Resource Efficiency."""

    PHASE_URGENCY = {
        "debug": 10, "deploy": 8, "development": 6, "design": 4, "research": 3, "content": 2,
    }

    def score(self, intent: Intent, route: RouteTarget) -> tuple[float, str]:
        phase = self._determine_phase(intent)
        urgency = self.PHASE_URGENCY.get(phase, 5)
        score = (
            urgency * 0.35
            + min(intent.ambiguity_score * 10, 10) * 0.25
            + (10 if route.verification_required else 5) * 0.25
            + (8 if intent.domain == Domain.MUSIC else 5) * 0.15
        )
        return round(score, 1), phase

    def _determine_phase(self, intent: Intent) -> str:
        phase_map = {
            Domain.DEBUG: "debug",
            Domain.DEPLOY: "deploy",
            Domain.CODE: "development",
            Domain.DESIGN: "design",
            Domain.RESEARCH: "research",
            Domain.SALES: "content",
            Domain.CONTENT: "content",
            Domain.MUSIC: "research",
        }
        return phase_map.get(intent.domain, "development")


# ── Full PAL Compiler ──────────────────────────────────────────────────────────

class PALCompiler:
    """Full 5-step compiler from rostr-agent-framework, adapted for FastAPI."""

    def __init__(self):
        self.intent_extractor = IntentExtractor()
        self.context_injector = ContextInjector()
        self.router = Router()
        self.npao = NPAOScorer()

    def compile(
        self,
        raw_input: str,
        workspace_id: Optional[str] = None,
        user: Optional[dict] = None,
        knowledge: Optional[str] = None,
    ) -> CompiledInstruction:
        # Step 1: Extract Intent
        intent = self.intent_extractor.extract(raw_input)
        logger.info(f"PAL intent: domain={intent.domain.value} subject={intent.subject[:60]}")

        # Step 2: Inject Context
        context = self.context_injector.inject(
            workspace_id=workspace_id, user=user, knowledge=knowledge
        )

        # Step 3: Semantic Enhancement
        enhanced = self._enhance(intent, context)

        # Step 4: Route
        route = self.router.route(intent)

        # Step 5: NPAO Priority
        priority_score, npao_phase = self.npao.score(intent, route)

        return CompiledInstruction(
            intent=intent,
            context=context,
            enhanced_prompt=enhanced,
            route=route,
            runtime_config={
                "model": "claude-sonnet-4-20250514" if intent.ambiguity_score > 0.5 else "claude-haiku-4-5",
                "temperature": 0.2 if intent.domain in (Domain.CODE, Domain.DEBUG) else 0.7,
                "max_tokens": 2048,
            },
            priority_score=priority_score,
            npao_phase=npao_phase,
        )

    def _enhance(self, intent: Intent, context: AgentContext) -> str:
        """Enhance intent with domain-specific context."""
        domain_prefixes = {
            Domain.MUSIC: "[TASK: Music industry assistance]\n",
            Domain.SALES: "[TASK: Professional outreach]\n",
            Domain.RESEARCH: "[TASK: Research & analysis]\n",
            Domain.CODE: "[TASK: Software development]\n",
            Domain.DESIGN: "[TASK: Design work]\n",
            Domain.DEBUG: "[TASK: Debug & fix]\n",
            Domain.DEPLOY: "[TASK: Deploy to production]\n",
            Domain.CONTENT: "[TASK: Content creation]\n",
        }
        prefix = domain_prefixes.get(intent.domain, "[TASK: General assistance]\n")
        context_str = context.to_prompt()
        if context_str:
            prefix += f"\n{context_str}\n"
        return prefix + intent.raw_input


# Global instance
pal = PALCompiler()
