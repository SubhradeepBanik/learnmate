"""AI Tutor service: a warm, patient, and friendly conversational university tutor."""

from app.services import vector_store
from app.services.embeddings import embed_texts
from app.services.llm import generate_text

TUTOR_SYSTEM_PROMPT = """You are "LearnMate AI Tutor" — an exceptionally warm, encouraging, and friendly university tutor.
Your mission is to make learning delightful, intuitive, and stress-free.

Key Guidelines:
1. Warm & Friendly Persona:
   - Greet the student enthusiastically (e.g., "Great question!", "Let's explore this together! 😊").
   - Break complicated ideas into easy, digestible bite-sized steps.
   - Use helpful analogies, examples, and bullet points.
   - Be patient, kind, and supportive.
2. Grounded in Study Materials:
   - When context passages from the student's uploaded documents are provided, prioritize them for facts and cite the source like [Page X] or [filename, p. X].
   - If the student asks casual questions or greetings, respond warmly and guide them to their study materials.
3. Bilingual Excellence:
   - Always reply in the requested language (English or pure Assamese).
"""

ASSAMESE_TUTOR_RULES = (
    "CRITICAL ASSAMESE INSTRUCTION:\n"
    "Reply in warm, friendly, natural Assamese (অসমীয়া), NOT Bengali!\n"
    "- Greet warmly: 'নমস্কাৰ! বৰ সুন্দৰ প্ৰশ্ন সুধিছা/সুধিছে। আহক আমি সহজকৈ বুজি লওঁ! 😊'\n"
    "- Use pure Assamese words: 'আমাৰ' (NOT 'আমাদের'), 'বাবে/কাৰণে' (NOT 'জন্য'), "
    "'-ৰ/-অৰ' (NOT 'এর'), 'এটা' (NOT 'একটি'), 'কয়' (NOT 'বলে'), 'কৰা হৈছে' (NOT 'করা হয়েছে'), "
    "'মাজত' (NOT 'মাঝে'), 'লগত/সৈতে' (NOT 'সাথে'), 'বুজিবলৈ' (NOT 'বোঝার জন্য').\n"
    "- Always use the distinct Assamese letters 'ৰ' and 'ৱ'.\n"
    "- Keep technical English terms in brackets after the Assamese term (e.g., বাক্যগঠনগত ভুল [syntax error])."
)


def chat_with_tutor(
    messages: list[dict],
    doc_id: str | None = None,
    lang: str = "en",
) -> dict:
    if not messages:
        return {"reply": "Hello there! How can I help you with your study materials today? 😊", "sources": []}

    latest_user_msg = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            latest_user_msg = m.get("content", "").strip()
            break

    if not latest_user_msg:
        latest_user_msg = messages[-1].get("content", "")

    # Retrieve context from uploaded materials
    context_str = ""
    sources = []
    try:
        if latest_user_msg:
            q_vec = embed_texts([latest_user_msg], "RETRIEVAL_QUERY")[0]
            hits = vector_store.query(q_vec, top_k=4, doc_id=doc_id)
            if hits:
                passages = []
                for n, h in enumerate(hits, start=1):
                    passages.append(f"[{n}] ({h['filename']}, page {h['page']}):\n{h['text']}")
                    sources.append({
                        "n": n,
                        "filename": h["filename"],
                        "page": h["page"],
                        "snippet": h["text"][:160],
                    })
                context_str = "\n\n".join(passages)
    except Exception:
        # If vector search fails or empty collection, tutor can still respond conversationally
        pass

    # Build conversation context
    history_lines = []
    for m in messages[-6:]:  # Keep recent history
        role_label = "Student" if m.get("role") == "user" else "Tutor"
        history_lines.append(f"{role_label}: {m.get('content')}")
    conversation_history = "\n".join(history_lines)

    lang_instruction = (
        ASSAMESE_TUTOR_RULES if lang == "as"
        else "Reply in friendly, clear English with supportive formatting and cheerful emojis."
    )

    prompt = f"""UPLOADED STUDY MATERIAL PASSAGES:
{context_str if context_str else "(No specific passages found; answer conversationally and invite them to ask about their materials)"}

CONVERSATION SO FAR:
{conversation_history}

INSTRUCTION:
{lang_instruction}
Explain in a very friendly, encouraging, and easy-to-understand manner.

Tutor:"""

    reply = generate_text(
        prompt=prompt,
        system_instruction=TUTOR_SYSTEM_PROMPT,
        temperature=0.3,
    )

    return {
        "reply": reply,
        "sources": sources,
    }
