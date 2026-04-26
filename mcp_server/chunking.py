"""SOAP-aware chunking for clinical notes.

Strategy:
  1. Look for SOAP section markers (``SUBJECTIVE:``, ``OBJECTIVE:``,
     ``ASSESSMENT:``, ``PLAN:``) at the start of a line. If at least two
     distinct markers are present we split on them and tag each chunk with
     its section.
  2. Otherwise fall back to recursive paragraph -> sentence character
     splitting with a target of ~500 tokens (approximated as
     ``TARGET_CHARS``) and a ~50-token overlap.

We approximate tokens as 4 characters each, which is close enough for
clinical English. Boundaries matter more than precise token counts for
retrieval quality.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

# ~500 tokens at ~4 chars/token, with ~50 tokens of overlap.
TARGET_TOKENS = 500
OVERLAP_TOKENS = 50
CHARS_PER_TOKEN = 4
TARGET_CHARS = TARGET_TOKENS * CHARS_PER_TOKEN
OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN

# Match a SOAP header at the start of a line (after optional whitespace),
# followed by a colon. ``ASSESSMENT AND PLAN`` is collapsed to ``ASSESSMENT``
# so the four-section taxonomy stays consistent.
_SOAP_RE = re.compile(
    r"(?im)^\s*(SUBJECTIVE|OBJECTIVE|ASSESSMENT\s+AND\s+PLAN|ASSESSMENT|PLAN)\s*:",
)


@dataclass(frozen=True)
class Chunk:
    """A single chunk of clinical text plus its SOAP section tag (if any)."""

    text: str
    soap_section: str | None  # "SUBJECTIVE" | "OBJECTIVE" | "ASSESSMENT" | "PLAN" | None


def _find_soap_markers(text: str) -> list[tuple[str, int]]:
    """Return ``[(section, start_offset), ...]`` for each SOAP header found."""
    out: list[tuple[str, int]] = []
    for m in _SOAP_RE.finditer(text):
        raw = re.sub(r"\s+", " ", m.group(1).upper()).strip()
        section = "ASSESSMENT" if raw == "ASSESSMENT AND PLAN" else raw
        out.append((section, m.start()))
    return out


def _split_recursive(
    text: str,
    target: int = TARGET_CHARS,
    overlap: int = OVERLAP_CHARS,
) -> list[str]:
    """Recursive character splitter — paragraphs, then sentences, then words."""
    text = text.strip()
    if not text:
        return []
    if len(text) <= target:
        return [text]

    # First try paragraph-level split.
    paragraphs = [p for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    current = ""
    for p in paragraphs:
        if len(p) > target:
            # Flush whatever was buffered, then sentence-split this paragraph.
            if current.strip():
                chunks.append(current.strip())
                current = current[-overlap:] if overlap else ""
            for sub in _split_by_sentence(p, target, overlap):
                chunks.append(sub)
            continue
        if len(current) + len(p) + 2 > target and current.strip():
            chunks.append(current.strip())
            tail = current[-overlap:] if overlap else ""
            current = (tail + "\n\n" + p) if tail else p
        else:
            current = (current + "\n\n" + p) if current else p
    if current.strip():
        chunks.append(current.strip())
    return chunks


def _split_by_sentence(text: str, target: int, overlap: int) -> list[str]:
    """Sentence-level splitter used when a single paragraph blows past target."""
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    chunks: list[str] = []
    current = ""
    for s in sentences:
        s = s.strip()
        if not s:
            continue
        # A single sentence longer than target — hard-wrap it.
        if len(s) > target:
            if current.strip():
                chunks.append(current.strip())
                current = current[-overlap:] if overlap else ""
            for piece in _hard_wrap(s, target, overlap):
                chunks.append(piece)
            continue
        if len(current) + len(s) + 1 > target and current.strip():
            chunks.append(current.strip())
            tail = current[-overlap:] if overlap else ""
            current = (tail + " " + s) if tail else s
        else:
            current = (current + " " + s) if current else s
    if current.strip():
        chunks.append(current.strip())
    return chunks


def _hard_wrap(text: str, target: int, overlap: int) -> list[str]:
    """Last-resort fixed-width split for absurdly long single sentences."""
    chunks: list[str] = []
    step = max(target - overlap, 1)
    i = 0
    while i < len(text):
        chunks.append(text[i : i + target].strip())
        i += step
    return [c for c in chunks if c]


def chunk_clinical_note(text: str) -> list[Chunk]:
    """Split a clinical note into chunks, preserving SOAP boundaries when present."""
    if not text or not text.strip():
        return []

    markers = _find_soap_markers(text)
    distinct_sections = {section for section, _ in markers}

    if len(distinct_sections) >= 2:
        return _chunk_soap(text, markers)

    return [Chunk(text=t, soap_section=None) for t in _split_recursive(text)]


def _chunk_soap(text: str, markers: list[tuple[str, int]]) -> list[Chunk]:
    """Build chunks from SOAP-tagged text. Anything before the first marker
    becomes untagged preamble chunks; each section becomes one or more chunks
    tagged with that section name."""
    chunks: list[Chunk] = []
    first_offset = markers[0][1]
    if first_offset > 0:
        preamble = text[:first_offset]
        for sub in _split_recursive(preamble):
            chunks.append(Chunk(text=sub, soap_section=None))

    for i, (section, start) in enumerate(markers):
        end = markers[i + 1][1] if i + 1 < len(markers) else len(text)
        section_text = text[start:end].strip()
        if not section_text:
            continue
        if len(section_text) <= TARGET_CHARS:
            chunks.append(Chunk(text=section_text, soap_section=section))
        else:
            for sub in _split_recursive(section_text):
                chunks.append(Chunk(text=sub, soap_section=section))
    return chunks
