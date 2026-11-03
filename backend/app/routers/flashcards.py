"""Flashcards and study notes router."""

from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["flashcards-and-notes"])


class FlashcardItem(BaseModel):
    id: str
    subject: str
    question: str
    answer: str
    asExplanation: Optional[str] = None
    hint: Optional[str] = None
    mastered: bool = False
    createdAt: Optional[str] = None


class StudyNoteItem(BaseModel):
    id: str
    title: str
    subject: str
    tags: List[str] = Field(default_factory=list)
    summary: str
    content: str
    createdAt: Optional[str] = None


DEFAULT_FLASHCARDS = [
    {
        "id": "fc-1",
        "subject": "Data Structures",
        "question": "What is the time complexity of searching in a Balanced Binary Search Tree (AVL / Red-Black Tree)?",
        "answer": "O(log n) in best, average, and worst cases because the tree height is strictly maintained at O(log n).",
        "asExplanation": "AVL বা Red-Black Tree-ত সন্ধান কৰাৰ সময়ৰ জটিলতা হৈছে O(log n)। কাৰণ গছডালৰ উচ্চতা সদায় নিয়ন্ত্ৰিত হৈ থাকে।",
        "hint": "Think of dividing the search space in half with every comparison.",
        "mastered": False,
        "createdAt": "2026-11-01",
    },
    {
        "id": "fc-2",
        "subject": "DBMS",
        "question": "What are the ACID properties in database transactions?",
        "answer": "Atomicity (all or nothing), Consistency (preserves database rules), Isolation (concurrent execution without interference), Durability (committed changes persist).",
        "asExplanation": "ACID হৈছে: Atomicity (সকলো বা একো নহয়), Consistency (স্থায়িত্ব), Isolation (স্বতন্ত্ৰ কাৰ্য সম্পাদন), Durability (চিৰস্থায়ী সংৰক্ষণ)।",
        "hint": "Four core guarantees for ensuring reliable database transaction processing.",
        "mastered": True,
        "createdAt": "2026-11-01",
    },
    {
        "id": "fc-3",
        "subject": "Operating Systems",
        "question": "What are the four Coffman conditions required for a Deadlock to occur?",
        "answer": "1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait.",
        "asExplanation": "ডেডলক সংঘটিত হ'বলৈ প্ৰয়োজনীয় ৪টা চৰ্ত: পাৰস্পৰিক বৰ্জন (Mutual Exclusion), ধৰি ৰখা আৰু অপেক্ষা (Hold and Wait), অগ্ৰাধিকাৰ অবিহনে (No Preemption), আৰু বৃত্তীয় অপেক্ষা (Circular Wait)।",
        "hint": "Identified by Edward G. Coffman Jr. in 1971; breaking any one condition prevents deadlock.",
        "mastered": False,
        "createdAt": "2026-11-02",
    },
    {
        "id": "fc-4",
        "subject": "Web Development",
        "question": "What is the Virtual DOM in React and why is it faster?",
        "answer": "A lightweight in-memory representation of the real DOM. React computes differences (diffing algorithm) and batches DOM updates to minimize expensive layout recalculations and browser repaints.",
        "asExplanation": "ভাৰ্চুৱেল ডম হৈছে আচল ডমৰ এক পাতলীয়া ইন-মেম'ৰি প্ৰতিৰূপ। ৰিয়েক্টে সালসলনিবোৰ গণনা কৰি কেৱল প্ৰয়োজনীয় অংশহে আপডেট কৰে।",
        "hint": "Think of reconciliation and avoiding unnecessary direct browser DOM manipulations.",
        "mastered": False,
        "createdAt": "2026-11-02",
    },
    {
        "id": "fc-5",
        "subject": "Computer Networks",
        "question": "What is the key difference between TCP and UDP protocols?",
        "answer": "TCP is connection-oriented, reliable, guarantees packet ordering, and features flow/congestion control (HTTP, SSH). UDP is connectionless, lightweight, and low-latency, but packets may drop or arrive out of order (DNS, VoIP, video streaming).",
        "asExplanation": "TCP হৈছে সংযোগী আৰু নিৰ্ভৰযোগ্য (packet ক্ৰম ৰাখে)। আনহাতে UDP হৈছে সংযোগহীন আৰু দ্ৰুত কিন্তু packet হেৰাব পাৰে।",
        "hint": "Three-way handshake versus fire-and-forget transmission.",
        "mastered": False,
        "createdAt": "2026-11-03",
    },
    {
        "id": "fc-6",
        "subject": "Data Structures",
        "question": "How does a Hash Table achieve O(1) average lookup time?",
        "answer": "It uses a hash function to transform the key into an array index. Collisions are handled using Chaining (linked lists) or Open Addressing (linear/quadratic probing).",
        "asExplanation": "হেছ ফাংচনে key-সমূহক পোনপোটীয়াকৈ array-ৰ সূচকলৈ ৰূপান্তৰ কৰে, যাৰ ফলত গড় হিচাপত O(1) সময়ত তথ্য বিচাৰি পোৱা যায়।",
        "hint": "Direct addressing via a hashing algorithm.",
        "mastered": True,
        "createdAt": "2026-11-03",
    },
]

