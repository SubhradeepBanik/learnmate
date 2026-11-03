"""Split page text into overlapping chunks, preferring sentence boundaries."""

import re

# Splits after . ? ! and the Assamese/Hindi danda । and double danda ॥
SENTENCE_END = re.compile(r"(?<=[।॥.?!])\s+")
MIN_CHUNK_CHARS = 20


def _hard_split(text: str, size: int) -> list[str]:
    return [text[i : i + size] for i in range(0, len(text), size)]


def _overlap_tail(text: str, overlap: int) -> str:
    if len(text) <= overlap:
        return text
    tail = text[-overlap:]
    space = tail.find(" ")
    return tail[space + 1 :] if space != -1 else tail


def chunk_page(text: str, size: int, overlap: int) -> list[str]:
    # PDF line breaks usually fall mid-sentence, so treat them as spaces
    text = re.sub(r"\s+", " ", text).strip()
    pieces = [p.strip() for p in SENTENCE_END.split(text) if p.strip()]

    chunks: list[str] = []
    current = ""
    for piece in pieces:
        for part in _hard_split(piece, size):  # guards against one giant "sentence"
            if current and len(current) + len(part) + 1 > size:
                chunks.append(current)
                current = _overlap_tail(current, overlap)
            current = f"{current} {part}".strip()
    if current:
        chunks.append(current)

    return [c for c in chunks if len(c) >= MIN_CHUNK_CHARS]