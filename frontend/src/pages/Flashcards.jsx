import { useState, useEffect, useMemo, useCallback } from "react";
import Hero from "../components/Hero";
import Metric from "../components/Metric";
import { useLanguage } from "../context/LanguageContext";
import "./Flashcards.css";

const INITIAL_FLASHCARDS = [
  {
    id: "fc-1",
    subject: "Data Structures",
    question: "What is the time complexity of searching in a Balanced Binary Search Tree (AVL / Red-Black Tree)?",
    answer: "O(log n) in best, average, and worst cases because the tree height is strictly maintained at O(log n).",
    asExplanation: "AVL বা Red-Black Tree-ত সন্ধান কৰাৰ সময়ৰ জটিলতা হৈছে O(log n)। কাৰণ গছডালৰ উচ্চতা সদায় নিয়ন্ত্ৰিত হৈ থাকে।",
    hint: "Think of dividing the search space in half with every comparison.",
    mastered: false,
    createdAt: "2026-11-01",
  },
  {
    id: "fc-2",
    subject: "DBMS",
    question: "What are the ACID properties in database transactions?",
    answer: "Atomicity (all or nothing), Consistency (preserves database rules), Isolation (concurrent execution without interference), Durability (committed changes persist).",
    asExplanation: "ACID হৈছে: Atomicity (সকলো বা একো নহয়), Consistency (স্থায়িত্ব), Isolation (স্বতন্ত্ৰ কাৰ্য সম্পাদন), Durability (চিৰস্থায়ী সংৰক্ষণ)।",
    hint: "Four core guarantees for ensuring reliable database transaction processing.",
    mastered: true,
    createdAt: "2026-11-01",
  },
  {
    id: "fc-3",
    subject: "Operating Systems",
    question: "What are the four Coffman conditions required for a Deadlock to occur?",
    answer: "1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait.",
    asExplanation: "ডেডলক সংঘটিত হ'বলৈ প্ৰয়োজনীয় ৪টা চৰ্ত: পাৰস্পৰিক বৰ্জন (Mutual Exclusion), ধৰি ৰখা আৰু অপেক্ষা (Hold and Wait), অগ্ৰাধিকাৰ অবিহনে (No Preemption), আৰু বৃত্তীয় অপেক্ষা (Circular Wait)।",
    hint: "Identified by Edward G. Coffman Jr. in 1971; breaking any one condition prevents deadlock.",
    mastered: false,
    createdAt: "2026-11-02",
  },
  {
    id: "fc-4",
    subject: "Web Development",
    question: "What is the Virtual DOM in React and why is it faster?",
    answer: "A lightweight in-memory representation of the real DOM. React computes differences (diffing algorithm) and batches DOM updates to minimize expensive layout recalculations and browser repaints.",
    asExplanation: "ভাৰ্চুৱেল ডম হৈছে আচল ডমৰ এক পাতলীয়া ইন-মেম'ৰি প্ৰতিৰূপ। ৰিয়েক্টে সালসলনিবোৰ গণনা কৰি কেৱল প্ৰয়োজনীয় অংশহে আপডেট কৰে।",
    hint: "Think of reconciliation and avoiding unnecessary direct browser DOM manipulations.",
    mastered: false,
    createdAt: "2026-11-02",
  },
  {
    id: "fc-5",
    subject: "Computer Networks",
    question: "What is the key difference between TCP and UDP protocols?",
    answer: "TCP is connection-oriented, reliable, guarantees packet ordering, and features flow/congestion control (HTTP, SSH). UDP is connectionless, lightweight, and low-latency, but packets may drop or arrive out of order (DNS, VoIP, video streaming).",
    asExplanation: "TCP হৈছে সংযোগী আৰু নিৰ্ভৰযোগ্য (packet ক্ৰম ৰাখে)। আনহাতে UDP হৈছে সংযোগহীন আৰু দ্ৰুত কিন্তু packet হেৰাব পাৰে।",
    hint: "Three-way handshake versus fire-and-forget transmission.",
    mastered: false,
    createdAt: "2026-11-03",
  },
  {
    id: "fc-6",
    subject: "Data Structures",
    question: "How does a Hash Table achieve O(1) average lookup time?",
    answer: "It uses a hash function to transform the key into an array index. Collisions are handled using Chaining (linked lists) or Open Addressing (linear/quadratic probing).",
    asExplanation: "হেছ ফাংচনে key-সমূহক পোনপোটীয়াকৈ array-ৰ সূচকলৈ ৰূপান্তৰ কৰে, যাৰ ফলত গড় হিচাপত O(1) সময়ত তথ্য বিচাৰি পোৱা যায়।",
    hint: "Direct addressing via a hashing algorithm.",
    mastered: true,
    createdAt: "2026-11-03",
  },
];

