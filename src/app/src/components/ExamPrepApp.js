"use client";

import { useState, useRef, useCallback } from "react";

const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });

const TABS = ["Summary", "Flashcards", "Quiz", "Short Questions", "Key Topics"];
const TAB_ICONS = {
  Summary: "📌",
  Flashcards: "🧠",
  Quiz: "❓",
  "Short Questions": "📝",
  "Key Topics": "🎯",
};

function Header() {
  return (
    <header style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0e7490 100%)", position: "relative", overflow: "hidden" }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="pulse-circle" style={{ position: "absolute", borderRadius: "50%", background: "rgba(14,116,144,0.15)", width: `${120 + i * 80}px`, height: `${120 + i * 80}px`, top: `${-30 + i * 10}px`, right: `${-20 + i * 30}px`, animationDelay: `${i * 0.5}s` }} />
      ))}
      <div style={{ position: "relative", zIndex: 1, padding: "28px 40px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #06b6d4, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 4px 20px rgba(6,182,212,0.4)" }}>🎓</div>
          <div>
            <h1 style={{ margin: 0, color: "#fff", fontSize: 26, fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px" }}>ExamPrep AI</h1>
            <p style={{ margin: 0, color: "#94d8e8", fontSize: 13 }}>Upload study material → Get your complete exam kit instantly</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function UploadPage({ onGenerate }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setError("");
    try {
      const content = await readFileAsText(f);
      setText(content);
    } catch {
      setError("Could not read file. Please paste your content manually.");
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) { setError("Please add some study material first."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }
      const kit = await res.json();
      onGenerate(kit, file?.name || "Pasted Text");
    } catch (e) {
      setError(e.message || "AI generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ background: "linear-gradient(135deg, #eff6ff, #ecfeff)", border: "1px solid #bae6fd", borderRadius: 20, padding: "28px 32px", marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>📚 Upload Your Study Material</h2>
        <p style={{ margin: 0, color: "#475569", fontSize: 14 }}>Upload a TXT or DOCX file, or paste your notes directly below.</p>
      </div>

      <label htmlFor="file-upload" onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
        style={{ display: "block", border: `2px dashed ${dragOver ? "#0891b2" : file ? "#0891b2" : "#cbd5e1"}`, borderRadius: 16, padding: "40px 24px", textAlign: "center", background: dragOver ? "#ecfeff" : file ? "#f0fdff" : "#f8fafc", cursor: "pointer", transition: "all 0.2s", marginBottom: 20 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{file ? "✅" : "📂"}</div>
        <p style={{ margin: 0, fontWeight: 700, color: "#334155", fontSize: 15 }}>{file ? file.name : "Tap here to choose a file"}</p>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94a3b8" }}>{file ? "Tap to change file" : "TXT · DOCX supported"}</p>
        <input id="file-upload" ref={fileRef} type="file" accept=".txt,.text,.docx" onChange={(e) => handleFile(e.target.files[0])} style={{ display: "none" }} />
      </label>

      <div style={{ textAlign: "center", color: "#94a3b8", marginBottom: 16, fontSize: 13, fontWeight: 500 }}>— OR PASTE TEXT —</div>

      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your notes, textbook excerpt, or any study material here..." rows={10}
        style={{ width: "100%", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "16px 18px", fontSize: 14, lineHeight: 1.7, color: "#1e293b", fontFamily: "inherit", resize: "vertical", outline: "none", background: "#fff" }}
        onFocus={(e) => (e.target.style.borderColor = "#0891b2")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />

      {error && <div style={{ marginTop: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", color: "#dc2626", fontSize: 13 }}>{error}</div>}

      <button onClick={handleSubmit} disabled={loading}
        style={{ marginTop: 24, width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#94a3b8" : "linear-gradient(135deg, #0f172a, #0e7490)", color: "#fff", fontSize: 16, fontWeight: 700, boxShadow: loading ? "none" : "0 4px 20px rgba(14,116,144,0.35)" }}>
        {loading ? "⚡ Generating Your Exam Kit..." : "🚀 Generate Exam Prep Kit"}
      </button>

      {loading && (
        <div style={{ marginTop: 20 }}>
          <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
            <div className="loading-bar" style={{ height: "100%", borderRadius: 99, width: "60%", background: "linear-gradient(90deg, #0e7490, #3b82f6)" }} />
          </div>
          <p style={{ marginTop: 10, color: "#64748b", fontSize: 13, textAlign: "center" }}>AI is reading your material and crafting flashcards, quizzes & summaries...</p>
        </div>
      )}
    </div>
  );
}

function SummaryTab({ data }) {
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #f0fdf4, #eff6ff)", border: "1px solid #bbf7d0", borderRadius: 16, padding: "24px 28px", marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 14px", color: "#0f172a", fontSize: 18, fontWeight: 700 }}>📌 Chapter Summary</h3>
        <p style={{ margin: 0, color: "#334155", lineHeight: 1.8, fontSize: 15 }}>{data.summary}</p>
      </div>
      {data.definitions?.length > 0 && (
        <div>
          <h3 style={{ margin: "0 0 16px", color: "#0f172a", fontSize: 17, fontWeight: 700 }}>📖 Key Definitions & Formulas</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {data.definitions.map((d, i) => (
              <div key={i} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "14px 18px", display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
                <span style={{ fontWeight: 700, color: "#0891b2", fontSize: 14 }}>{d.term}</span>
                <span style={{ color: "#475569", fontSize: 14, lineHeight: 1.6 }}>{d.definition}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FlashcardsTab({ data }) {
  const cards = data.flashcards || [];
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];

  const go = (dir) => { setFlipped(false); setTimeout(() => setIndex((i) => (i + dir + cards.length) % cards.length), 50); };

  if (!cards.length) return <p>No flashcards generated.</p>;

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Card {index + 1} of {cards.length} · Click card to flip</p>
      <div className="flashcard-scene" onClick={() => setFlipped(!flipped)} style={{ cursor: "pointer", height: 220, marginBottom: 28 }}>
        <div className={`flashcard-inner ${flipped ? "flipped" : ""}`} style={{ width: "100%", height: "100%", position: "relative" }}>
          <div className="flashcard-face" style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0f172a, #1e3a5f)", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 36px", boxShadow: "0 8px 32px rgba(14,116,144,0.2)" }}>
            <span style={{ color: "#0ea5e9", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Question</span>
            <p style={{ margin: 0, color: "#f1f5f9", fontSize: 17, lineHeight: 1.6, fontWeight: 500 }}>{card.question}</p>
            <span style={{ marginTop: 20, color: "#94a3b8", fontSize: 12 }}>Tap to reveal answer →</span>
          </div>
          <div className="flashcard-face flashcard-back" style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0e7490, #0891b2)", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 36px" }}>
            <span style={{ color: "#cffafe", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Answer</span>
            <p style={{ margin: 0, color: "#fff", fontSize: 16, lineHeight: 1.7 }}>{card.answer}</p>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={() => go(-1)} style={{ padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#334155" }}>← Previous</button>
        <button onClick={() => go(1)} style={{ padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "none", background: "linear-gradient(135deg,#0f172a,#0e7490)", color: "#fff", cursor: "pointer" }}>Next →</button>
      </div>
      <div style={{ marginTop: 36 }}>
        <h3 style={{ color: "#0f172a", fontSize: 16, fontWeight: 700, marginBottom: 16, textAlign: "left" }}>All Flashcards</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {cards.map((c, i) => (
            <div key={i} onClick={() => { setIndex(i); setFlipped(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              style={{ background: i === index ? "#ecfeff" : "#f8fafc", border: `1.5px solid ${i === index ? "#0891b2" : "#e2e8f0"}`, borderRadius: 12, padding: "12px 16px", cursor: "pointer", textAlign: "left" }}>
              <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#0f172a", fontSize: 13 }}>Q: {c.question}</p>
              <p style={{ margin: 0, color: "#64748b", fontSize: 12 }}>A: {c.answer.slice(0, 80)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuizTab({ data }) {
  const mcq = data.mcq || [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const score = submitted ? mcq.filter((q) => answers[q.id] === q.correct).length : 0;

  if (!started) return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>❓</div>
      <h3 style={{ color: "#0f172a", fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>Quiz Time!</h3>
      <p style={{ color: "#64748b", marginBottom: 32 }}>{mcq.length} multiple choice questions based on your material</p>
      <button onClick={() => setStarted(true)} style={{ padding: "14px 40px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0f172a,#0e7490)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Start Quiz →</button>
    </div>
  );

  if (submitted) {
    const pct = Math.round((score / mcq.length) * 100);
    const grade = pct >= 90 ? "🏆 Excellent!" : pct >= 70 ? "👍 Good!" : pct >= 50 ? "📖 Keep Studying" : "💪 More Practice Needed";
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "linear-gradient(135deg,#0f172a,#0e7490)", borderRadius: 20, padding: "32px 48px", marginBottom: 28 }}>
          <p style={{ color: "#94d8e8", fontSize: 13, fontWeight: 600, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 2 }}>Your Score</p>
          <p style={{ color: "#fff", fontSize: 56, fontWeight: 900, margin: 0, lineHeight: 1 }}>{pct}%</p>
          <p style={{ color: "#cffafe", fontSize: 18, margin: "10px 0 0" }}>{grade}</p>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "8px 0 0" }}>{score} / {mcq.length} correct</p>
        </div>
        <div style={{ textAlign: "left" }}>
          {mcq.map((q, i) => {
            const isCorrect = answers[q.id] === q.correct;
            return (
              <div key={i} style={{ background: isCorrect ? "#f0fdf4" : "#fef2f2", border: `1.5px solid ${isCorrect ? "#86efac" : "#fca5a5"}`, borderRadius: 14, padding: "16px 20px", marginBottom: 12 }}>
                <p style={{ margin: "0 0 10px", fontWeight: 600, color: "#0f172a" }}>{isCorrect ? "✅" : "❌"} Q{i + 1}: {q.question}</p>
                {q.options.map((opt, j) => (
                  <div key={j} style={{ padding: "6px 12px", borderRadius: 8, marginBottom: 4, fontSize: 13, background: j === q.correct ? "#dcfce7" : j === answers[q.id] && !isCorrect ? "#fee2e2" : "transparent", color: j === q.correct ? "#166534" : j === answers[q.id] ? "#991b1b" : "#64748b", fontWeight: j === q.correct ? 700 : 400 }}>{opt}</div>
                ))}
              </div>
            );
          })}
        </div>
        <button onClick={() => { setAnswers({}); setSubmitted(false); setStarted(false); }} style={{ marginTop: 20, padding: "12px 32px", borderRadius: 12, border: "none", background: "#0f172a", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>🔄 Retake Quiz</button>
      </div>
    );
  }

  return (
    <div>
      {mcq.map((q, i) => (
        <div key={i} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "20px 24px", marginBottom: 16 }}>
          <p style={{ margin: "0 0 14px", fontWeight: 700, color: "#0f172a", fontSize: 15 }}>Q{i + 1}. {q.question}</p>
          <div style={{ display: "grid", gap: 8 }}>
            {q.options.map((opt, j) => (
              <div key={j} onClick={() => setAnswers({ ...answers, [q.id]: j })}
                style={{ padding: "10px 16px", borderRadius: 10, cursor: "pointer", border: `1.5px solid ${answers[q.id] === j ? "#0891b2" : "#e2e8f0"}`, background: answers[q.id] === j ? "#ecfeff" : "#f8fafc", color: answers[q.id] === j ? "#0e7490" : "#334155", fontWeight: answers[q.id] === j ? 600 : 400, fontSize: 14 }}>{opt}</div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < mcq.length}
        style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: Object.keys(answers).length < mcq.length ? "#94a3b8" : "linear-gradient(135deg,#0f172a,#0e7490)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: Object.keys(answers).length < mcq.length ? "not-allowed" : "pointer" }}>
        Submit Quiz ({Object.keys(answers).length}/{mcq.length} answered)
      </button>
    </div>
  );
}

function ShortQuestionsTab({ data }) {
  const qs = data.shortAnswers || [];
  const [open, setOpen] = useState({});
  return (
    <div>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Click a question to reveal its model answer.</p>
      {qs.map((q, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div onClick={() => setOpen({ ...open, [i]: !open[i] })} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: open[i] ? "14px 14px 0 0" : 14, padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: 14, lineHeight: 1.5 }}>📝 Q{i + 1}: {q.question}</p>
            <span style={{ color: "#94a3b8", fontSize: 18, marginLeft: 12, flexShrink: 0 }}>{open[i] ? "▲" : "▼"}</span>
          </div>
          {open[i] && (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderTop: "none", borderRadius: "0 0 14px 14px", padding: "14px 20px" }}>
              <p style={{ margin: 0, color: "#166534", fontSize: 14, lineHeight: 1.7 }}>✅ {q.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function KeyTopicsTab({ data }) {
  const topics = data.keyTopics || [];
  const colors = {
    high: { bg: "#fef2f2", border: "#fca5a5", badge: "#dc2626", label: "HIGH" },
    medium: { bg: "#fffbeb", border: "#fcd34d", badge: "#d97706", label: "MEDIUM" },
    low: { bg: "#f0fdf4", border: "#86efac", badge: "#16a34a", label: "LOW" },
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {["high", "medium", "low"].map((lvl) => (
          <div key={lvl} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[lvl].badge }} />
            {colors[lvl].label} Priority
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {topics.map((t, i) => {
          const c = colors[t.importance] || colors.medium;
          return (
            <div key={i} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 14, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>🎯</span>
                <h4 style={{ margin: 0, color: "#0f172a", fontWeight: 700, fontSize: 15 }}>{t.topic}</h4>
                <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: c.badge, textTransform: "uppercase", background: "#fff", border: `1.5px solid ${c.border}`, padding: "2px 8px", borderRadius: 6 }}>{c.label}</span>
              </div>
              <p style={{ margin: 0, color: "#475569", fontSize: 13, lineHeight: 1.6 }}>{t.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultsPage({ kit, source, onReset }) {
  const [tab, setTab] = useState("Summary");

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(kit, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-prep-kit.json";
    a.click();
  };

  const tabContent = () => {
    switch (tab) {
      case "Summary": return <SummaryTab data={kit} />;
      case "Flashcards": return <FlashcardsTab data={kit} />;
      case "Quiz": return <QuizTab data={kit} />;
      case "Short Questions": return <ShortQuestionsTab data={kit} />;
      case "Key Topics": return <KeyTopicsTab data={kit} />;
      default: return null;
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "12px 20px", marginBottom: 28, flexWrap: "wrap", gap: 10 }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Generated from</p>
          <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: 14 }}>📄 {source}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={downloadJSON} style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1.5px solid #0891b2", background: "#ecfeff", color: "#0e7490", cursor: "pointer" }}>⬇ Download Kit</button>
          <button onClick={onReset} style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1.5px solid #e2e8f0", background: "#fff", color: "#334155", cursor: "pointer" }}>+ New Upload</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Flashcards", value: kit.flashcards?.length || 0, icon: "🧠", color: "#eff6ff" },
          { label: "MCQ Questions", value: kit.mcq?.length || 0, icon: "❓", color: "#f0fdf4" },
          { label: "Short Q's", value: kit.shortAnswers?.length || 0, icon: "📝", color: "#fffbeb" },
          { label: "Key Topics", value: kit.keyTopics?.length || 0, icon: "🎯", color: "#fdf4ff" },
          { label: "Definitions", value: kit.definitions?.length || 0, icon: "📖", color: "#ecfeff" },
        ].map((s, i) => (
          <div key={i} style={{ background: s.color, border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap", background: tab === t ? "linear-gradient(135deg,#0f172a,#0e7490)" : "#f1f5f9", color: tab === t ? "#fff" : "#64748b", boxShadow: tab === t ? "0 2px 12px rgba(14,116,144,0.3)" : "none" }}>
            {TAB_ICONS[t]} {t}
          </button>
        ))}
      </div>

      <div>{tabContent()}</div>
    </div>
  );
}

export default function ExamPrepApp() {
  const [kit, setKit] = useState(null);
  const [source, setSource] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Outfit', sans-serif" }}>
      <Header />
      <main>
        {!kit ? (
          <UploadPage onGenerate={(k, s) => { setKit(k); setSource(s); }} />
        ) : (
          <ResultsPage kit={kit} source={source} onReset={() => setKit(null)} />
        )}
      </main>
      <footer style={{ textAlign: "center", padding: 24, color: "#94a3b8", fontSize: 12, borderTop: "1px solid #e2e8f0", background: "#fff" }}>
        ExamPrep AI · Powered by Claude · Made for students who want to ace their exams 🎓
      </footer>
    </div>
  );
}
