// Thin wrapper around fetch for talking to the FastAPI backend.
// Paths start with /api, which Vite proxies to http://localhost:8000.

async function request(path, options = {}) {
  const response = await fetch(path, options);
  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      /* response had no JSON body */
    }
    throw new Error(message);
  }
  return response.json();
}

export const getHealth = () => request("/api/health");

export const getGreeting = (lang) => request(`/api/greeting?lang=${lang}`);

// ---- RAG ----
export const listDocuments = () => request("/api/rag/documents");

export const uploadDocument = ({ file, subject, topic }) => {
  const form = new FormData();
  form.append("file", file);
  form.append("subject", subject);
  form.append("topic", topic);
  return request("/api/rag/documents", { method: "POST", body: form });
};

export const deleteDocument = (docId) =>
  request(`/api/rag/documents/${docId}`, { method: "DELETE" });

export const askQuestion = (payload) =>
  request("/api/rag/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

// ---- AI Tutor ----
export const chatWithTutor = ({ messages, docId, lang }) =>
  request("/api/tutor/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, doc_id: docId || null, lang }),
  });

// ---- Quiz Studio ----
export const generateQuiz = ({ docId, numQuestions = 5, difficulty = "medium", lang = "en" }) =>
  request("/api/quiz/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doc_id: docId || null,
      num_questions: Number(numQuestions),
      difficulty,
      lang,
    }),
  });