const INITIAL_NOTES = [
  {
    id: "note-1",
    title: "AVL Trees & Self-Balancing Mechanisms",
    subject: "Data Structures",
    tags: ["AVL", "BST", "Trees", "Rotations"],
    summary: "Balanced binary search tree properties, balance factors, and 4 rotation techniques to maintain O(log n) height.",
    content: `### 1. AVL Tree Definition
An AVL tree is a self-balancing Binary Search Tree (BST) named after inventors Adelson-Velsky and Landis. In an AVL tree, the heights of two child subtrees of any node differ by at most one.

### 2. Balance Factor (BF)
For every node in an AVL tree:
BF = Height(Left Subtree) - Height(Right Subtree)
The valid balance factors are: {-1, 0, 1}. If BF becomes 2 or -2, rebalancing is triggered.

### 3. Four Rebalancing Rotations
- **LL Rotation (Left-Left)**: Single Right Rotation when an item is inserted into the left subtree of the left child.
- **RR Rotation (Right-Right)**: Single Left Rotation when an item is inserted into the right subtree of the right child.
- **LR Rotation (Left-Right)**: Left rotation on left child, followed by Right rotation on current node.
- **RL Rotation (Right-Left)**: Right rotation on right child, followed by Left rotation on current node.

### 4. Complexity Analysis
- Search: O(log n)
- Insertion: O(log n)
- Deletion: O(log n)
- Space: O(n)`,
    createdAt: "2026-11-02",
  },
  {
    id: "note-2",
    title: "Relational Database Normalization (1NF to BCNF)",
    subject: "DBMS",
    tags: ["Normalization", "1NF", "2NF", "3NF", "BCNF", "Relational Model"],
    summary: "Step-by-step breakdown of database normal forms to eliminate update, insertion, and deletion anomalies.",
    content: `### 1. Purpose of Normalization
Database normalization organizes table schema to minimize data redundancy and eliminate anomalies (Insertion, Deletion, and Update anomalies) while preserving data integrity.

### 2. Normal Forms Hierarchy
- **First Normal Form (1NF)**:
  - Each attribute value must be atomic (no arrays or multi-valued columns).
  - Every row must have a unique identifier (Primary Key).

- **Second Normal Form (2NF)**:
  - Must satisfy 1NF.
  - No partial dependency: Every non-prime attribute must be fully functionally dependent on the entire primary key.

- **Third Normal Form (3NF)**:
  - Must satisfy 2NF.
  - No transitive dependency: Non-prime attributes must not depend on other non-prime attributes (i.e. X → Y where X is not a superkey).

- **Boyce-Codd Normal Form (BCNF)**:
  - Stricter version of 3NF.
  - For every functional dependency X → A, X MUST be a superkey.`,
    createdAt: "2026-11-03",
  },
  {
    id: "note-3",
    title: "Operating Systems CPU Scheduling Algorithms",
    subject: "Operating Systems",
    tags: ["OS", "CPU Scheduling", "Round Robin", "SJF"],
    summary: "Comparative study of CPU scheduling: FCFS, Shortest Job First, Round Robin, and Priority Scheduling.",
    content: `### 1. Objectives of CPU Scheduling
Maximize CPU utilization, throughput, and ensure fair turnaround and response times across all ready processes.

### 2. Major Algorithms
- **First-Come, First-Served (FCFS)**:
  - Non-preemptive. Simple FIFO queue.
  - Major drawback: Convoy effect (short processes wait behind long CPU-bound tasks).

- **Shortest Job First (SJF)**:
  - Selects process with shortest next CPU burst.
  - Mathematically optimal for minimizing average waiting time.
  - Drawback: Can cause starvation for long processes; difficult to predict future CPU burst times.

- **Round Robin (RR)**:
  - Preemptive. Uses a fixed Time Quantum (q).
  - Each process gets CPU time up to q before being moved to the end of the ready queue.
  - Ideal for interactive and time-sharing operating systems.

- **Priority Scheduling**:
  - CPU assigned to highest priority process.
  - Solves starvation via "Aging" (gradually boosting priority of waiting processes).`,
    createdAt: "2026-11-03",
  },
];

