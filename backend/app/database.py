"""SQLite Database management for LearnMate.

Stores:
- Student & Teacher records
- Quiz history & attempts
- PDF materials & documents
- PDF download & access audit history
"""

import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

DB_PATH = Path(__file__).resolve().parents[1] / "learnmate.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_database() -> None:
    """Create all required tables and seed initial data if empty."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Users Table (Students & Teachers)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL,
            department TEXT,
            college TEXT,
            semester TEXT,
            designation TEXT,
            roll_no TEXT,
            attendance TEXT,
            avg_score INTEGER DEFAULT 0,
            quizzes_taken INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Active',
            created_at TEXT
        )
    """)

    # 2. Quiz History Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_history (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            student_name TEXT,
            quiz_id TEXT NOT NULL,
            quiz_title TEXT NOT NULL,
            subject TEXT NOT NULL,
            score INTEGER NOT NULL,
            correct_count INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            passed INTEGER NOT NULL,
            answers_json TEXT,
            completed_at TEXT
        )
    """)

    # 3. PDF Study Materials Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pdf_materials (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            subject TEXT NOT NULL,
            type TEXT NOT NULL,
            format TEXT NOT NULL,
            size TEXT NOT NULL,
            author_id TEXT,
            author_name TEXT NOT NULL,
            department TEXT,
            semester TEXT,
            description TEXT,
            file_name TEXT,
            faculty_notes TEXT,
            uploaded_at TEXT
        )
    """)

    # 4. PDF Download & View Audit History
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pdf_history (
            id TEXT PRIMARY KEY,
            material_id TEXT NOT NULL,
            material_title TEXT NOT NULL,
            subject TEXT,
            user_id TEXT,
            user_name TEXT,
            action TEXT NOT NULL,
            timestamp TEXT
        )
    """)

    conn.commit()

    # Seed initial records if empty
    cursor.execute("SELECT COUNT(*) as count FROM users")
    if cursor.fetchone()["count"] == 0:
        seed_initial_data(conn)

    conn.close()


def seed_initial_data(conn: sqlite3.Connection) -> None:
    cursor = conn.cursor()

    # Faculty Record
    cursor.execute("""
        INSERT INTO users (id, name, email, role, department, college, designation, status, created_at)
        VALUES ('tea-1', 'Dr. Debajit Sharma', 'd.sharma@dibru.ac.in', 'teacher',
                'Computer Science & Engineering', 'Dibrugarh University', 'Associate Professor', 'Active', '2026-10-01')
    """)

    # Student Records
    students = [
        ('stu-1', 'Arindam Borah', 'arindam@dibru.ac.in', 'student', 'Computer Science & Engineering', 'Dibrugarh University', '3rd Semester', 'DU/CSE/26/01', '94%', 88, 5, 'Excellent', '2026-10-01'),
        ('stu-2', 'Nilakshi Saikia', 'nilakshi@dibru.ac.in', 'student', 'Computer Science & Engineering', 'Dibrugarh University', '3rd Semester', 'DU/CSE/26/02', '98%', 92, 5, 'Excellent', '2026-10-01'),
        ('stu-3', 'Bhargav Kalita', 'bhargav@dibru.ac.in', 'student', 'Computer Science & Engineering', 'Dibrugarh University', '3rd Semester', 'DU/CSE/26/03', '85%', 76, 4, 'Good', '2026-10-01'),
        ('stu-4', 'Priya Gogoi', 'priya@dibru.ac.in', 'student', 'Computer Science & Engineering', 'Dibrugarh University', '3rd Semester', 'DU/CSE/26/04', '91%', 84, 5, 'Good', '2026-10-01'),
        ('stu-5', 'Rohan Sarma', 'rohan@dibru.ac.in', 'student', 'Computer Science & Engineering', 'Dibrugarh University', '3rd Semester', 'DU/CSE/26/05', '72%', 54, 2, 'Needs Help', '2026-10-01'),
        ('stu-6', 'Dikshita Dutta', 'dikshita@dibru.ac.in', 'student', 'Computer Science & Engineering', 'Dibrugarh University', '3rd Semester', 'DU/CSE/26/06', '89%', 80, 4, 'Good', '2026-10-01'),
        ('stu-7', 'Manash Pratim Baruah', 'manash@dibru.ac.in', 'student', 'Computer Science & Engineering', 'Dibrugarh University', '3rd Semester', 'DU/CSE/26/07', '68%', 48, 1, 'Needs Help', '2026-10-01'),
        ('stu-8', 'Ananya Phukan', 'ananya@dibru.ac.in', 'student', 'Computer Science & Engineering', 'Dibrugarh University', '3rd Semester', 'DU/CSE/26/08', '96%', 94, 5, 'Excellent', '2026-10-01'),
        ('stu-9', 'Kalyan Sonowal', 'kalyan@dibru.ac.in', 'student', 'Computer Science & Engineering', 'Dibrugarh University', '3rd Semester', 'DU/CSE/26/09', '82%', 72, 3, 'Good', '2026-10-01'),
        ('stu-10', 'Tinashree Medhi', 'tinashree@dibru.ac.in', 'student', 'Computer Science & Engineering', 'Dibrugarh University', '3rd Semester', 'DU/CSE/26/10', '90%', 78, 4, 'Good', '2026-10-01'),
    ]

    cursor.executemany("""
        INSERT INTO users (id, name, email, role, department, college, semester, roll_no, attendance, avg_score, quizzes_taken, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, students)

    # Initial PDF Study Materials
    materials = [
        ('mat-1', 'Unit 1: Balanced Search Trees & Graph Algorithms', 'Data Structures', 'PDF Notes', 'PDF', '2.4 MB', 'tea-1', 'Prof. D. Sharma', 'Computer Science & Engineering', '3rd Semester', 'Detailed derivations of AVL tree rotations, Red-Black trees, and BFS/DFS traversal implementations.', 'AVL_Trees_Unit1.pdf', 'Recommended for midterm exam prep.', '2026-10-15'),
        ('mat-2', 'Relational Schema Design & Normalization (1NF to BCNF)', 'DBMS', 'Lecture Slides', 'PDF', '3.1 MB', 'tea-1', 'Dr. B. Gogoi', 'Computer Science & Engineering', '3rd Semester', 'Functional dependencies, closure sets, canonical cover, and stepwise decomposition up to BCNF.', 'DBMS_Normalization_Slides.pdf', 'Work through all candidate key exercises.', '2026-10-18'),
        ('mat-3', 'Process Synchronization & Semaphore Classical Problems', 'Operating Systems', 'PDF Notes', 'PDF', '1.8 MB', 'tea-1', 'Prof. K. Dutta', 'Computer Science & Engineering', '3rd Semester', 'Producer-Consumer, Dining Philosophers, and Readers-Writers synchronization solutions.', 'OS_Synchronization.pdf', 'Focus on semaphore wait/signal order.', '2026-10-22'),
        ('mat-4', 'OSI 7-Layer Architecture & IP Subnetting Guide', 'Computer Networks', 'Cheatsheet', 'PDF', '1.2 MB', 'tea-1', 'Dr. P. Hazarika', 'Computer Science & Engineering', '3rd Semester', 'Compact subnetting calculation table, CIDR notation cheatsheet, and protocol header diagrams.', 'Subnetting_Cheatsheet.pdf', 'Keep handy for lab evaluations.', '2026-10-25'),
        ('mat-5', 'Data Structures Lab Manual & C++ Algorithm Templates', 'Data Structures', 'Lab Manual', 'DOCX', '1.5 MB', 'tea-1', 'Prof. D. Sharma', 'Computer Science & Engineering', '3rd Semester', 'Laboratory assignments, test input files, and expected outputs for tree and graph labs.', 'DSA_Lab_Manual.docx', 'Mandatory for weekly lab submissions.', '2026-10-28'),
        ('mat-6', 'SQL Query Formulation & Indexing Tuning Handbook', 'DBMS', 'Cheatsheet', 'PDF', '850 KB', 'tea-1', 'Dr. B. Gogoi', 'Computer Science & Engineering', '3rd Semester', 'Complex join query patterns, window functions, and B+ Tree index optimization tips.', 'SQL_Indexing_Handbook.pdf', 'Review before database viva.', '2026-11-01'),
    ]

    cursor.executemany("""
        INSERT INTO pdf_materials (id, title, subject, type, format, size, author_id, author_name, department, semester, description, file_name, faculty_notes, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, materials)

    # Initial Quiz History
    quiz_attempts = [
        ('qh-1', 'stu-1', 'Arindam Borah', 'quiz-1', 'Data Structures Core Mastery Quiz', 'Data Structures', 80, 4, 5, 1, '{}', '2026-11-02 14:30:00'),
        ('qh-2', 'stu-1', 'Arindam Borah', 'quiz-2', 'DBMS Relational Architecture & SQL Quiz', 'DBMS', 100, 5, 5, 1, '{}', '2026-11-03 16:15:00'),
        ('qh-3', 'stu-2', 'Nilakshi Saikia', 'quiz-1', 'Data Structures Core Mastery Quiz', 'Data Structures', 100, 5, 5, 1, '{}', '2026-11-02 11:20:00'),
        ('qh-4', 'stu-3', 'Bhargav Kalita', 'quiz-3', 'Operating Systems Concurrency & Deadlocks', 'Operating Systems', 60, 3, 5, 0, '{}', '2026-11-03 09:45:00'),
    ]

    cursor.executemany("""
        INSERT INTO quiz_history (id, user_id, student_name, quiz_id, quiz_title, subject, score, correct_count, total_questions, passed, answers_json, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, quiz_attempts)

    # Initial PDF Download & Access History
    pdf_logs = [
        ('ph-1', 'mat-1', 'Unit 1: Balanced Search Trees & Graph Algorithms', 'Data Structures', 'stu-1', 'Arindam Borah', 'DOWNLOAD', '2026-11-01 10:14:00'),
        ('ph-2', 'mat-2', 'Relational Schema Design & Normalization (1NF to BCNF)', 'DBMS', 'stu-1', 'Arindam Borah', 'DOWNLOAD', '2026-11-02 12:30:00'),
        ('ph-3', 'mat-4', 'OSI 7-Layer Architecture & IP Subnetting Guide', 'Computer Networks', 'stu-2', 'Nilakshi Saikia', 'VIEW', '2026-11-03 15:05:00'),
        ('ph-4', 'mat-1', 'Unit 1: Balanced Search Trees & Graph Algorithms', 'Data Structures', 'stu-3', 'Bhargav Kalita', 'DOWNLOAD', '2026-11-03 18:22:00'),
    ]

    cursor.executemany("""
        INSERT INTO pdf_history (id, material_id, material_title, subject, user_id, user_name, action, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, pdf_logs)

    conn.commit()
