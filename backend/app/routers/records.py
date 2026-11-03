"""FastAPI Router for database records:
- Students and Teachers
- Quiz history & scores
- PDF study materials
- PDF access & download history
"""

from typing import List, Optional
from datetime import datetime
import json
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Query
from app.database import get_connection

router = APIRouter(prefix="/api", tags=["database-records"])


# ===================== PYDANTIC SCHEMAS =====================

class UserRecord(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: Optional[str] = None
    college: Optional[str] = "Dibrugarh University"
    semester: Optional[str] = None
    designation: Optional[str] = None
    roll_no: Optional[str] = None
    attendance: Optional[str] = "90%"
    avg_score: Optional[int] = 0
    quizzes_taken: Optional[int] = 0
    status: Optional[str] = "Active"
    created_at: Optional[str] = None


class QuizHistoryItem(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = "stu-1"
    student_name: Optional[str] = "Student Name"
    quiz_id: str
    quiz_title: str
    subject: str
    score: int
    correct_count: int
    total_questions: int
    passed: bool
    answers_json: Optional[str] = "{}"
    completed_at: Optional[str] = None


class PdfMaterialItem(BaseModel):
    id: Optional[str] = None
    title: str
    subject: str
    type: str = "PDF Notes"
    format: str = "PDF"
    size: str = "2.4 MB"
    author_id: Optional[str] = "tea-1"
    author_name: str
    department: Optional[str] = "Computer Science & Engineering"
    semester: Optional[str] = "3rd Semester"
    description: str
    file_name: Optional[str] = None
    faculty_notes: Optional[str] = None
    uploaded_at: Optional[str] = None


class PdfHistoryItem(BaseModel):
    id: Optional[str] = None
    material_id: str
    material_title: str
    subject: Optional[str] = None
    user_id: Optional[str] = "stu-1"
    user_name: Optional[str] = "Student"
    action: str = "DOWNLOAD"
    timestamp: Optional[str] = None


# ===================== STUDENT & TEACHER RECORDS =====================

@router.get("/records/students")
def get_student_records():
    """Retrieve all student cohort records."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE role = 'student' ORDER BY roll_no ASC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


@router.get("/records/teachers")
def get_teacher_records():
    """Retrieve all faculty records."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE role = 'teacher' ORDER BY name ASC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


@router.post("/records/users")
def save_user_record(user: UserRecord):
    """Register or update student/teacher record."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO users (id, name, email, role, department, college, semester, designation, roll_no, attendance, avg_score, quizzes_taken, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            email = excluded.email,
            department = excluded.department,
            semester = excluded.semester,
            designation = excluded.designation,
            avg_score = excluded.avg_score,
            quizzes_taken = excluded.quizzes_taken,
            status = excluded.status
    """, (
        user.id, user.name, user.email, user.role, user.department,
        user.college, user.semester, user.designation, user.roll_no,
        user.attendance, user.avg_score, user.quizzes_taken, user.status,
        user.created_at or now
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "userId": user.id}


# ===================== QUIZ HISTORY =====================

@router.get("/quiz-history")
def get_quiz_history(user_id: Optional[str] = None):
    """Retrieve all quiz history or filter by user."""
    conn = get_connection()
    cursor = conn.cursor()
    if user_id:
        cursor.execute("SELECT * FROM quiz_history WHERE user_id = ? ORDER BY completed_at DESC", (user_id,))
    else:
        cursor.execute("SELECT * FROM quiz_history ORDER BY completed_at DESC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


@router.post("/quiz-history")
def record_quiz_attempt(item: QuizHistoryItem):
    """Store a student quiz attempt into the database."""
    conn = get_connection()
    cursor = conn.cursor()
    record_id = item.id or f"qh-{int(datetime.now().timestamp() * 1000)}"
    now = item.completed_at or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO quiz_history (id, user_id, student_name, quiz_id, quiz_title, subject, score, correct_count, total_questions, passed, answers_json, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record_id, item.user_id, item.student_name, item.quiz_id, item.quiz_title,
        item.subject, item.score, item.correct_count, item.total_questions,
        1 if item.passed else 0, item.answers_json, now
    ))

    # Also update user quiz statistics
    if item.user_id:
        cursor.execute("""
            UPDATE users
            SET quizzes_taken = quizzes_taken + 1
            WHERE id = ?
        """, (item.user_id,))

    conn.commit()
    conn.close()
    return {"status": "success", "id": record_id}


@router.delete("/quiz-history")
def clear_quiz_history():
    """Clear quiz attempts table."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM quiz_history")
    conn.commit()
    conn.close()
    return {"status": "cleared"}


# ===================== PDF STUDY MATERIALS =====================

@router.get("/pdf-materials")
def get_pdf_materials():
    """List all study materials / PDFs."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pdf_materials ORDER BY uploaded_at DESC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


@router.post("/pdf-materials")
def upload_pdf_material(item: PdfMaterialItem):
    """Save an uploaded study material / PDF to the database."""
    conn = get_connection()
    cursor = conn.cursor()
    mat_id = item.id or f"mat-{int(datetime.now().timestamp() * 1000)}"
    now = item.uploaded_at or datetime.now().strftime("%Y-%m-%d")

    cursor.execute("""
        INSERT OR REPLACE INTO pdf_materials (id, title, subject, type, format, size, author_id, author_name, department, semester, description, file_name, faculty_notes, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        mat_id, item.title, item.subject, item.type, item.format,
        item.size, item.author_id, item.author_name, item.department,
        item.semester, item.description, item.file_name or f"{mat_id}.pdf",
        item.faculty_notes, now
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "id": mat_id}


@router.delete("/pdf-materials/{material_id}")
def delete_pdf_material(material_id: str):
    """Delete a study material."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM pdf_materials WHERE id = ?", (material_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted", "id": material_id}


# ===================== PDF AUDIT & ACCESS HISTORY =====================

@router.get("/pdf-history")
def get_pdf_history(limit: int = Query(50)):
    """Retrieve audit history of PDF views and downloads."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pdf_history ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


@router.post("/pdf-history")
def record_pdf_access(item: PdfHistoryItem):
    """Log when a student downloads or previews a PDF."""
    conn = get_connection()
    cursor = conn.cursor()
    log_id = item.id or f"ph-{int(datetime.now().timestamp() * 1000)}"
    now = item.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO pdf_history (id, material_id, material_title, subject, user_id, user_name, action, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        log_id, item.material_id, item.material_title, item.subject,
        item.user_id, item.user_name, item.action, now
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "id": log_id}