export default function Flashcards() {
  const { lang, t } = useLanguage();

  // Active Tab: 'cards' or 'notes'
  const [activeTab, setActiveTab] = useState("cards");

  // Flashcards state
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem("learnmate_flashcards");
      return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
    } catch {
      return INITIAL_FLASHCARDS;
    }
  });

  // Notes state
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("learnmate_notes");
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  // Persist flashcards
  useEffect(() => {
    try {
      localStorage.setItem("learnmate_flashcards", JSON.stringify(cards));
    } catch {
      /* ignore */
    }
  }, [cards]);

  // Persist notes
  useEffect(() => {
    try {
      localStorage.setItem("learnmate_notes", JSON.stringify(notes));
    } catch {
      /* ignore */
    }
  }, [notes]);

  // Flashcards UI State
  const [viewMode, setViewMode] = useState("study"); // 'study' or 'browse'
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAssameseOnCard, setShowAssameseOnCard] = useState(lang === "as");

  // Keep assamese card toggle aligned when language changes
  useEffect(() => {
    setShowAssameseOnCard(lang === "as");
  }, [lang]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchSubject =
        selectedSubject === "all" || card.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchSearch =
        !searchQuery ||
        card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [cards, selectedSubject, searchQuery]);

  // Filtered Notes
  const [notesSearch, setNotesSearch] = useState("");
  const [notesSubject, setNotesSubject] = useState("all");

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchSubject =
        notesSubject === "all" || note.subject.toLowerCase() === notesSubject.toLowerCase();
      const matchSearch =
        !notesSearch ||
        note.title.toLowerCase().includes(notesSearch.toLowerCase()) ||
        note.summary.toLowerCase().includes(notesSearch.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(notesSearch.toLowerCase()));
      return matchSubject && matchSearch;
    });
  }, [notes, notesSubject, notesSearch]);

  // Ensure currentIndex stays in bounds
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
    setShowHint(false);
  }, [filteredCards.length, selectedSubject]);

  const currentCard = filteredCards[currentIndex];

  // Subject list extraction
  const subjects = useMemo(() => {
    const set = new Set(cards.map((c) => c.subject));
    notes.forEach((n) => set.add(n.subject));
    return Array.from(set);
  }, [cards, notes]);

  // Card Controls
  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  }, [filteredCards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  const handleToggleMastery = (cardId, state) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, mastered: state } : c))
    );
    handleNext();
  };

  // Keyboard shortcut listener for study mode
  useEffect(() => {
    if (activeTab !== "cards" || viewMode !== "study") return;

    const handleKeyDown = (e) => {
      if (["input", "textarea"].includes(e.target.tagName.toLowerCase())) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "1" && currentCard) {
        e.preventDefault();
        handleToggleMastery(currentCard.id, false);
      } else if (e.key === "2" && currentCard) {
        e.preventDefault();
        handleToggleMastery(currentCard.id, true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, viewMode, handleFlip, handleNext, handlePrev, currentCard]);

  // Text-to-speech speaker
  const handleSpeak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardFormData, setCardFormData] = useState({
    subject: "Data Structures",
    question: "",
    answer: "",
    asExplanation: "",
    hint: "",
  });

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteFormData, setNoteFormData] = useState({
    title: "",
    subject: "Data Structures",
    tags: "",
    summary: "",
    content: "",
  });

  const [readingNote, setReadingNote] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Open Add Card Modal
  const openNewCardModal = (prefill = null) => {
    setEditingCard(null);
    setCardFormData({
      subject: prefill?.subject || subjects[0] || "Data Structures",
      question: prefill?.question || "",
      answer: prefill?.answer || "",
      asExplanation: prefill?.asExplanation || "",
      hint: prefill?.hint || "",
    });
    setIsCardModalOpen(true);
  };

  // Open Edit Card Modal
  const openEditCardModal = (card) => {
    setEditingCard(card);
    setCardFormData({
      subject: card.subject,
      question: card.question,
      answer: card.answer,
      asExplanation: card.asExplanation || "",
      hint: card.hint || "",
    });
    setIsCardModalOpen(true);
  };

  // Save Card
  const handleSaveCard = (e) => {
    e.preventDefault();
    if (!cardFormData.question.trim() || !cardFormData.answer.trim()) return;

    if (editingCard) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === editingCard.id ? { ...c, ...cardFormData } : c
        )
      );
    } else {
      const newCard = {
        id: `fc-${Date.now()}`,
        ...cardFormData,
        mastered: false,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCards((prev) => [newCard, ...prev]);
    }
    setIsCardModalOpen(false);
  };

  // Delete Card
  const handleDeleteCard = (id) => {
    if (confirm("Are you sure you want to delete this flashcard?")) {
      setCards((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Open Add Note Modal
  const openNewNoteModal = () => {
    setEditingNote(null);
    setNoteFormData({
      title: "",
      subject: subjects[0] || "Data Structures",
      tags: "",
      summary: "",
      content: "",
    });
    setIsNoteModalOpen(true);
  };

  // Open Edit Note Modal
  const openEditNoteModal = (note) => {
    setEditingNote(note);
    setNoteFormData({
      title: note.title,
      subject: note.subject,
      tags: note.tags.join(", "),
      summary: note.summary,
      content: note.content,
    });
    setIsNoteModalOpen(true);
  };

  // Save Note
  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!noteFormData.title.trim() || !noteFormData.content.trim()) return;

    const parsedTags = noteFormData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? {
                ...n,
                title: noteFormData.title,
                subject: noteFormData.subject,
                summary: noteFormData.summary,
                content: noteFormData.content,
                tags: parsedTags,
              }
            : n
        )
      );
    } else {
      const newNote = {
        id: `note-${Date.now()}`,
        title: noteFormData.title,
        subject: noteFormData.subject,
        summary: noteFormData.summary,
        content: noteFormData.content,
        tags: parsedTags,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setNotes((prev) => [newNote, ...prev]);
    }
    setIsNoteModalOpen(false);
  };

  // Delete Note
  const handleDeleteNote = (id) => {
    if (confirm("Are you sure you want to delete this study note?")) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (readingNote?.id === id) setReadingNote(null);
    }
  };

  // Turn note into flashcard
  const handleTurnNoteToCard = (note) => {
    openNewCardModal({
      subject: note.subject,
      question: `What are the key concepts of: ${note.title}?`,
      answer: note.summary || note.content.slice(0, 200),
      hint: `Refer to note: ${note.title}`,
    });
  };

  // Copy Note Content
  const handleCopyNote = (content) => {
    navigator.clipboard.writeText(content);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Download Note as TXT
  const handleDownloadNote = (note) => {
    const text = `# ${note.title}\nSubject: ${note.subject}\nDate: ${note.createdAt}\nTags: ${note.tags.join(", ")}\n\nSummary:\n${note.summary}\n\n---\n\n${note.content}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${note.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset to default sample data
  const handleResetDefaults = () => {
    if (confirm("Reset flashcards and notes to default samples? This will keep built-in questions.")) {
      setCards(INITIAL_FLASHCARDS);
      setNotes(INITIAL_NOTES);
      localStorage.removeItem("learnmate_flashcards");
      localStorage.removeItem("learnmate_notes");
      setCurrentIndex(0);
    }
  };

  // Summary Metrics
  const totalCards = cards.length;
  const masteredCount = cards.filter((c) => c.mastered).length;
  const masteryPercentage = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;
  const totalNotes = notes.length;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Hero title={` ${t("flash.title")}`}>
        <p>{t("flash.subtitle")}</p>
      </Hero>

      {/* Top Metrics Bar */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label={` ${t("flash.totalCards")}`} value={totalCards} />
        <Metric label={`⭐ ${t("flash.mastered")}`} value={masteredCount} />
        <Metric label={` ${t("flash.masteryRate")}`} value={`${masteryPercentage}%`} />
        <Metric label={` ${t("flash.totalNotes")}`} value={totalNotes} />
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("cards")}
            className={`rounded-xl px-5 py-2.5 font-bold transition flex items-center gap-2 ${
              activeTab === "cards"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            {t("flash.tabCards")}
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
              {totalCards}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`rounded-xl px-5 py-2.5 font-bold transition flex items-center gap-2 ${
              activeTab === "notes"
                ? "bg-brand text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
            }`}
          >
            {t("flash.tabNotes")}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {totalNotes}
            </span>
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === "cards" ? (
            <button
              onClick={() => openNewCardModal()}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-dark transition flex items-center gap-1.5"
            >
              <span>+</span> {t("flash.addCard")}
            </button>
          ) : (
            <button
              onClick={() => openNewNoteModal()}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-dark transition flex items-center gap-1.5"
            >
              <span>+</span> {t("flash.addNote")}
            </button>
          )}

          <button
            onClick={handleResetDefaults}
            title="Reset to default items"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition"
          >
             Reset
          </button>
        </div>
      </div>

      {/* ======================= TAB 1: FLASHCARDS ======================= */}
      {activeTab === "cards" && (
        <div className="space-y-6">
          {/* Mode Switcher & Subject Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-tint p-4 rounded-2xl border border-brand-line">
            {/* View Mode Buttons */}
            <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-brand-line">
              <button
                onClick={() => setViewMode("study")}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  viewMode === "study"
                    ? "bg-brand text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                 {t("flash.studyMode")}
              </button>
              <button
                onClick={() => setViewMode("browse")}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  viewMode === "browse"
                    ? "bg-brand text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                 {t("flash.browseMode")}
              </button>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedSubject("all")}
                className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                  selectedSubject === "all"
                    ? "bg-brand text-white"
                    : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
                }`}
              >
                {t("flash.allSubjects")}
              </button>
              {subjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                    selectedSubject === subj
                      ? "bg-brand text-white"
                      : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* STUDY MODE (INTERACTIVE FLIP CARD) */}
          {viewMode === "study" && (
            <div className="space-y-4">
              {filteredCards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <p className="text-4xl mb-2"></p>
                  <p className="font-semibold text-slate-700">{t("flash.noCards")}</p>
                  <button
                    onClick={() => openNewCardModal()}
                    className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm text-white"
                  >
                    {t("flash.addCard")}
                  </button>
                </div>
              ) : (
                <>
                  {/* Progress Header & Counter */}
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span className="font-semibold text-brand-head">
                      {t("flash.cardOf")} {currentIndex + 1} {t("flash.of")}{" "}
                      {filteredCards.length}
                    </span>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 w-1/3">
                      <div className="h-2 w-full rounded-full bg-brand-line overflow-hidden">
                        <div
                          className="h-full bg-brand transition-all duration-300"
                          style={{
                            width: `${((currentIndex + 1) / filteredCards.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {Math.round(((currentIndex + 1) / filteredCards.length) * 100)}%
                      </span>
                    </div>

                    {/* Mastered Badge Indicator */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1 ${
                        currentCard?.mastered
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {currentCard?.mastered ? "⭐ Mastered" : " Learning"}
                    </span>
                  </div>

                  {/* 3D Flashcard Container */}
                  <div className="flashcard-scene max-w-2xl mx-auto my-2">
                    <div
                      className={`flashcard-inner ${isFlipped ? "is-flipped" : ""}`}
                      onClick={handleFlip}
                    >
                      {/* FRONT OF CARD */}
                      <div className="flashcard-face flashcard-front">
                        {/* Front Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="rounded-md bg-brand-tint px-2.5 py-1 text-xs font-bold text-brand uppercase tracking-wider">
                            {currentCard?.subject}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeak(currentCard?.question);
                            }}
                            title="Listen to question"
                            className="rounded-lg p-1.5 text-slate-400 hover:text-brand hover:bg-brand-tint transition"
                          >
                            
                          </button>
                        </div>

                        {/* Front Question Content */}
                        <div className="my-auto py-6">
                          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">
                            Question / Concept
                          </p>
                          <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                            {currentCard?.question}
                          </h3>

                          {/* Expandable Hint */}
                          {currentCard?.hint && (
                            <div className="mt-4">
                              {showHint ? (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900 inline-block text-left"
                                >
                                   <span className="font-semibold">Hint:</span> {currentCard.hint}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowHint(true);
                                  }}
                                  className="text-xs font-medium text-amber-700 hover:underline inline-flex items-center gap-1"
                                >
                                  {t("flash.showHint")}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Front Footer */}
                        <div className="border-t border-slate-100 pt-3 text-center text-xs text-slate-400 font-medium">
                          {t("flash.flipHint")} 
                        </div>
                      </div>

                      {/* BACK OF CARD */}
                      <div className="flashcard-face flashcard-back">
                        {/* Back Header */}
                        <div className="flex items-center justify-between border-b border-brand-line pb-3">
                          <span className="rounded-md bg-brand text-white px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                            Answer
                          </span>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Assamese / English Toggle */}
                            {currentCard?.asExplanation && (
                              <button
                                type="button"
                                onClick={() => setShowAssameseOnCard((prev) => !prev)}
                                className={`rounded px-2 py-1 text-xs font-semibold border transition ${
                                  showAssameseOnCard
                                    ? "bg-brand text-white border-brand"
                                    : "bg-white text-slate-600 border-slate-200"
                                }`}
                              >
                                {showAssameseOnCard ? "অসমীয়া" : "English"}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSpeak(currentCard?.answer)}
                              title="Listen to explanation"
                              className="rounded-lg p-1.5 text-slate-400 hover:text-brand hover:bg-brand-tint transition"
                            >
                              
                            </button>
                          </div>
                        </div>

                        {/* Back Content */}
                        <div className="my-auto py-4 overflow-y-auto max-h-52 text-left">
                          <p className="text-sm md:text-base font-normal text-slate-800 leading-relaxed whitespace-pre-line">
                            {showAssameseOnCard && currentCard?.asExplanation
                              ? currentCard.asExplanation
                              : currentCard?.answer}
                          </p>
                        </div>

                        {/* Back Footer */}
                        <div className="border-t border-brand-line pt-3 text-center text-xs text-brand font-medium">
                          {t("flash.flipHint")} 
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mastery Self-Evaluation Controls */}
                  <div className="flex justify-center gap-4 pt-2">
                    <button
                      onClick={() => handleToggleMastery(currentCard.id, false)}
                      className="rounded-xl border border-rose-300 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition shadow-sm flex items-center gap-2"
                    >
                      {t("flash.markPractice")} <span className="text-xs text-rose-400">[1]</span>
                    </button>
                    <button
                      onClick={() => handleToggleMastery(currentCard.id, true)}
                      className="rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition shadow-sm flex items-center gap-2"
                    >
                      {t("flash.markMastered")} <span className="text-xs text-emerald-400">[2]</span>
                    </button>
                  </div>

                  {/* Navigation Control Bar */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-brand-line">
                    <button
                      onClick={handlePrev}
                      className="rounded-lg bg-white border border-brand-line px-4 py-2 text-sm font-medium text-slate-700 hover:bg-brand-hero transition"
                    >
                      {t("flash.prev")}
                    </button>

                    <button
                      onClick={handleFlip}
                      className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition shadow"
                    >
                      {t("flash.flip")}
                    </button>

                    <button
                      onClick={handleNext}
                      className="rounded-lg bg-white border border-brand-line px-4 py-2 text-sm font-medium text-slate-700 hover:bg-brand-hero transition"
                    >
                      {t("flash.next")}
                    </button>

                    <button
                      onClick={handleShuffle}
                      className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 transition"
                      title="Shuffle cards"
                    >
                      {t("flash.shuffle")}
                    </button>
                  </div>

                  <p className="text-center text-xs text-slate-400">
                     Shortcut: <kbd className="bg-slate-100 px-1 py-0.5 rounded border">Space</kbd> = Flip,{" "}
                    <kbd className="bg-slate-100 px-1 py-0.5 rounded border">→</kbd> = Next,{" "}
                    <kbd className="bg-slate-100 px-1 py-0.5 rounded border">←</kbd> = Prev
                  </p>
                </>
              )}
            </div>
          )}

          {/* BROWSE ALL CARDS (GRID VIEW) */}
          {viewMode === "browse" && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("flash.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-brand-line bg-white px-4 py-2.5 text-sm pl-10 focus:outline-none focus:border-brand"
                />
                <span className="absolute left-3 top-2.5 text-slate-400"></span>
              </div>

              {filteredCards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                  {t("flash.noCards")}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="rounded-md bg-brand-tint px-2 py-0.5 text-xs font-bold text-brand">
                            {card.subject}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              card.mastered
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {card.mastered ? "⭐ Mastered" : "Review"}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-800 mb-2">{card.question}</h4>
                        <p className="text-xs text-slate-600 line-clamp-3 mb-2">{card.answer}</p>
                        {card.asExplanation && (
                          <p className="text-xs text-brand font-medium line-clamp-2">
                            অসমীয়া: {card.asExplanation}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleToggleMastery(card.id, !card.mastered)}
                          className={`font-semibold hover:underline ${
                            card.mastered ? "text-amber-600" : "text-emerald-600"
                          }`}
                        >
                          {card.mastered ? "Mark Review" : "Mark Mastered"}
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditCardModal(card)}
                            className="text-slate-500 hover:text-brand"
                          >
                            {t("flash.edit")}
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            {t("flash.delete")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: STUDY NOTES ======================= */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          {/* Notes Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-brand-tint p-4 rounded-2xl border border-brand-line">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder={t("flash.searchNotesPlaceholder")}
                value={notesSearch}
                onChange={(e) => setNotesSearch(e.target.value)}
                className="w-full rounded-xl border border-brand-line bg-white px-3.5 py-2 text-sm pl-9 focus:outline-none focus:border-brand"
              />
              <span className="absolute left-3 top-2 text-slate-400"></span>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setNotesSubject("all")}
                className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                  notesSubject === "all"
                    ? "bg-brand text-white"
                    : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
                }`}
              >
                {t("flash.allSubjects")}
              </button>
              {subjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setNotesSubject(subj)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                    notesSubject === subj
                      ? "bg-brand text-white"
                      : "bg-white text-slate-700 hover:bg-brand-hero border border-brand-line"
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
              <p className="text-4xl mb-2"></p>
              <p className="font-semibold text-slate-700">{t("flash.noNotes")}</p>
              <button
                onClick={() => openNewNoteModal()}
                className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm text-white"
              >
                {t("flash.addNote")}
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-2xl border border-brand-line bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md bg-brand-tint px-2.5 py-0.5 text-xs font-bold text-brand">
                        {note.subject}
                      </span>
                      <span className="text-xs text-slate-400">{note.createdAt}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-slate-900 mb-2 leading-snug">
                      {note.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                      {note.summary || note.content}
                    </p>

                    {/* Tags */}
                    {note.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setReadingNote(note)}
                        className="rounded-lg bg-brand-tint px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand hover:text-white transition flex items-center gap-1"
                      >
                         {t("flash.readNote")}
                      </button>

                      <button
                        onClick={() => handleTurnNoteToCard(note)}
                        className="rounded-lg border border-brand-line px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-tint transition flex items-center gap-1"
                        title="Create a flashcard using this note"
                      >
                        {t("flash.turnToCard")}
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-3 text-xs pt-1 text-slate-400">
                      <button
                        onClick={() => openEditNoteModal(note)}
                        className="hover:text-brand"
                      >
                        {t("flash.edit")}
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="hover:text-rose-600"
                      >
                        {t("flash.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= NOTE READER MODAL ======================= */}
      {readingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 modal-overlay">
          <div className="modal-content max-w-2xl w-full max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-brand-line">
            {/* Modal Header */}
            <div className="bg-brand-tint border-b border-brand-line p-5 flex items-start justify-between">
              <div>
                <span className="rounded-md bg-brand text-white px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                  {readingNote.subject}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-brand-head mt-1">
                  {readingNote.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs text-slate-500"> {readingNote.createdAt}</span>
                  {readingNote.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-white px-2 py-0.5 text-xs font-medium text-slate-600 border border-brand-line"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setReadingNote(null)}
                className="text-slate-400 hover:text-slate-700 text-2xl font-bold p-1 leading-none"
              >
                
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-800 text-sm leading-relaxed">
              {readingNote.summary && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-900">
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-1">
                     Key Takeaway
                  </h4>
                  <p>{readingNote.summary}</p>
                </div>
              )}

              <div className="whitespace-pre-line font-mono text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700">
                {readingNote.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyNote(readingNote.content)}
                  className="rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  {copyFeedback ? " " + t("flash.copied") : " " + t("flash.copy")}
                </button>
                <button
                  onClick={() => handleDownloadNote(readingNote)}
                  className="rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                   {t("flash.download")}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleTurnNoteToCard(readingNote);
                    setReadingNote(null);
                  }}
                  className="rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark transition"
                >
                   {t("flash.turnToCard")}
                </button>
                <button
                  onClick={() => setReadingNote(null)}
                  className="rounded-lg bg-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300 transition"
                >
                  {t("flash.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= ADD / EDIT FLASHCARD MODAL ======================= */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 modal-overlay">
          <div className="modal-content max-w-lg w-full bg-white rounded-2xl shadow-2xl p-6 border border-brand-line">
            <h3 className="text-xl font-bold text-brand-head mb-4">
              {editingCard ? t("flash.edit") : t("flash.addCard")}
            </h3>

            <form onSubmit={handleSaveCard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("flash.subject")}
                </label>
                <input
                  type="text"
                  required
                  value={cardFormData.subject}
                  onChange={(e) =>
                    setCardFormData({ ...cardFormData, subject: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                  placeholder="e.g. Data Structures, DBMS, Operating Systems"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("flash.question")}
                </label>
                <textarea
                  required
                  rows={2}
                  value={cardFormData.question}
                  onChange={(e) =>
                    setCardFormData({ ...cardFormData, question: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                  placeholder="Enter the front question or term..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("flash.answer")}
                </label>
                <textarea
                  required
                  rows={3}
                  value={cardFormData.answer}
                  onChange={(e) =>
                    setCardFormData({ ...cardFormData, answer: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                  placeholder="Enter the answer or definition..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("flash.asExplanation")}
                </label>
                <textarea
                  rows={2}
                  value={cardFormData.asExplanation}
                  onChange={(e) =>
                    setCardFormData({ ...cardFormData, asExplanation: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                  placeholder="অসমীয়া ব্যাখ্যা বা অনুবাদ (ঐচ্ছিক)..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("flash.hintLabel")}
                </label>
                <input
                  type="text"
                  value={cardFormData.hint}
                  onChange={(e) =>
                    setCardFormData({ ...cardFormData, hint: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                  placeholder="Optional hint for the student..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:bg-slate-200"
                >
                  {t("flash.cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  {t("flash.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ADD / EDIT NOTE MODAL ======================= */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 modal-overlay">
          <div className="modal-content max-w-lg w-full bg-white rounded-2xl shadow-2xl p-6 border border-brand-line max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-brand-head mb-4">
              {editingNote ? t("flash.edit") : t("flash.addNote")}
            </h3>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("flash.noteTitle")}
                </label>
                <input
                  type="text"
                  required
                  value={noteFormData.title}
                  onChange={(e) =>
                    setNoteFormData({ ...noteFormData, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                  placeholder="e.g. Binary Search Trees & AVL Rotations"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("flash.subject")}
                </label>
                <input
                  type="text"
                  required
                  value={noteFormData.subject}
                  onChange={(e) =>
                    setNoteFormData({ ...noteFormData, subject: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                  placeholder="e.g. Data Structures, DBMS, Operating Systems"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("flash.noteTags")}
                </label>
                <input
                  type="text"
                  value={noteFormData.tags}
                  onChange={(e) =>
                    setNoteFormData({ ...noteFormData, tags: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                  placeholder="e.g. Trees, AVL, Algorithms"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("flash.noteSummary")}
                </label>
                <input
                  type="text"
                  value={noteFormData.summary}
                  onChange={(e) =>
                    setNoteFormData({ ...noteFormData, summary: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-brand"
                  placeholder="One sentence takeaway..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("flash.noteContent")}
                </label>
                <textarea
                  required
                  rows={6}
                  value={noteFormData.content}
                  onChange={(e) =>
                    setNoteFormData({ ...noteFormData, content: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-mono focus:outline-none focus:border-brand"
                  placeholder="Enter detailed revision notes..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:bg-slate-200"
                >
                  {t("flash.cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  {t("flash.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
