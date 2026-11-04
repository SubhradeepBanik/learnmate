"""Extract text from PDFs with PyMuPDF, one entry per page."""

import io
import unicodedata
from pathlib import Path

import pymupdf


def extract_pages(pdf_path: Path) -> tuple[int, list[dict]]:
    """Returns (total_pages, [{"page": 1, "text": "..."}, ...]).
    Pages with no selectable text (scans, blank pages) are skipped."""
    pages = []
    with pymupdf.open(pdf_path) as doc:
        if doc.needs_pass:
            raise ValueError("password-protected")
        total_pages = doc.page_count
        for number, page in enumerate(doc, start=1):
            # NFC keeps Assamese characters (ৰ, ৱ, conjuncts) in one consistent form
            text = unicodedata.normalize("NFC", page.get_text("text")).strip()
            if text:
                pages.append({"page": number, "text": text})
    return total_pages, pages


def extract_pages_from_bytes(pdf_bytes: bytes) -> tuple[int, list[dict]]:
    """Same as extract_pages but reads from bytes — no disk I/O needed."""
    pages = []
    with pymupdf.open(stream=io.BytesIO(pdf_bytes), filetype="pdf") as doc:
        if doc.needs_pass:
            raise ValueError("password-protected")
        total_pages = doc.page_count
        for number, page in enumerate(doc, start=1):
            text = unicodedata.normalize("NFC", page.get_text("text")).strip()
            if text:
                pages.append({"page": number, "text": text})
    return total_pages, pages
