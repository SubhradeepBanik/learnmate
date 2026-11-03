"""Quiz Studio service: generates interactive multiple-choice questions from uploaded materials."""

import json
import re

from app.services import vector_store
from app.services.llm import generate_text

QUIZ_SYSTEM_PROMPT = """You are LearnMate Quiz Studio.
Your role is to create engaging, educational multiple-choice quizzes strictly based on the provided study materials.

Output format MUST be valid JSON only. Do not include markdown preamble or conversational commentary outside the JSON array."""

ASSAMESE_QUIZ_RULES = (
    "CRITICAL ASSAMESE INSTRUCTION:\n"
    "Generate all questions, options, and explanations in pure, authentic Assamese (অসমীয়া), NOT Bengali!\n"
    "- Use pure Assamese vocabulary: 'আমাৰ', 'বাবে', '-ৰ/-অৰ', 'এটা', 'কয়', 'কৰা হৈছে', 'মাজত', 'লগত'.\n"
    "- Always use the distinct Assamese letters 'ৰ' and 'ৱ'.\n"
    "- Keep technical terms in English inside brackets if needed (e.g. বাক্যগঠন [syntax])."
)


def generate_quiz(
    doc_id: str | None = None,
    num_questions: int = 5,
    difficulty: str = "medium",
    lang: str = "en",
) -> list[dict]:
    num_questions = max(1, min(10, num_questions))

    # Retrieve representative chunks from the selected document or all documents
    chunks = vector_store.get_document_chunks(doc_id=doc_id, limit=15)
    if not chunks:
        raise ValueError("No study materials found. Please upload a PDF in 'Ask Your PDF' first!")

    passages = []
    for c in chunks[:12]:
        passages.append(f"[Source: {c['filename']}, Page {c['page']}]\n{c['text']}")
    context_text = "\n\n---\n\n".join(passages)

    lang_rule = (
        ASSAMESE_QUIZ_RULES if lang == "as"
        else "All questions, options, and explanations must be in clear English."
    )

    prompt = f"""STUDY MATERIAL PASSAGES:
{context_text}

TASK:
Create exactly {num_questions} multiple-choice questions based STRICTLY on the facts in the study materials above.
Difficulty level: {difficulty.upper()}

{lang_rule}

STRICT OUTPUT FORMAT:
Respond with a JSON array of objects with the following schema:
[
  {{
    "id": 1,
    "question": "Question text here?",
    "options": [
      "A. First option",
      "B. Second option",
      "C. Third option",
      "D. Fourth option"
    ],
    "answer_index": 0,
    "explanation": "Clear explanation of why option A is correct and cites the concept.",
    "source": "Page number or topic reference"
  }}
]

Important rules:
1. "answer_index" must be an integer from 0 to 3 pointing to the correct option in "options".
2. Ensure each question has 4 distinct options labeled A., B., C., D.
3. Only return valid JSON."""

    raw_response = generate_text(
        prompt=prompt,
        system_instruction=QUIZ_SYSTEM_PROMPT,
        temperature=0.2,
    )

    # Clean markdown code blocks if the LLM wrapped it in ```json ... ```
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
        if isinstance(data, list):
            return data
        if isinstance(data, dict) and "questions" in data:
            return data["questions"]
    except Exception as exc:
        # Fallback regex extraction if JSON had trailing characters
        match = re.search(r"\[\s*\{.*\}\s*\]", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
        raise ValueError(f"Could not parse quiz questions from LLM response: {exc}")

    return []
