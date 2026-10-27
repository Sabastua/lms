import React, { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import CertificateModal from "./CertificateModal";

export default function DashboardView({ onOpenCourse, onNavigateTab }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCert, setSelectedCert] = useState(null);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/dashboard");
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleRemoveBookmark(bookmarkId) {
    try {
      await apiRequest(`/api/bookmarks/${bookmarkId}`, { method: "DELETE" });
      loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return <p style={{ color: "var(--text-muted)" }}>Loading your learning dashboard from SQLite...</p>;
  }

  if (error) {
    return <div className="alert-error">{error}</div>;
  }

  if (!dashboard) return null;

  const { user, stats, enrolledCourses = [], recentQuizAttempts = [], bookmarks = [], certificates = [], instructorStats } = dashboard;

  return (
    <div>
      {selectedCert && (
        <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
      )}

      <div className="section-header">
        <h1>Welcome back, {user.name}</h1>
        <p>
          {user.bio || "Track your enrolled OER courses, completed lessons, quiz performance, and saved study materials."}
        </p>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <div className="stat-card">
          <div className="stat-label">Enrolled Courses</div>
          <div className="stat-value">{stats.enrolledCoursesCount}</div>
          <div className="stat-sub">Active tracks</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed Lessons</div>
          <div className="stat-value">{stats.completedLessonsTotal}</div>
          <div className="stat-sub">Across all courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Quiz</div>
          <div className="stat-value">{stats.averageQuizPercent}%</div>
          <div className="stat-sub">{stats.quizzesTakenCount} completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Certificates</div>
          <div className="stat-value" style={{ color: "#0284c7" }}>{stats.certificatesCount || 0}</div>
          <div className="stat-sub">Verified credentials</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Saved Bookmarks</div>
          <div className="stat-value">{stats.bookmarksCount}</div>
          <div className="stat-sub">OER library</div>
        </div>
      </div>

      {/* Instructor Banner if role === 'instructor' */}
      {instructorStats && (
        <div className="reader-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="card-tag">Instructor Studio Summary</span>
            <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>
              You have authored {instructorStats.authoredCoursesCount} courses with {instructorStats.totalStudentEnrollments} total learner enrollments
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Build new courses or attach live Wikipedia, Project Gutenberg, REST Countries, and OpenTDB quiz modules.
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigateTab("studio")}>
            Open Instructor Studio &rarr;
          </button>
        </div>
      )}

      {/* Enrolled Courses Section */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600 }}>My Enrolled Courses</h2>
          <button className="btn btn-sm" onClick={() => onNavigateTab("courses")}>
            Browse All Courses &rarr;
          </button>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="reader-box">
            <p style={{ marginBottom: "12px", color: "var(--text-secondary)" }}>
              You have not enrolled in any courses yet. Explore the catalog to start learning!
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigateTab("courses")}>
              Explore Course Catalog
            </button>
          </div>
        ) : (
          <div className="grid">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="card">
                <div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <span className="card-tag">{course.category} • {course.difficulty}</span>
                    {course.institution && (
                      <span className="card-tag" style={{ background: "var(--bg-secondary)" }}>
                        {course.institution}
                      </span>
                    )}
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                    <span>{course.completedLessons} of {course.totalLessons} lessons completed</span>
                    <span>{course.progressPercent}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${course.progressPercent}%` }} />
                  </div>
                </div>
                <div className="card-meta" style={{ marginTop: "12px" }}>
                  <span>By {course.instructorName || "OpenLearn Faculty"}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {course.progressPercent === 100 && (
                      <button
                        className="btn btn-sm"
                        style={{ background: "#f0f9ff", color: "#0284c7", borderColor: "#bae6fd" }}
                        onClick={() => onOpenCourse(course.id)}
                      >
                        View Certificate
                      </button>
                    )}
                    <button className="btn btn-primary btn-sm" onClick={() => onOpenCourse(course.id)}>
                      Continue &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Earned Certificates Section */}
      {certificates.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600 }}>My Earned Academic Certificates ({certificates.length})</h2>
          </div>
          <div className="grid">
            {certificates.map((cert) => (
              <div key={cert.id} className="card" style={{ border: "2px solid #bae6fd", background: "#f0f9ff" }}>
                <div>
                  <span className="card-tag" style={{ background: "#ffffff", color: "#0369a1", fontWeight: 700 }}>
                    VERIFIED CREDENTIAL
                  </span>
                  <h3 style={{ marginTop: "8px", color: "#0c4a6e" }}>{cert.courseTitle}</h3>
                  <p style={{ color: "#334155", fontSize: "13px" }}>
                    Awarded by <strong>{cert.institution}</strong> on {cert.issueDate}
                  </p>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px" }}>
                    Hash: <code>{cert.verificationHash}</code>
                  </div>
                </div>
                <div className="card-meta" style={{ marginTop: "14px" }}>
                  <span style={{ fontSize: "11px", color: "#0284c7" }}>ID: {cert.id}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelectedCert(cert)}>
                    View / Print Diploma &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Two Columns: Recent Quiz Attempts & Saved Bookmarks */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}>
        <div className="reader-box" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ fontSize: "16px" }}>Recent Quiz Attempts</h3>
            <button className="btn btn-sm" onClick={() => onNavigateTab("quizzes")}>
              Take a Quiz
            </button>
          </div>
          {recentQuizAttempts.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              No quiz attempts recorded yet. Complete a course quiz or visit the Practice Quizzes tab.
            </p>
          ) : (
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Subject / Category</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentQuizAttempts.map((q) => (
                  <tr key={q.id}>
                    <td>{q.categoryName}</td>
                    <td>
                      <strong>{q.score} / {q.totalQuestions}</strong> ({Math.round((q.score / q.totalQuestions) * 100)}%)
                    </td>
                    <td>{new Date(q.attemptedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="reader-box" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ fontSize: "16px" }}>Saved OER Bookmarks</h3>
            <button className="btn btn-sm" onClick={() => onNavigateTab("wikipedia")}>
              Explore OER
            </button>
          </div>
          {bookmarks.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Bookmark Wikipedia articles, Project Gutenberg books, or Country fact sheets to access them quickly here.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              {bookmarks.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px"
                  }}
                >
                  <div>
                    <span className="card-tag" style={{ marginBottom: "2px" }}>{b.resourceType.toUpperCase()}</span>
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>{b.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Ref: {b.sourceRef}</div>
                  </div>
                  <button className="btn btn-sm" onClick={() => handleRemoveBookmark(b.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
