"""
RAG DAL — Retrieval-Augmented Generation Dynamic Acquisition Layer
3-tier source credibility + autonomous loop + knowledge base.
Integrated from rostr-agent-framework for Artispreneur v3.
"""
import json
import logging
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import IntEnum
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

import httpx

logger = logging.getLogger(__name__)


class SourceTier(IntEnum):
    PRIMARY = 1    # Weight: 1.0 — academic, government, official docs
    EDITORIAL = 2  # Weight: 0.75 — major news, analyst reports
    COMMUNITY = 3  # Weight: 0.40 — blogs, social, forums


# ── Tier classifier ────────────────────────────────────────────────────────────

TIER_DOMAINS = {
    SourceTier.PRIMARY: [
        "arxiv.org", "pubmed.ncbi.nlm.nih.gov", "scholar.google.com",
        "wikipedia.org", "britannica.com", "ieee.org", "acm.org",
        ".gov", ".edu", "official",
    ],
    SourceTier.EDITORIAL: [
        "reuters.com", "apnews.com", "bbc.com", "nytimes.com", "wsj.com",
        "bloomberg.com", "techcrunch.com", "theverge.com", "billboard.com",
        "pitchfork.com", "rollingstone.com", "nme.com", "variety.com",
        "musicbusinessworldwide.com", "hypebot.com",
    ],
    SourceTier.COMMUNITY: [
        "medium.com", "substack.com", "reddit.com", "youtube.com",
        "github.com", "stackoverflow.com", "news.ycombinator.com",
    ],
}

TIER_WEIGHTS = {SourceTier.PRIMARY: 1.0, SourceTier.EDITORIAL: 0.75, SourceTier.COMMUNITY: 0.40}


def classify_source(url: str) -> tuple[SourceTier, float]:
    domain = urlparse(url.lower()).netloc.replace("www.", "")
    for tier, domains in TIER_DOMAINS.items():
        for d in domains:
            if d in domain or domain.endswith(d):
                return tier, TIER_WEIGHTS[tier]
    return SourceTier.COMMUNITY, 0.40


# ── Data classes ───────────────────────────────────────────────────────────────

@dataclass
class SearchResult:
    url: str
    title: str
    snippet: str
    tier: SourceTier = SourceTier.COMMUNITY
    credibility_score: float = 0.4


@dataclass
class ExtractedContent:
    url: str
    title: str
    content: str
    author: Optional[str] = None
    published_date: Optional[datetime] = None
    tier: SourceTier = SourceTier.COMMUNITY
    credibility_score: float = 0.4


@dataclass
class KnowledgeEntry:
    entry_id: str
    query_origin: str
    content: str
    summary: str
    source_url: str
    source_title: str
    source_author: Optional[str] = None
    published_date: Optional[datetime] = None
    retrieved_date: datetime = field(default_factory=datetime.utcnow)
    tier: int = 3
    credibility_score: float = 0.4
    topics: list[str] = field(default_factory=list)
    confidence: float = 0.5
    verification_status: str = "uncertain"

    def to_dict(self) -> dict:
        d = {
            "entry_id": self.entry_id, "query_origin": self.query_origin,
            "content": self.content, "summary": self.summary,
            "source_url": self.source_url, "source_title": self.source_title,
            "source_author": self.source_author,
            "published_date": self.published_date.isoformat() if self.published_date else None,
            "retrieved_date": self.retrieved_date.isoformat(),
            "tier": self.tier, "credibility_score": self.credibility_score,
            "topics": self.topics, "confidence": self.confidence,
            "verification_status": self.verification_status,
        }
        return d

    @classmethod
    def from_dict(cls, data: dict) -> "KnowledgeEntry":
        if data.get("published_date"):
            data["published_date"] = datetime.fromisoformat(data["published_date"])
        data["retrieved_date"] = datetime.fromisoformat(data["retrieved_date"])
        return cls(**data)


@dataclass
class RAGReport:
    query: str
    passes_run: int
    overall_confidence: float
    sources_consulted: int
    date: datetime
    findings: list[dict] = field(default_factory=list)
    open_questions: list[str] = field(default_factory=list)
    raw_sources: list[dict] = field(default_factory=list)

    def to_markdown(self) -> str:
        md = f"# Research: {self.query}\n\n"
        md += f"**Confidence:** {self.overall_confidence:.1f}/10 | "
        md += f"**Sources:** {self.sources_consulted} | "
        md += f"**Passes:** {self.passes_run}\n\n"
        for f in self.findings:
            md += f"### {f['topic']}\n{f['answer'][:500]}\n\n"
        if self.open_questions:
            md += "## Open Questions\n\n"
            for q in self.open_questions:
                md += f"- {q}\n"
        return md


