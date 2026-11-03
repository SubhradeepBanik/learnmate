const API_BASE_URL = 'http://localhost:8000';

// Health Check
export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`).catch(() =>
    fetch(`${API_BASE_URL}/health`)
  );
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return response.json();
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