DEFAULT_NOTES = [
    {
        "id": "note-1",
        "title": "AVL Trees & Self-Balancing Mechanisms",
        "subject": "Data Structures",
        "tags": ["AVL", "BST", "Trees", "Rotations"],
        "summary": "Balanced binary search tree properties, balance factors, and 4 rotation techniques to maintain O(log n) height.",
        "content": "### 1. AVL Tree Definition\nAn AVL tree is a self-balancing Binary Search Tree (BST) named after inventors Adelson-Velsky and Landis. In an AVL tree, the heights of two child subtrees of any node differ by at most one.\n\n### 2. Balance Factor (BF)\nFor every node in an AVL tree:\nBF = Height(Left Subtree) - Height(Right Subtree)\nThe valid balance factors are: {-1, 0, 1}. If BF becomes 2 or -2, rebalancing is triggered.\n\n### 3. Four Rebalancing Rotations\n- LL Rotation: Single Right Rotation\n- RR Rotation: Single Left Rotation\n- LR Rotation: Left rotation on left child, then Right rotation on current node\n- RL Rotation: Right rotation on right child, then Left rotation on current node\n\n### 4. Complexity\n- Search: O(log n)\n- Insertion: O(log n)\n- Deletion: O(log n)",
        "createdAt": "2026-11-02",
    },
    {
        "id": "note-2",
        "title": "Relational Database Normalization (1NF to BCNF)",
        "subject": "DBMS",
        "tags": ["Normalization", "1NF", "2NF", "3NF", "BCNF", "Relational Model"],
        "summary": "Step-by-step breakdown of database normal forms to eliminate update, insertion, and deletion anomalies.",
        "content": "### 1. Purpose of Normalization\nDatabase normalization organizes table schema to minimize data redundancy and eliminate anomalies.\n\n### 2. Normal Forms Hierarchy\n- 1NF: Atomic values only, unique primary key.\n- 2NF: In 1NF + No partial dependencies on primary key.\n- 3NF: In 2NF + No transitive dependencies.\n- BCNF: For every functional dependency X -> A, X must be a superkey.",
        "createdAt": "2026-11-03",
    },
    {
        "id": "note-3",
        "title": "Operating Systems CPU Scheduling Algorithms",
        "subject": "Operating Systems",
        "tags": ["OS", "CPU Scheduling", "Round Robin", "SJF"],
        "summary": "Comparative study of CPU scheduling: FCFS, Shortest Job First, Round Robin, and Priority Scheduling.",
        "content": "### 1. Objectives of CPU Scheduling\nMaximize CPU utilization, throughput, and ensure fair turnaround times.\n\n### 2. Major Algorithms\n- FCFS: Non-preemptive FIFO queue. Prone to convoy effect.\n- SJF: Optimal average waiting time, but can cause starvation.\n- Round Robin (RR): Preemptive using fixed Time Quantum (q). Fair and responsive.\n- Priority Scheduling: CPU assigned by priority level; starvation avoided with aging.",
        "createdAt": "2026-11-03",
    },
]


@router.get("/flashcards", response_model=List[FlashcardItem])
def get_flashcards():
    return DEFAULT_FLASHCARDS


@router.get("/notes", response_model=List[StudyNoteItem])
def get_notes():
    return DEFAULT_NOTES
