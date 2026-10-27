import React, { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import CertificateModal from "./CertificateModal";
import CourseOverviewModal from "./CourseOverviewModal";
import { getCourseDetails, SPECIALIZATIONS } from "../data/courseraMetadata";

const CATEGORIES = [
  "All",
  "Computer Science & AI",
  "Mathematics",
  "Natural Sciences",
  "World History & Civics",
  "Economics & Finance",
  "Philosophy & Literature"
];

function parseTimestampToSeconds(ts) {
  if (!ts) return 0;
  const parts = ts.split(":").map(Number);
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  return parseInt(ts, 10) || 0;
}

export default function CoursesView({ initialCourseId, onClearInitialCourseId }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  const [lessonError, setLessonError] = useState("");
  const [submittingProgress, setSubmittingProgress] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  // Coursera Additions
  const [selectedOverviewCourse, setSelectedOverviewCourse] = useState(null);
  const [catalogTab, setCatalogTab] = useState("courses"); // "courses" | "specializations"
  const [expandedPlayerWeek, setExpandedPlayerWeek] = useState(1);

  // Certificates & Extras
  const [activeCert, setActiveCert] = useState(null);
  const [activeBottomTab, setActiveBottomTab] = useState("notes");

  // Notes
  const [lessonNotes, setLessonNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTimestamp, setNewNoteTimestamp] = useState("00:00");

  // AI Tutor
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState(null);

  // Reviews & Discussions
  const [courseReviews, setCourseReviews] = useState([]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [lessonDiscussions, setLessonDiscussions] = useState([]);
  const [newDiscussionContent, setNewDiscussionContent] = useState("");

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedInstitution, setSelectedInstitution] = useState("All Institutions");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showEdxGuide, setShowEdxGuide] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/courses");
      setCourses(data.courses || []);
      if (initialCourseId) {
        openCourse(initialCourseId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openCourse(courseId) {
    setLessonLoading(true);
    setLessonError("");
    setLessonData(null);
    try {
      const data = await apiRequest(`/api/courses/${courseId}`);
      setActiveCourse(data.course);
      loadCourseReviews(courseId);
      if (data.course.lessons && data.course.lessons.length > 0) {
        selectLesson(data.course.lessons[0], data.course);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLessonLoading(false);
    }
  }

  async function handleEnroll(courseId) {
    try {
      await apiRequest(`/api/courses/${courseId}/enroll`, { method: "POST" });
      await loadCourses();
      if (activeCourse && activeCourse.id === courseId) {
        await openCourse(courseId);
      }
    } catch (err) {
      alert("Failed to enroll: " + err.message);
    }
  }

  async function selectLesson(lesson, courseContext) {
    setActiveLesson(lesson);
    setLessonLoading(true);
    setLessonError("");
    setLessonData(null);
    setQuizScore(null);
    setAiOutput(null);
    loadLessonNotes(lesson.id);
    loadLessonDiscussions(lesson.id);

    try {
      if (lesson.lessonType === "wikipedia") {
        const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(lesson.sourceRef)}`);
        const extractRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(lesson.sourceRef)}&format=json&origin=*`);
        const summaryData = await summaryRes.json();
        const extractData = await extractRes.json();
        const pages = extractData?.query?.pages || {};
        const page = Object.values(pages)[0] || {};
        const rawText = page.extract || summaryData.extract || "";
        const paragraphs = rawText
          .split("\n")
          .map((p) => p.trim())
          .filter((p) => p.length > 40 && !p.startsWith("=="))
          .slice(0, 8);

        setLessonData({
          type: "wikipedia",
          title: summaryData.title || lesson.title,
          description: summaryData.description,
          thumbnail: summaryData.thumbnail?.source,
          url: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(lesson.sourceRef)}`,
          paragraphs: paragraphs.length ? paragraphs : [summaryData.extract || "No article content available."]
        });
      } else if (lesson.lessonType === "gutenberg") {
        const res = await fetch(`https://gutendex.com/books/${encodeURIComponent(lesson.sourceRef)}`);
        const book = await res.json();
        const authors = (book.authors || []).map((a) => a.name).join("; ") || "Unknown Author";
        const htmlLink = book.formats?.["text/html"] || book.formats?.["text/html; charset=utf-8"] || `https://www.gutenberg.org/ebooks/${book.id}`;
        const epubLink = book.formats?.["application/epub+zip"];

        setLessonData({
          type: "gutenberg",
          title: book.title || lesson.title,
          authors,
          downloads: book.download_count,
          subjects: (book.subjects || []).slice(0, 5).join(" • "),
          htmlLink,
          epubLink,
          summary: book.summaries?.[0] || lesson.contentBody || "Free public-domain text via Project Gutenberg."
        });
      } else if (lesson.lessonType === "country") {
        const res = await fetch(`https://restcountries.com/v3.1/alpha/${encodeURIComponent(lesson.sourceRef)}?fields=name,capital,population,region,subregion,flags,languages,currencies,area,maps`);
        const raw = await res.json();
        const c = Array.isArray(raw) ? raw[0] : raw;
        const languages = Object.values(c.languages || {}).join(", ");
        const currencies = Object.values(c.currencies || {}).map((cur) => `${cur.name} (${cur.symbol || ""})`).join(", ");

        setLessonData({
          type: "country",
          commonName: c.name?.common,
          officialName: c.name?.official,
          flag: c.flags?.svg || c.flags?.png,
          capital: (c.capital || []).join(", ") || "N/A",
          region: `${c.region} - ${c.subregion || ""}`,
          population: (c.population || 0).toLocaleString(),
          area: (c.area || 0).toLocaleString(),
          languages,
          currencies,
          mapUrl: c.maps?.googleMaps
        });
      } else if (lesson.lessonType === "video") {
        setLessonData({
          type: "video",
          youtubeId: lesson.sourceRef,
          notes: lesson.contentBody
        });
      } else if (lesson.lessonType === "quiz") {
        const catId = lesson.sourceRef || "18";
        const res = await fetch(`https://opentdb.com/api.php?amount=3&category=${encodeURIComponent(catId)}&type=multiple`);
        const data = await res.json();
        const results = (data.results || []).map((q, idx) => ({
          id: idx,
          question: q.question,
          correct: q.correct_answer,
          options: [...q.incorrect_answers, q.correct_answer].sort(() => 0.5 - Math.random())
        }));

        setLessonData({
          type: "quiz",
          categoryName: data.results?.[0]?.category || "Course Assessment",
          questions: results,
          userAnswers: {}
        });
      } else {
        setLessonData({
          type: "custom",
          title: lesson.title,
          body: lesson.contentBody
        });
      }
    } catch (err) {
      setLessonError("Failed to fetch lesson OER content: " + err.message);
    } finally {
      setLessonLoading(false);
    }
  }

  async function handleToggleComplete() {
    if (!activeLesson) return;
    setSubmittingProgress(true);
    try {
      const res = await apiRequest(`/api/lessons/${activeLesson.id}/toggle-complete`, { method: "POST" });
      const updatedProgress = res.progress;

      setActiveLesson((prev) => ({ ...prev, completed: updatedProgress.completed }));

      setActiveCourse((prev) => {
        if (!prev) return prev;
        const updatedLessons = prev.lessons.map((l) =>
          l.id === activeLesson.id ? { ...l, completed: updatedProgress.completed } : l
        );
        return {
          ...prev,
          isEnrolled: true,
          completedLessons: updatedProgress.completedLessons,
          progressPercent: updatedProgress.progressPercent,
          lessons: updatedLessons
        };
      });

      // Update local catalog list
      setCourses((prevList) =>
        prevList.map((c) =>
          c.id === activeCourse.id
            ? {
                ...c,
                isEnrolled: true,
                completedLessons: updatedProgress.completedLessons,
                progressPercent: updatedProgress.progressPercent
              }
            : c
        )
      );
    } catch (err) {
      alert("Error toggling completion: " + err.message);
    } finally {
      setSubmittingProgress(false);
    }
  }

  async function handleSaveBookmark(resourceType, title, sourceRef, metadata = {}) {
    try {
      await apiRequest("/api/bookmarks", {
        method: "POST",
        body: JSON.stringify({ resourceType, title, sourceRef, metadata })
      });
      alert(`Bookmarked "${title}" to your dashboard!`);
    } catch (err) {
      alert("Failed to bookmark: " + err.message);
    }
  }

  function handleAnswerSelect(qId, selectedOption, isCorrect) {
    if (!lessonData || lessonData.type !== "quiz") return;
    const currentAnswers = { ...lessonData.userAnswers, [qId]: { selected: selectedOption, isCorrect } };
    setLessonData((prev) => ({ ...prev, userAnswers: currentAnswers }));

    const totalQuestions = lessonData.questions.length;
    const answeredCount = Object.keys(currentAnswers).length;

    if (answeredCount === totalQuestions) {
      const correctCount = Object.values(currentAnswers).filter((a) => a.isCorrect).length;
      setQuizScore({ score: correctCount, total: totalQuestions });

      // Save to backend SQLite
      apiRequest("/api/quizzes/attempts", {
        method: "POST",
        body: JSON.stringify({
          courseId: activeCourse?.id,
          categoryName: lessonData.categoryName,
          score: correctCount,
          totalQuestions
        })
      }).catch(console.error);
    }
  }

  // --- CERTIFICATE & SYLLABUS EXPORT ---
  async function handleClaimCertificate() {
    if (!activeCourse) return;
    try {
      const res = await apiRequest(`/api/courses/${activeCourse.id}/certificate`, { method: "POST" });
      setActiveCert(res.certificate);
    } catch (err) {
      alert("Certificate error: " + err.message);
    }
  }

  function handleExportSyllabus() {
    if (!activeCourse) return;
    const exportData = {
      schema: "openlearn-curriculum-v1",
      exportedAt: new Date().toISOString(),
      institution: activeCourse.institution,
      courseTitle: activeCourse.title,
      category: activeCourse.category,
      difficulty: activeCourse.difficulty,
      description: activeCourse.description,
      totalModules: activeCourse.lessons?.length || 0,
      modules: (activeCourse.lessons || []).map((l, idx) => ({
        index: idx + 1,
        title: l.title,
        type: l.lessonType,
        reference: l.sourceRef,
        notes: l.contentBody
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeCourse.id}-syllabus.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- LECTURE NOTES HANDLERS ---
  async function loadLessonNotes(lessonId) {
    try {
      const res = await apiRequest(`/api/lessons/${lessonId}/notes`);
      setLessonNotes(res.notes || []);
    } catch (err) {
      console.error("Failed to load notes", err);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!newNoteContent.trim() || !activeLesson) return;
    try {
      const res = await apiRequest(`/api/lessons/${activeLesson.id}/notes`, {
        method: "POST",
        body: JSON.stringify({
          courseId: activeCourse?.id,
          content: newNoteContent.trim(),
          timestampLabel: newNoteTimestamp.trim() || "00:00",
          timestampSeconds: parseTimestampToSeconds(newNoteTimestamp)
        })
      });
      setLessonNotes((prev) => [...prev, res.note]);
      setNewNoteContent("");
      setNewNoteTimestamp("00:00");
    } catch (err) {
      alert("Failed to save note: " + err.message);
    }
  }

  async function handleDeleteNote(noteId) {
    try {
      await apiRequest(`/api/notes/${noteId}`, { method: "DELETE" });
      setLessonNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      alert("Failed to delete note: " + err.message);
    }
  }

  // --- AI STUDY ASSISTANT HANDLER ---
  function handleAskAi(mode) {
    if (!activeLesson) return;
    setAiLoading(true);
    setTimeout(() => {
      if (mode === "explain") {
        setAiOutput({
          title: `Core Intuition: ${activeLesson.title}`,
          body: `In this module from ${activeCourse?.institution || "OpenLearn"}, key concepts hinge on practical application and core principles rather than raw memorization. Connecting this directly to your syllabus helps bridge theoretical theorems with real-world problem sets.`
        });
      } else if (mode === "quiz") {
        setAiOutput({
          title: `Self-Assessment Checkpoint for ${activeLesson.title}`,
          body: `1. What is the fundamental problem or phenomenon investigated in "${activeLesson.title}"?\n2. How does the thesis or mechanism presented by ${activeCourse?.institution || "the instructor"} resolve edge cases?\n3. In what scenario would you apply this methodology in an engineering or scientific workflow?`
        });
      } else {
        setAiOutput({
          title: `Executive Summary: ${activeLesson.title}`,
          body: `• Primary Focus: ${activeLesson.title} (${activeLesson.lessonType.toUpperCase()} module)\n• Institutional Grounding: Sourced from ${activeCourse?.institution || "University OER"}\n• Recommended Action: Review primary text or video timestamp milestones, take notes, and complete the module assessment.`
        });
      }
      setAiLoading(false);
    }, 400);
  }

  // --- REVIEWS & DISCUSSIONS HANDLERS ---
  async function loadCourseReviews(courseId) {
    try {
      const res = await apiRequest(`/api/courses/${courseId}/reviews`);
      setCourseReviews(res.reviews || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  }

  async function handleAddReview(e) {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    try {
      const res = await apiRequest(`/api/courses/${activeCourse.id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating: newReviewRating, comment: newReviewComment.trim() })
      });
      setCourseReviews((prev) => [res.review, ...prev.filter((r) => r.id !== res.review.id)]);
      setNewReviewComment("");
      alert("Review posted successfully!");
    } catch (err) {
      alert(err.message);
    }
  }

  async function loadLessonDiscussions(lessonId) {
    try {
      const res = await apiRequest(`/api/lessons/${lessonId}/discussions`);
      setLessonDiscussions(res.discussions || []);
    } catch (err) {
      console.error("Failed to load discussions", err);
    }
  }

  async function handleAddDiscussion(e) {
    e.preventDefault();
    if (!newDiscussionContent.trim() || !activeLesson) return;
    try {
      const res = await apiRequest(`/api/lessons/${activeLesson.id}/discussions`, {
        method: "POST",
        body: JSON.stringify({ courseId: activeCourse.id, content: newDiscussionContent.trim() })
      });
      setLessonDiscussions((prev) => [...prev, res.discussion]);
      setNewDiscussionContent("");
    } catch (err) {
      alert(err.message);
    }
  }

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || c.difficulty === selectedDifficulty;
    const matchesInstitution =
      selectedInstitution === "All Institutions" || c.institution === selectedInstitution;
    const matchesSearch =
      !searchTerm.trim() ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.institution && c.institution.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesInstitution && matchesSearch;
  });

  if (loading) {
    return <p style={{ color: "var(--text-muted)" }}>Loading courses from SQLite database...</p>;
  }

  if (error) {
    return <div className="alert-error">{error}</div>;
  }

  // PLAYER VIEW
  if (activeCourse) {
    return (
      <div>
        {activeCert && <CertificateModal certificate={activeCert} onClose={() => setActiveCert(null)} />}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <button
            className="btn btn-sm"
            onClick={() => {
              setActiveCourse(null);
              if (onClearInitialCourseId) onClearInitialCourseId();
            }}
          >
            &larr; Back to Course Catalog
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-sm" onClick={handleExportSyllabus}>
              Export Syllabus (JSON)
            </button>
            {!activeCourse.isEnrolled && (
              <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(activeCourse.id)}>
                Enroll in this Course
              </button>
            )}
          </div>
        </div>

        <div className="section-header">
          <h1>{activeCourse.title}</h1>
          <p>{activeCourse.description}</p>
          <div style={{ marginTop: "8px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <span className="card-tag">{activeCourse.category}</span>
            <span className="card-tag">{activeCourse.difficulty}</span>
            <span className="card-tag" style={{ background: "var(--bg-secondary)", fontWeight: 600 }}>
              {activeCourse.institution || "Open University & OER"}
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Instructor: <strong>{activeCourse.instructorName || "OpenLearn Faculty"}</strong>
            </span>
          </div>

          <div style={{ marginTop: "12px", maxWidth: "450px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
              <span>Progress: {activeCourse.completedLessons} of {activeCourse.totalLessons} completed</span>
              <span>{activeCourse.progressPercent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${activeCourse.progressPercent}%` }}></div>
            </div>
          </div>

          {activeCourse.progressPercent === 100 && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px 18px",
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px"
              }}
            >
              <div>
                <strong style={{ color: "#0369a1", fontSize: "15px" }}>Academic Curriculum 100% Completed!</strong>
                <div style={{ fontSize: "13px", color: "#334155" }}>
                  You have satisfied all lecture and assessment requirements for {activeCourse.institution}.
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleClaimCertificate}>
                Claim / View Official Certificate &rarr;
              </button>
            </div>
          )}
        </div>

        <div className="course-player">
          {/* Lessons Sidebar (Coursera Week-by-Week Accordion) */}
          <div className="module-list">
            <div className="module-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Course Syllabus</span>
              <span style={{ fontSize: "11px", fontWeight: "normal", color: "var(--text-muted)" }}>
                {activeCourse.lessons.length} Modules
              </span>
            </div>

            {(() => {
              const lessons = activeCourse.lessons || [];
              const perWeek = 2;
              const numWeeks = Math.max(1, Math.ceil(lessons.length / perWeek));
              return Array.from({ length: numWeeks }, (_, wIdx) => {
                const weekNum = wIdx + 1;
                const weekLessons = lessons.slice(wIdx * perWeek, (wIdx + 1) * perWeek);
                const isExpanded = expandedPlayerWeek === weekNum;
                const completedInWeek = weekLessons.filter((l) => l.completed).length;

                return (
                  <div
                    key={weekNum}
                    style={{
                      marginBottom: "6px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      overflow: "hidden"
                    }}
                  >
                    <div
                      onClick={() => setExpandedPlayerWeek(isExpanded ? null : weekNum)}
                      style={{
                        padding: "10px 12px",
                        background: isExpanded ? "var(--bg-secondary)" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "13px",
                        fontWeight: 600
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>Week {weekNum}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "normal" }}>
                          ({completedInWeek}/{weekLessons.length} done)
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>

                    {isExpanded && (
                      <div style={{ background: "#ffffff" }}>
                        {weekLessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            className={`lesson-btn ${activeLesson?.id === lesson.id ? "active" : ""}`}
                            style={{ borderRadius: 0, border: "none", borderTop: "1px solid var(--border-color)" }}
                            onClick={() => selectLesson(lesson, activeCourse)}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 5px", background: "var(--bg-secondary)", borderRadius: "3px", color: "var(--text-secondary)" }}>
                                {lesson.lessonType === "video" ? "VIDEO" : lesson.lessonType === "quiz" ? "QUIZ" : "READ"}
                              </span>
                              <span style={{ fontSize: "13px" }}>{lesson.title}</span>
                            </span>
                            <span style={{ fontSize: "11px", color: lesson.completed ? "var(--success)" : "var(--text-muted)" }}>
                              {lesson.completed ? "Done" : lesson.lessonType.toUpperCase()}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>

          {/* Lesson Content Area */}
          <div className="lesson-viewer">
            {lessonLoading && <p style={{ color: "var(--text-muted)" }}>Fetching live educational resource from API...</p>}
            {lessonError && <div className="alert-error">{lessonError}</div>}

            {!lessonLoading && activeLesson && lessonData && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="api-source-pill">
                    Type: {activeLesson.lessonType.toUpperCase()} • Ref: {activeLesson.sourceRef}
                  </span>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleSaveBookmark(activeLesson.lessonType, activeLesson.title, activeLesson.sourceRef)}
                  >
                    Save Bookmark
                  </button>
                </div>

                <h2>{activeLesson.title}</h2>

                {/* Wikipedia Viewer */}
                {lessonData.type === "wikipedia" && (
                  <div>
                    {lessonData.description && (
                      <p style={{ fontStyle: "italic", color: "var(--text-muted)", marginBottom: "12px" }}>
                        {lessonData.description}
                      </p>
                    )}
                    {lessonData.thumbnail && (
                      <img
                        src={lessonData.thumbnail}
                        alt="Article Thumbnail"
                        style={{ maxHeight: "200px", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "16px" }}
                      />
                    )}
                    <div className="lesson-body">
                      {lessonData.paragraphs.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                    {lessonData.url && (
                      <div style={{ marginTop: "14px" }}>
                        <a href={lessonData.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                          Read Full Article on Wikipedia &nearr;
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Gutenberg Viewer */}
                {lessonData.type === "gutenberg" && (
                  <div>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      <strong>Author:</strong> {lessonData.authors} &nbsp;|&nbsp; <strong>Downloads:</strong>{" "}
                      {(lessonData.downloads || 0).toLocaleString()}
                    </p>
                    <div className="lesson-body">
                      <p>{lessonData.summary}</p>
                      {lessonData.subjects && (
                        <p>
                          <strong>Subjects:</strong> {lessonData.subjects}
                        </p>
                      )}
                    </div>
                    <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                      <a href={lessonData.htmlLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                        Read Full Book Online (HTML) &nearr;
                      </a>
                      {lessonData.epubLink && (
                        <a href={lessonData.epubLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                          Download EPUB &nearr;
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* REST Countries Viewer */}
                {lessonData.type === "country" && (
                  <div>
                    {lessonData.flag && (
                      <img
                        src={lessonData.flag}
                        alt="Flag"
                        style={{ maxHeight: "120px", border: "1px solid var(--border-color)", borderRadius: "4px", margin: "12px 0" }}
                      />
                    )}
                    <div className="lesson-body">
                      <p><strong>Official Name:</strong> {lessonData.officialName}</p>
                      <p><strong>Capital City:</strong> {lessonData.capital}</p>
                      <p><strong>Region / Subregion:</strong> {lessonData.region}</p>
                      <p><strong>Population:</strong> {lessonData.population}</p>
                      <p><strong>Area:</strong> {lessonData.area} km²</p>
                      <p><strong>Official Languages:</strong> {lessonData.languages}</p>
                      <p><strong>Currencies:</strong> {lessonData.currencies}</p>
                    </div>
                    {lessonData.mapUrl && (
                      <div style={{ marginTop: "12px" }}>
                        <a href={lessonData.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                          Open Map &nearr;
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Video Viewer */}
                {lessonData.type === "video" && (
                  <div>
                    {lessonData.notes && <p style={{ color: "var(--text-secondary)", marginBottom: "14px" }}>{lessonData.notes}</p>}
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${lessonData.youtubeId}`}
                        title={activeLesson.title}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                        allowFullScreen
                      />
                    </div>

                    {/* Coursera-style Interactive Video Transcript & Milestones */}
                    <div style={{ marginTop: "16px", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ padding: "10px 14px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700 }}>Interactive Transcript &amp; Lecture Milestones</span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Click timestamp to review section</span>
                      </div>
                      <div style={{ maxHeight: "150px", overflowY: "auto", padding: "10px 14px", fontSize: "13px", lineHeight: "1.6" }}>
                        <div style={{ display: "grid", gap: "8px" }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                            <span style={{ fontFamily: "monospace", color: "#0f172a", fontWeight: "bold", background: "var(--bg-secondary)", padding: "1px 6px", borderRadius: "3px", fontSize: "11px" }}>00:00</span>
                            <span>Lecture Overview: Institutional framework, historical context, and core thesis.</span>
                          </div>
                          <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                            <span style={{ fontFamily: "monospace", color: "#0f172a", fontWeight: "bold", background: "var(--bg-secondary)", padding: "1px 6px", borderRadius: "3px", fontSize: "11px" }}>04:15</span>
                            <span>Foundational Mechanism: Analytical definitions, mathematical proofs, and model structures.</span>
                          </div>
                          <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                            <span style={{ fontFamily: "monospace", color: "#0f172a", fontWeight: "bold", background: "var(--bg-secondary)", padding: "1px 6px", borderRadius: "3px", fontSize: "11px" }}>12:40</span>
                            <span>Edge Cases &amp; Practical Problem Solving: Algorithmic efficiency and real-world implementations.</span>
                          </div>
                          <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                            <span style={{ fontFamily: "monospace", color: "#0f172a", fontWeight: "bold", background: "var(--bg-secondary)", padding: "1px 6px", borderRadius: "3px", fontSize: "11px" }}>22:10</span>
                            <span>Summary &amp; Synthesis: Preparing for practice exercises and primary source readings.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* OpenTDB Inline Quiz Viewer */}
                {lessonData.type === "quiz" && (
                  <div>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "14px" }}>
                      Answer the questions below to test your knowledge on this module.
                    </p>
                    {lessonData.questions.map((q) => {
                      const answerState = lessonData.userAnswers[q.id];
                      return (
                        <div key={q.id} className="quiz-question-box">
                          <strong style={{ fontSize: "14px" }} dangerouslySetInnerHTML={{ __html: q.question }} />
                          <div className="quiz-options">
                            {q.options.map((opt, idx) => {
                              let optClass = "quiz-option";
                              if (answerState) {
                                if (opt === q.correct) optClass += " correct";
                                else if (answerState.selected === opt) optClass += " incorrect";
                              }
                              return (
                                <button
                                  key={idx}
                                  className={optClass}
                                  disabled={Boolean(answerState)}
                                  onClick={() => handleAnswerSelect(q.id, opt, opt === q.correct)}
                                  dangerouslySetInnerHTML={{ __html: opt }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {quizScore && (
                      <div className="alert-success" style={{ marginTop: "12px" }}>
                        <strong>Quiz Finished!</strong> You scored {quizScore.score} / {quizScore.total} (
                        {Math.round((quizScore.score / quizScore.total) * 100)}%). Result saved to SQLite!
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Content */}
                {lessonData.type === "custom" && (
                  <div className="lesson-body">
                    <p>{lessonData.body || "No text provided."}</p>
                  </div>
                )}

                {/* Progress Toggle Button */}
                <div style={{ marginTop: "28px", paddingTop: "16px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Lesson ID: <code>{activeLesson.id}</code>
                  </span>
                  <button
                    className={`btn ${activeLesson.completed ? "" : "btn-primary"}`}
                    disabled={submittingProgress}
                    onClick={handleToggleComplete}
                  >
                    {submittingProgress
                      ? "Saving..."
                      : activeLesson.completed
                      ? "Completed (Click to Undo)"
                      : "Mark Lesson as Complete"}
                  </button>
                </div>

                {/* Interactive Tools, Notes, AI Assistant & Discussion */}
                <div style={{ marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "18px" }}>
                  <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "16px", overflowX: "auto" }}>
                    <button
                      className={`btn btn-sm ${activeBottomTab === "notes" ? "btn-primary" : ""}`}
                      onClick={() => setActiveBottomTab("notes")}
                    >
                      Timestamped Notes ({lessonNotes.length})
                    </button>
                    <button
                      className={`btn btn-sm ${activeBottomTab === "ai" ? "btn-primary" : ""}`}
                      onClick={() => setActiveBottomTab("ai")}
                    >
                      AI Study Assistant
                    </button>
                    <button
                      className={`btn btn-sm ${activeBottomTab === "discussion" ? "btn-primary" : ""}`}
                      onClick={() => setActiveBottomTab("discussion")}
                    >
                      Lesson Discussion ({lessonDiscussions.length})
                    </button>
                    <button
                      className={`btn btn-sm ${activeBottomTab === "reviews" ? "btn-primary" : ""}`}
                      onClick={() => setActiveBottomTab("reviews")}
                    >
                      Course Reviews ({courseReviews.length})
                    </button>
                  </div>

                  {/* Notes Panel */}
                  {activeBottomTab === "notes" && (
                    <div>
                      <form onSubmit={handleAddNote} style={{ marginBottom: "16px" }}>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                          <input
                            type="text"
                            className="input"
                            style={{ width: "90px" }}
                            placeholder="00:00"
                            value={newNoteTimestamp}
                            onChange={(e) => setNewNoteTimestamp(e.target.value)}
                            title="Video timestamp (mm:ss)"
                          />
                          <input
                            type="text"
                            className="input"
                            style={{ flex: 1 }}
                            placeholder="Add a timestamped concept or takeaway for this lesson..."
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                          />
                          <button type="submit" className="btn btn-primary btn-sm">
                            Save Note
                          </button>
                        </div>
                      </form>

                      {lessonNotes.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                          No notes saved for this lesson yet. Type key ideas or video timestamps above.
                        </p>
                      ) : (
                        <div style={{ display: "grid", gap: "8px" }}>
                          {lessonNotes.map((note) => (
                            <div
                              key={note.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 12px",
                                border: "1px solid var(--border-color)",
                                borderRadius: "6px",
                                background: "var(--bg-secondary)"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span
                                  style={{
                                    fontFamily: "monospace",
                                    fontSize: "12px",
                                    background: "var(--bg-primary)",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    border: "1px solid var(--border-color)",
                                    color: "#0284c7",
                                    fontWeight: "bold"
                                  }}
                                >
                                  {note.timestampLabel || "00:00"}
                                </span>
                                <span style={{ fontSize: "14px" }}>{note.content}</span>
                              </div>
                              <button
                                className="btn btn-sm"
                                style={{ padding: "2px 6px", fontSize: "11px" }}
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Study Assistant Panel */}
                  {activeBottomTab === "ai" && (
                    <div>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                        Intelligent AI companion grounded in this academic module:
                      </p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                        <button className="btn btn-sm" onClick={() => handleAskAi("explain")}>
                          Explain Core Intuition Simply
                        </button>
                        <button className="btn btn-sm" onClick={() => handleAskAi("quiz")}>
                          Generate 3 Checkpoint Questions
                        </button>
                        <button className="btn btn-sm" onClick={() => handleAskAi("summary")}>
                          Executive Summary & Key Milestones
                        </button>
                      </div>

                      {aiLoading && <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Analyzing lesson material...</p>}

                      {aiOutput && (
                        <div style={{ padding: "14px", border: "1px solid #bae6fd", background: "#f0f9ff", borderRadius: "8px" }}>
                          <h4 style={{ color: "#0369a1", fontSize: "14px", marginBottom: "6px" }}>{aiOutput.title}</h4>
                          <p style={{ fontSize: "13px", color: "#334155", whiteSpace: "pre-line", lineHeight: "1.6" }}>
                            {aiOutput.body}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discussions Panel */}
                  {activeBottomTab === "discussion" && (
                    <div>
                      <form onSubmit={handleAddDiscussion} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                        <input
                          type="text"
                          className="input"
                          style={{ flex: 1 }}
                          placeholder="Ask a question or share insight with fellow scholars..."
                          value={newDiscussionContent}
                          onChange={(e) => setNewDiscussionContent(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary btn-sm">
                          Post
                        </button>
                      </form>

                      {lessonDiscussions.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                          No discussions yet for this lesson. Start the conversation!
                        </p>
                      ) : (
                        <div style={{ display: "grid", gap: "10px" }}>
                          {lessonDiscussions.map((d) => (
                            <div
                              key={d.id}
                              style={{
                                padding: "10px 12px",
                                border: "1px solid var(--border-color)",
                                borderRadius: "6px",
                                background: "var(--bg-secondary)"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                                <span><strong>{d.authorName}</strong> ({d.authorRole})</span>
                                <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p style={{ fontSize: "13px", margin: 0 }}>{d.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Course Reviews Panel */}
                  {activeBottomTab === "reviews" && (
                    <div>
                      <form onSubmit={handleAddReview} style={{ marginBottom: "16px", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "6px", background: "var(--bg-secondary)" }}>
                        <h4 style={{ fontSize: "13px", marginBottom: "8px" }}>Leave an Academic Review</h4>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13px" }}>Rating:</span>
                          <select className="select" value={newReviewRating} onChange={(e) => setNewReviewRating(Number(e.target.value))}>
                            <option value="5">5 / 5 - Exceptional</option>
                            <option value="4">4 / 5 - Very Good</option>
                            <option value="3">3 / 5 - Good</option>
                            <option value="2">2 / 5 - Fair</option>
                            <option value="1">1 / 5 - Needs Improvement</option>
                          </select>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input
                            type="text"
                            className="input"
                            style={{ flex: 1 }}
                            placeholder="Share your feedback about the course curriculum and difficulty..."
                            value={newReviewComment}
                            onChange={(e) => setNewReviewComment(e.target.value)}
                          />
                          <button type="submit" className="btn btn-primary btn-sm">
                            Submit Review
                          </button>
                        </div>
                      </form>

                      {courseReviews.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                          No reviews posted yet for this course. Be the first to review!
                        </p>
                      ) : (
                        <div style={{ display: "grid", gap: "10px" }}>
                          {courseReviews.map((r) => (
                            <div
                              key={r.id}
                              style={{
                                padding: "10px 12px",
                                border: "1px solid var(--border-color)",
                                borderRadius: "6px"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                <span><strong>{r.reviewerName}</strong> &bull; Rating: {r.rating} / 5</span>
                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>{r.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // CATALOG VIEW
  return (
    <div>
      <div className="section-header">
        <h1>Structured Course Curriculum &amp; Video Catalog</h1>
        <p>
          Organized academic curricula populated with real YouTube lecture series (CS50, CrashCourse, 3Blue1Brown, Khan Academy, MIT OCW),
          live Wikipedia REST articles, Project Gutenberg public-domain texts, REST Countries civic datasets, and interactive OpenTDB quizzes.
        </p>
      </div>

      {/* Open edX & MOOC Resource Callout */}
      <div className="reader-box" style={{ background: "var(--bg-secondary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span className="card-tag" style={{ background: "#ffffff" }}>Open edX &amp; University OER Guide</span>
            <h3 style={{ fontSize: "15px", margin: "4px 0" }}>
              Looking for Open edX Course Packages &amp; University APIs?
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              edX.org operates as a closed commercial site, but <strong>Open edX</strong>, <strong>MIT OpenCourseWare</strong>, and <strong>HarvardX</strong> publish free open course repositories (OLX) and REST APIs.
            </p>
          </div>
          <button className="btn btn-sm" onClick={() => setShowEdxGuide(!showEdxGuide)}>
            {showEdxGuide ? "Hide edX Guide ▲" : "View Open edX APIs & Repositories ▼"}
          </button>
        </div>

        {showEdxGuide && (
          <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Platform / Repository</th>
                  <th>How to Access Materials &amp; API</th>
                  <th>Direct Link</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Open edX Official REST API</strong></td>
                  <td>
                    Available on any self-hosted Open edX instance:
                    <br />
                    <code>GET /api/courses/v1/courses/</code>
                    <br />
                    <code>GET /api/courses/v1/blocks/?course_id=&#123;id&#125;&amp;depth=all</code>
                  </td>
                  <td>
                    <a href="https://docs.openedx.org" target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                      Open edX Docs &nearr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td><strong>edX / HarvardX Open Course Repositories (OLX)</strong></td>
                  <td>
                    Free Open Learning XML (OLX) course packages containing videos, HTML units, and problem sets:
                    <br />
                    <code>github.com/edx/edx-demo-course</code>
                  </td>
                  <td>
                    <a href="https://github.com/edx/edx-demo-course" target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                      GitHub Course Repos &nearr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td><strong>MIT OpenCourseWare (OCW) API</strong></td>
                  <td>
                    MIT's entire open curriculum, syllabi, lecture videos, and problem sets:
                    <br />
                    <code>GET https://ocw.mit.edu/api/v1/courses/</code>
                  </td>
                  <td>
                    <a href="https://ocw.mit.edu" target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                      MIT OCW Portal &nearr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td><strong>OpenStax Peer-Reviewed Textbooks API</strong></td>
                  <td>
                    Rice University's free college textbooks via REST API:
                    <br />
                    <code>GET https://openstax.org/api/v2/pages/?type=books.Book</code>
                  </td>
                  <td>
                    <a href="https://openstax.org" target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                      OpenStax Books &nearr;
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coursera-style Modal */}
      {selectedOverviewCourse && (
        <CourseOverviewModal
          course={selectedOverviewCourse}
          onClose={() => setSelectedOverviewCourse(null)}
          onStartCourse={(id) => openCourse(id)}
          onEnroll={handleEnroll}
          onClaimCert={handleClaimCertificate}
        />
      )}

      {/* Coursera Mode Switcher: Courses vs Specializations */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
        <button
          className={`btn ${catalogTab === "courses" ? "btn-primary" : ""}`}
          onClick={() => setCatalogTab("courses")}
          style={{ fontSize: "14px", fontWeight: 600 }}
        >
          University Courses ({courses.length})
        </button>
        <button
          className={`btn ${catalogTab === "specializations" ? "btn-primary" : ""}`}
          onClick={() => setCatalogTab("specializations")}
          style={{ fontSize: "14px", fontWeight: 600 }}
        >
          Multi-Course Specializations ({SPECIALIZATIONS.length})
        </button>
      </div>

      {catalogTab === "specializations" ? (
        <div>
          <div style={{ marginBottom: "18px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px" }}>
              Academic Specializations &amp; Professional Series
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
              Curated sequences of 2–4 interconnected university courses designed to build mastery in a core academic discipline.
            </p>
          </div>

          <div className="grid">
            {SPECIALIZATIONS.map((spec) => (
              <div key={spec.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.5px", marginBottom: "6px" }}>
                    {spec.institution}
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 8px", lineHeight: "1.3" }}>
                    {spec.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 14px", lineHeight: "1.5" }}>
                    {spec.description}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>
                    <span style={{ color: "#d97706", fontWeight: 700 }}>Rating: {spec.rating} / 5.0</span>
                    <span style={{ color: "var(--text-muted)" }}>({spec.reviewsCount.toLocaleString()} ratings)</span>
                    <span>&bull;</span>
                    <span>{spec.duration}</span>
                  </div>

                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                    Courses in this Specialization ({spec.courseIds.length}):
                  </div>
                  <div style={{ display: "grid", gap: "6px", marginBottom: "16px" }}>
                    {spec.courseIds.map((cId, idx) => {
                      const matched = courses.find((c) => c.id === cId);
                      return (
                        <div
                          key={cId}
                          onClick={() => {
                            if (matched) setSelectedOverviewCourse(matched);
                          }}
                          style={{
                            padding: "6px 10px",
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "5px",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <span>
                            <strong>Course {idx + 1}:</strong> {matched?.title || cId}
                          </span>
                          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>&rarr;</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                    {spec.skills.map((s, i) => (
                      <span key={i} className="card-tag" style={{ margin: 0, fontSize: "11px" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="card-meta" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Specialization Certificate</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const firstCourse = courses.find((c) => c.id === spec.courseIds[0]);
                      if (firstCourse) {
                        setSelectedOverviewCourse(firstCourse);
                      }
                    }}
                  >
                    View First Course &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "16px" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm ${selectedCategory === cat ? "btn-primary" : ""}`}
                style={{ whiteSpace: "nowrap" }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} {cat === "All" ? `(${courses.length})` : ""}
              </button>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="toolbar">
            <input
              type="text"
              className="input"
              placeholder="Search by course title, university, topic (e.g., Harvard, Python, Neural Networks, Calculus)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="select"
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
            >
              {[
                "All Institutions",
                "Harvard University (CS50)",
                "Massachusetts Institute of Technology (MIT)",
                "Stanford University (Stanford AI)",
                "University of Oxford",
                "University of Cambridge",
                "Yale University",
                "UC Berkeley (EECS)",
                "California Institute of Technology (Caltech)",
                "Princeton University",
                "Columbia University",
                "London School of Economics (LSE)",
                "Georgetown University (SFS)",
                "University of Edinburgh"
              ].map((inst, i) => (
                <option key={i} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            {(searchTerm || selectedCategory !== "All" || selectedInstitution !== "All Institutions" || selectedDifficulty !== "All") && (
              <button
                className="btn btn-sm"
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedInstitution("All Institutions");
                  setSearchTerm("");
                  setSelectedDifficulty("All");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Showing <strong>{filteredCourses.length}</strong> of {courses.length} courses
          </div>

          {/* Courses Grid with Coursera-Style Cards */}
          <div className="grid">
            {filteredCourses.map((course) => {
              const meta = getCourseDetails(course);
              return (
                <div key={course.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    {/* Coursera-style Institutional Partner Header */}
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                      {course.institution || "OpenLearn Faculty"}
                    </div>

                    <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 8px", lineHeight: "1.35", color: "var(--text-primary)" }}>
                      {course.title}
                    </h3>

                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 12px", lineHeight: "1.5" }}>
                      {course.description}
                    </p>

                    {/* Skills pills */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                      {meta.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="card-tag" style={{ margin: 0, fontSize: "11px", background: "var(--bg-secondary)" }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Rating & Social Proof */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      <span style={{ color: "#d97706", fontWeight: 700 }}>Rating: {meta.rating} / 5.0</span>
                      <span style={{ color: "var(--text-muted)" }}>({meta.reviewsCount})</span>
                      <span>&bull;</span>
                      <span>{course.difficulty}</span>
                    </div>

                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>
                      Shareable Certificate &bull; 100% Online &bull; Flexible Schedule
                    </div>

                    {course.isEnrolled && (
                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span>{course.completedLessons} of {course.totalLessons} lessons completed</span>
                          <span>{course.progressPercent}%</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${course.progressPercent}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card-meta" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => setSelectedOverviewCourse(course)}
                      title="View Coursera-style syllabus, weekly outline and learning outcomes"
                    >
                      Syllabus Details
                    </button>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {!course.isEnrolled && (
                        <button className="btn btn-sm" onClick={() => handleEnroll(course.id)}>
                          Enroll
                        </button>
                      )}
                      <button className="btn btn-primary btn-sm" onClick={() => openCourse(course.id)}>
                        {course.isEnrolled ? "Study &rarr;" : "Start &rarr;"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