# ── Knowledge Base (JSON-file backed, pgvector-ready) ──────────────────────────

class KnowledgeBase:
    def __init__(self, storage_path: Path):
        self.path = Path(storage_path)
        self.path.mkdir(parents=True, exist_ok=True)

    def store(self, entry: KnowledgeEntry, namespace: str = "global") -> str:
        ns_path = self.path / namespace.replace("/", "_")
        ns_path.mkdir(parents=True, exist_ok=True)
        (ns_path / f"{entry.entry_id}.json").write_text(json.dumps(entry.to_dict(), indent=2))
        # Index
        with open(ns_path / "index.jsonl", "a") as f:
            f.write(json.dumps({
                "entry_id": entry.entry_id, "query_origin": entry.query_origin,
                "topics": entry.topics, "confidence": entry.confidence,
                "tier": entry.tier, "retrieved_date": entry.retrieved_date.isoformat(),
            }) + "\n")
        return entry.entry_id

    def search(self, query: str, namespace: str = "global", limit: int = 5) -> list[KnowledgeEntry]:
        ns_path = self.path / namespace.replace("/", "_")
        index_file = ns_path / "index.jsonl"
        if not index_file.exists():
            return []
        query_lower = query.lower()
        results = []
        with open(index_file) as f:
            for line in f:
                idx = json.loads(line)
                if query_lower in idx.get("query_origin", "").lower() or \
                   any(query_lower in t.lower() for t in idx.get("topics", [])):
                    entry_file = ns_path / f"{idx['entry_id']}.json"
                    if entry_file.exists():
                        results.append(KnowledgeEntry.from_dict(json.loads(entry_file.read_text())))
                if len(results) >= limit:
                    break
        return sorted(results, key=lambda e: e.confidence, reverse=True)

    def chunk_and_store(self, text: str, source_url: str, source_title: str,
                        namespace: str = "global", chunk_size: int = 1000) -> list[str]:
        """Chunk text and store as knowledge entries."""
        words = text.split()
        chunks = [" ".join(words[i : i + chunk_size]) for i in range(0, len(words), chunk_size)]
        ids = []
        for i, chunk in enumerate(chunks):
            entry = KnowledgeEntry(
                entry_id=str(uuid.uuid4()),
                query_origin=source_title,
                content=chunk,
                summary=chunk[:200],
                source_url=source_url,
                source_title=source_title,
                topics=[source_title],
                confidence=0.7,
                verification_status="uncertain",
            )
            ids.append(self.store(entry, namespace))
        return ids


# ── Web Search Executor ────────────────────────────────────────────────────────

class SearchExecutor:
    """Execute web searches with tier classification.
    Uses DuckDuckGo HTML search (no API key needed)."""

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0, follow_redirects=True,
                                         headers={"User-Agent": "Artispreneur/3.0 RAG"})

    async def search(self, query: str, max_results: int = 5) -> list[SearchResult]:
        results = []
        try:
            resp = await self.client.get(
                "https://html.duckduckgo.com/html/",
                params={"q": query},
            )
            if resp.status_code == 200:
                # Simple regex extraction from DuckDuckGo HTML
                titles = re.findall(r'class="result__title"[^>]*>.*?<a[^>]*>(.*?)</a>', resp.text, re.DOTALL)
                snippets = re.findall(r'class="result__snippet"[^>]*>(.*?)</', resp.text, re.DOTALL)
                urls = re.findall(r'class="result__url"[^>]*>(.*?)</', resp.text, re.DOTALL)

                for i in range(min(len(urls), max_results)):
                    url = urls[i].strip()
                    tier, credibility = classify_source(url)
                    results.append(SearchResult(
                        url=url,
                        title=re.sub(r'<[^>]+>', '', titles[i]).strip() if i < len(titles) else url,
                        snippet=re.sub(r'<[^>]+>', '', snippets[i]).strip() if i < len(snippets) else "",
                        tier=tier,
                        credibility_score=credibility,
                    ))
        except Exception as e:
            logger.warning(f"Search failed: {e}")

        return results

    async def extract_content(self, url: str) -> Optional[ExtractedContent]:
        try:
            resp = await self.client.get(url)
            if resp.status_code != 200:
                return None
            text = resp.text

            # Basic text extraction
            title_match = re.search(r"<title>(.*?)</title>", text, re.IGNORECASE)
            title = title_match.group(1).strip() if title_match else url

            # Strip tags
            clean = re.sub(r"<script[^>]*>.*?</script>", " ", text, flags=re.DOTALL | re.IGNORECASE)
            clean = re.sub(r"<style[^>]*>.*?</style>", " ", clean, flags=re.DOTALL | re.IGNORECASE)
            clean = re.sub(r"<[^>]+>", " ", clean)
            clean = re.sub(r"\s+", " ", clean).strip()[:5000]

            tier, credibility = classify_source(url)
            return ExtractedContent(
                url=url, title=title, content=clean,
                tier=tier, credibility_score=credibility,
            )
        except Exception as e:
            logger.warning(f"Extract failed for {url}: {e}")
            return None

    async def close(self):
        await self.client.aclose()


