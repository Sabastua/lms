import React, { useState, useEffect } from "react";
import { apiRequest } from "../api/client";

const CATEGORIES = [
  { id: "17", name: "Science & Nature" },
  { id: "18", name: "Science: Computers" },
  { id: "19", name: "Science: Mathematics" },
  { id: "22", name: "Geography" },
  { id: "23", name: "World History" },
  { id: "10", name: "Literature & Books" },
  { id: "9", name: "General Knowledge" }
];

export default function QuizzesView() {
  const [category, setCategory] = useState("17");
  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [scoreBanner, setScoreBanner] = useState(null);

  useEffect(() => {
    fetchQuiz("17", "");
  }, []);

  async function fetchQuiz(catId, diff) {
    setLoading(true);
    setError("");
    setAnswers({});
    setScoreBanner(null);

    let url = `https://opentdb.com/api.php?amount=5&category=${encodeURIComponent(catId)}&type=multiple`;
    if (diff) url += `&difficulty=${encodeURIComponent(diff)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        setError("OpenTDB rate limit reached (1 request per 5 seconds). Please wait a moment and try again.");
        setQuestions([]);
        return;
      }

      const formatted = data.results.map((q, idx) => ({
        id: idx,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        correct: q.correct_answer,
        options: [...q.incorrect_answers, q.correct_answer].sort(() => 0.5 - Math.random())
      }));

      setQuestions(formatted);
    } catch (err) {
      setError("Failed to fetch assessment questions: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOption(qId, selectedOption, correctOption) {
    if (answers[qId]) return; // already answered
    const isCorrect = selectedOption === correctOption;
    const newAnswers = { ...answers, [qId]: { selected: selectedOption, isCorrect } };
    setAnswers(newAnswers);

    const total = questions.length;
    const answeredCount = Object.keys(newAnswers).length;
    const correctCount = Object.values(newAnswers).filter((a) => a.isCorrect).length;

    setScoreBanner({ answered: answeredCount, correct: correctCount, total });

    if (answeredCount === total) {
      // Save result to backend SQLite
      const categoryObj = CATEGORIES.find((c) => c.id === category);
      apiRequest("/api/quizzes/attempts", {
        method: "POST",
        body: JSON.stringify({
          categoryName: categoryObj?.name || "Practice Assessment",
          score: correctCount,
          totalQuestions: total
        })
      }).catch(console.error);
    }
  }

  return (
    <div>
      <div className="section-header">
        <h1>Practice Assessments &amp; Quizzes (OpenTDB API)</h1>
        <p>
          Test your subject mastery with live verified multiple-choice questions from the Open Trivia Database (<code>https://opentdb.com/api.php</code>).
          Results are automatically recorded to your personal SQLite profile.
        </p>
      </div>

      <div className="toolbar">
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} (cat={cat.id})
            </option>
          ))}
        </select>
        <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">Any Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button className="btn btn-primary" onClick={() => fetchQuiz(category, difficulty)} disabled={loading}>
          {loading ? "Generating..." : "Generate 5-Question Quiz"}
        </button>
      </div>

      {scoreBanner && (
        <div className="reader-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>Quiz Progress:</strong> {scoreBanner.answered} of {scoreBanner.total} answered &nbsp;|&nbsp;{" "}
              <strong>Current Score:</strong> {scoreBanner.correct} / {scoreBanner.total} (
              {Math.round((scoreBanner.correct / scoreBanner.total) * 100)}%)
            </div>
            {scoreBanner.answered === scoreBanner.total && (
              <span className="card-tag" style={{ margin: 0, backgroundColor: "var(--success-bg)", color: "var(--success)" }}>
                Saved to SQLite Profile
              </span>
            )}
          </div>
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}
      {loading && <p style={{ color: "var(--text-muted)" }}>Loading questions from OpenTDB API...</p>}

      <div style={{ display: "grid", gap: "16px" }}>
        {questions.map((q, idx) => {
          const ans = answers[q.id];
          return (
            <div key={q.id} className="quiz-question-box">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span className="card-tag">
                  {q.category} • {q.difficulty.toUpperCase()}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Question {idx + 1} of {questions.length}
                </span>
              </div>
              <h3 style={{ fontSize: "15px" }} dangerouslySetInnerHTML={{ __html: q.question }} />
              <div className="quiz-options">
                {q.options.map((opt, i) => {
                  let optClass = "quiz-option";
                  if (ans) {
                    if (opt === q.correct) optClass += " correct";
                    else if (ans.selected === opt) optClass += " incorrect";
                  }
                  return (
                    <button
                      key={i}
                      className={optClass}
                      disabled={Boolean(ans)}
                      onClick={() => handleSelectOption(q.id, opt, q.correct)}
                      dangerouslySetInnerHTML={{ __html: opt }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
