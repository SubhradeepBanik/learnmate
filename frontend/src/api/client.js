const rawUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_BASE_URL = rawUrl.trim().replace(/\/+$/, "");

// Health Check with retry and timeout support
export async function getHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal,
    }).catch(() =>
      fetch(`${API_BASE_URL}/health`, { signal: controller.signal })
    );

    clearTimeout(timeoutId);

    if (!res || !res.ok) {
      throw new Error(`Health check failed: ${res ? res.status : "Network error"}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Backend health check failed for ${API_BASE_URL}:`, err.message);
    throw err;
  }
}

// ===================== STUDENT & TEACHER RECORDS =====================

export async function fetchStudents() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/records/students`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using local students cache:", err.message);
  }
  return null;
}

export async function fetchTeachers() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/records/teachers`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using local teachers cache:", err.message);
  }
  return null;
}

export async function saveUserRecord(userData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/records/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, saving user locally:", err.message);
  }
  return null;
}

// ===================== QUIZ HISTORY =====================

export async function fetchQuizHistory(userId = null) {
  try {
    const url = userId
      ? `${API_BASE_URL}/api/quiz-history?user_id=${encodeURIComponent(userId)}`
      : `${API_BASE_URL}/api/quiz-history`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using local quiz history:", err.message);
  }
  return null;
}

export async function recordQuizAttempt(quizAttemptData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizAttemptData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, logged quiz locally:", err.message);
  }
  return null;
}

export async function clearBackendQuizHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz-history`, {
      method: "DELETE",
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable for clear:", err.message);
  }
  return null;
}

// ===================== PDF STUDY MATERIALS =====================

export async function fetchPdfMaterials() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pdf-materials`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using local materials:", err.message);
  }
  return null;
}

export async function uploadPdfMaterial(materialData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pdf-materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materialData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, uploaded locally:", err.message);
  }
  return null;
}

export async function deletePdfMaterial(materialId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pdf-materials/${encodeURIComponent(materialId)}`, {
      method: "DELETE",
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, deleted locally:", err.message);
  }
  return null;
}

// ===================== PDF AUDIT & DOWNLOAD HISTORY =====================

export async function fetchPdfHistory(limit = 50) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pdf-history?limit=${limit}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using local pdf history:", err.message);
  }
  return null;
}

export async function recordPdfAccess(accessLogData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pdf-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accessLogData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, logged access locally:", err.message);
  }
  return null;
}

// Shared request helper for the RAG, AI Tutor, and generated quiz endpoints.
async function request(path, options = {}) {
  const fullUrl = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(fullUrl, options);
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

export const getGreeting = (lang) => request(`/api/greeting?lang=${encodeURIComponent(lang)}`);

export const listDocuments = () => request("/api/rag/documents");

export const uploadDocument = ({ file, subject, topic }) => {
  const form = new FormData();
  form.append("file", file);
  form.append("subject", subject);
  form.append("topic", topic);
  return request("/api/rag/documents", { method: "POST", body: form });
};

export const deleteDocument = (docId) =>
  request(`/api/rag/documents/${encodeURIComponent(docId)}`, { method: "DELETE" });

export const askQuestion = (payload) =>
  request("/api/rag/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const chatWithTutor = ({ messages, docId, lang }) =>
  request("/api/tutor/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, doc_id: docId || null, lang }),
  });

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