# ── RAG DAL Pipeline ───────────────────────────────────────────────────────────

class RAGPipeline:
    """Full RAG DAL pipeline with autonomous multi-pass loop."""

    def __init__(self, storage_path: Optional[Path] = None, confidence_threshold: float = 0.7,
                 max_passes: int = 2):
        self.storage_path = storage_path or Path("data/knowledge")
        self.confidence_threshold = confidence_threshold
        self.max_passes = max_passes
        self.search_executor = SearchExecutor()
        self.knowledge_base = KnowledgeBase(self.storage_path)

    async def research(self, query: str, namespace: str = "global") -> RAGReport:
        # Check cache
        cached = self.knowledge_base.search(query, namespace, limit=5)
        recent = [c for c in cached
                  if (datetime.utcnow() - c.retrieved_date).days < 7
                  and c.confidence >= self.confidence_threshold]
        if recent:
            return RAGReport(
                query=query, passes_run=0,
                overall_confidence=recent[0].confidence * 10,
                sources_consulted=len(recent), date=datetime.utcnow(),
                findings=[{"topic": query, "answer": c.summary,
                           "confidence": c.confidence * 10,
                           "primary_sources": [c.source_url]} for c in recent],
                raw_sources=[{"url": c.source_url, "title": c.source_title,
                              "tier": c.tier, "credibility": c.credibility_score}
                             for c in recent],
            )

        # Pass 1: Broad sweep
        all_results = await self.search_executor.search(query, max_results=5)
        all_content: list[ExtractedContent] = []
        for r in all_results[:3]:
            content = await self.search_executor.extract_content(r.url)
            if content:
                all_content.append(content)

        confidence = min(0.5 + len(all_content) * 0.15, 1.0)
        pass_count = 1

        # Pass 2: Gap fill if needed
        if confidence < self.confidence_threshold and pass_count < self.max_passes:
            pass_count += 1
            gap_results = await self.search_executor.search(f"{query} detailed analysis", max_results=3)
            for r in gap_results[:2]:
                content = await self.search_executor.extract_content(r.url)
                if content:
                    all_content.append(content)
            confidence = min(confidence + 0.2, 1.0)

        # Store in knowledge base
        for c in all_content:
            self.knowledge_base.store(KnowledgeEntry(
                entry_id=str(uuid.uuid4()),
                query_origin=query,
                content=c.content[:5000],
                summary=c.content[:300],
                source_url=c.url,
                source_title=c.title,
                source_author=c.author,
                published_date=c.published_date,
                retrieved_date=datetime.utcnow(),
                tier=c.tier.value,
                credibility_score=c.credibility_score,
                topics=[query],
                confidence=confidence,
                verification_status="verified" if confidence >= 0.8 else "uncertain",
            ), namespace)

        return RAGReport(
            query=query, passes_run=pass_count,
            overall_confidence=round(confidence * 10, 1),
            sources_consulted=len(all_results),
            date=datetime.utcnow(),
            findings=[{"topic": query, "answer": c.content[:500],
                       "confidence": confidence * 10,
                       "primary_sources": [c.url]} for c in all_content[:3]],
            open_questions=[] if confidence >= 0.8 else [f"Confidence below threshold ({confidence:.2f})"],
            raw_sources=[{"url": r.url, "title": r.title,
                          "tier": r.tier.value, "credibility": r.credibility_score}
                         for r in all_results],
        )

    async def close(self):
        await self.search_executor.close()
