import React, { useState, useEffect } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import CourseOverviewModal from "./CourseOverviewModal";
import { getCourseDetails } from "../data/courseraMetadata";

const CATEGORIES = [
  "All",
  "Computer Science & AI",
  "Mathematics",
  "Natural Sciences",
  "World History & Civics",
  "Economics & Finance",
  "Philosophy & Literature"
];

const FEATURED_VIDEOS = [
  {
    title: "Introduction to Computational Thinking (CS50)",
    instructor: "David J. Malan, Harvard University",
    youtubeId: "jjqgP9dpD1k",
    tag: "Harvard University"
  },
  {
    title: "But what is a Neural Network? (Deep Learning)",
    instructor: "Grant Sanderson, 3Blue1Brown / Stanford AI",
    youtubeId: "aircAruvnKk",
    tag: "Stanford AI"
  },
  {
    title: "The Essence of Calculus: Geometric Intuition",
    instructor: "Grant Sanderson, 3Blue1Brown / Princeton Math",
    youtubeId: "WUvTyaaNkzM",
    tag: "Princeton Math"
  },
  {
    title: "Introduction to Astronomy & Deep Space",
    instructor: "Phil Plait, Caltech / CrashCourse Astronomy",
    youtubeId: "0rHUDWjR5gg",
    tag: "Caltech Astronomy"
  }
];

const INSTITUTION_LIST = [
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
];

export default function LandingPage({ onGoToAuth, onSelectCourse, onGoToDashboard }) {
  const { user, login } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedInstitution, setSelectedInstitution] = useState("All Institutions");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedOverviewCourse, setSelectedOverviewCourse] = useState(null);
  const [activePreviewCourse, setActivePreviewCourse] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [demoLoggingIn, setDemoLoggingIn] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);
    try {
      const data = await apiRequest("/api/courses");
      setCourses(data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(email) {
    setDemoLoggingIn(true);
    try {
      await login(email, "password123");
    } catch (err) {
      alert("Demo login error: " + err.message);
    } finally {
      setDemoLoggingIn(false);
    }
  }

  async function handlePreviewCourse(courseId) {
    setPreviewLoading(true);
    try {
      const data = await apiRequest(`/api/courses/${courseId}`);
      setActivePreviewCourse(data.course);
    } catch (err) {
      alert("Failed to load course details: " + err.message);
    } finally {
      setPreviewLoading(false);
    }
  }

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

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", color: "var(--text-primary)" }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          borderBottom: "1px solid var(--border-color)",
          padding: "14px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          background: "#ffffff",
          zIndex: 100
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="brand-logo" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
            OL
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "-0.01em" }}>OpenLearn LMS</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>
              Free Open Educational Resources &amp; University Curricula
            </span>
          </div>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a href="#courses" className="btn btn-sm" style={{ border: "none", background: "transparent" }}>
            Courses Catalog
          </a>
          <a href="#schools" className="btn btn-sm" style={{ border: "none", background: "transparent" }}>
            Universities &amp; Schools
          </a>
          <a href="#videos" className="btn btn-sm" style={{ border: "none", background: "transparent" }}>
            Video Lectures
          </a>
          <a href="#apis" className="btn btn-sm" style={{ border: "none", background: "transparent" }}>
            Open edX &amp; OER APIs
          </a>

          {user ? (
            <button className="btn btn-primary btn-sm" onClick={onGoToDashboard}>
              Go to My Dashboard &rarr;
            </button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn btn-sm"
                onClick={() => handleDemoLogin("learner@openlearn.org")}
                disabled={demoLoggingIn}
              >
                1-Click Demo
              </button>
              <button className="btn btn-sm" onClick={() => onGoToAuth("login")}>
                Sign In
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => onGoToAuth("register")}>
                Join Free
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "54px 24px 30px",
          textAlign: "center"
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "99px",
            border: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            marginBottom: "16px"
          }}
        >
          100% Free • Open Learning XML (OLX) • Sourced from World-Class Universities • Zero Paywalls
        </div>

        <h1
          style={{
            fontSize: "44px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            maxWidth: "840px",
            margin: "0 auto 16px"
          }}
        >
          University-Grade Education, Powered by Open-Source APIs
        </h1>

        <p
          style={{
            fontSize: "17px",
            color: "var(--text-secondary)",
            maxWidth: "760px",
            margin: "0 auto 28px",
            lineHeight: 1.6
          }}
        >
          Explore <strong>16 structured university courses</strong> sourced from <strong>Harvard, MIT, Stanford, Oxford, Cambridge, Yale, Caltech, and Princeton</strong>—containing <strong>94 video modules</strong>,
          peer-reviewed encyclopedias from Wikipedia REST v1, over 70,000 classics from Project Gutenberg,
          and interactive assessments from the Open Trivia Database.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginBottom: "36px" }}>
          <a href="#courses" className="btn btn-primary" style={{ padding: "11px 24px", fontSize: "15px" }}>
            Explore All 16 Courses &rarr;
          </a>
          <button
            className="btn"
            style={{ padding: "11px 20px", fontSize: "15px" }}
            onClick={() => handleDemoLogin("learner@openlearn.org")}
            disabled={demoLoggingIn}
          >
            {demoLoggingIn ? "Logging in..." : "Launch Instant Demo Learner"}
          </button>
          <button
            className="btn"
            style={{ padding: "11px 20px", fontSize: "15px" }}
            onClick={() => handleDemoLogin("instructor@openlearn.org")}
            disabled={demoLoggingIn}
          >
            Instructor Studio Preview
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            maxWidth: "960px",
            margin: "0 auto 32px",
            textAlign: "left"
          }}
        >
          <div className="stat-card">
            <div className="stat-label">Full Courses</div>
            <div className="stat-value">{courses.length || 16}</div>
            <div className="stat-sub">Across 6 academic fields</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Learning Modules</div>
            <div className="stat-value">94</div>
            <div className="stat-sub">Videos, texts &amp; quizzes</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Public Domain Books</div>
            <div className="stat-value">70,000+</div>
            <div className="stat-sub">Project Gutenberg (Gutendex)</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Sovereign Nations</div>
            <div className="stat-value">250</div>
            <div className="stat-sub">REST Countries v3.1</div>
          </div>
        </div>
      </section>

      {/* Sourced Universities & Schools Banner */}
      <section
        id="schools"
        style={{
          borderTop: "1px solid var(--border-color)",
          borderBottom: "1px solid var(--border-color)",
          background: "var(--bg-secondary)",
          padding: "24px 24px"
        }}
      >
        <div style={{ maxWidth: "1160px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-muted)", marginBottom: "12px" }}>
            Curricula &amp; Materials Sourced From Leading Global Institutions
          </div>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px" }}>
            {[
              "Harvard University (CS50)",
              "Massachusetts Institute of Technology (MIT)",
              "Stanford University",
              "University of Oxford",
              "University of Cambridge",
              "Yale University",
              "UC Berkeley",
              "Caltech",
              "Princeton University",
              "Columbia University",
              "London School of Economics (LSE)",
              "Georgetown University"
            ].map((school, i) => (
              <span
                key={i}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: "6px",
                  background: "#ffffff",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)"
                }}
              >
                {school}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Video Series Section */}
      <section id="videos" style={{ padding: "48px 24px" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div style={{ marginBottom: "24px" }}>
            <span className="card-tag">Featured Video Curricula</span>
            <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0" }}>
              High-Caliber Video Lectures from World-Class Educators
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Embedded seamlessly into structured courses with follow-up readings, Wikipedia analyses, and quizzes.
            </p>
          </div>

          <div className="grid">
            {FEATURED_VIDEOS.map((vid, idx) => (
              <div key={idx} className="card" style={{ background: "#ffffff" }}>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "6px", marginBottom: "12px", border: "1px solid var(--border-color)" }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${vid.youtubeId}`}
                    title={vid.title}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                    allowFullScreen
                  />
                </div>
                <span className="card-tag">{vid.tag}</span>
                <h3 style={{ fontSize: "15px", marginBottom: "4px" }}>{vid.title}</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  By {vid.instructor}
                </p>
                <div className="card-meta">
                  <span>Part of Structured Course</span>
                  <a href="#courses" className="btn btn-sm btn-primary">
                    View Course
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Course Catalog Section */}
      <section id="courses" style={{ borderTop: "1px solid var(--border-color)", maxWidth: "1160px", margin: "0 auto", padding: "48px 24px" }}>
        <div className="section-header">
          <span className="card-tag">Curriculum Catalog</span>
          <h1>Explore All 16 Structured Academic Courses</h1>
          <p>
            Filter by academic discipline, institution/school, difficulty, or search for any subject to preview the full syllabus and learning materials.
          </p>
        </div>

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "16px" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${selectedCategory === cat ? "btn-primary" : ""}`}
              style={{ whiteSpace: "nowrap" }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Institution & Difficulty Filter */}
        <div className="toolbar">
          <input
            type="text"
            className="input"
            placeholder="Search by course title, university, author, or keyword (e.g., Harvard, Python, Neural Networks, Einstein, Calculus)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="select"
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
          >
            {INSTITUTION_LIST.map((inst, i) => (
              <option key={i} value={inst}>
                {inst}
              </option>
            ))}
          </select>
          <select className="select" value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
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
          Showing <strong>{filteredCourses.length}</strong> available courses
        </div>

        {/* Course Cards Grid */}
        <div className="grid">
          {filteredCourses.map((c) => {
            const meta = getCourseDetails(c);
            return (
              <div key={c.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                    {c.institution || "Open Educational Resources Consortium"}
                  </div>

                  <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 8px", lineHeight: "1.35", color: "var(--text-primary)" }}>
                    {c.title}
                  </h3>

                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 12px", lineHeight: "1.5" }}>
                    {c.description}
                  </p>

                  {/* Skills badges */}
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
                    <span>{meta.studentsEnrolled} enrolled</span>
                  </div>

                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>
                    Shareable Certificate &bull; 100% Online &bull; Flexible Schedule
                  </div>
                </div>

                <div className="card-meta" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => setSelectedOverviewCourse(c)}
                    title="View syllabus, weekly modules and learning outcomes"
                  >
                    Syllabus Details
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onSelectCourse(c.id)}
                  >
                    {user ? "Study Course &rarr;" : "Enroll & Start &rarr;"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Coursera-style Syllabus & Overview Modal */}
      {selectedOverviewCourse && (
        <CourseOverviewModal
          course={selectedOverviewCourse}
          onClose={() => setSelectedOverviewCourse(null)}
          onStartCourse={(id) => onSelectCourse(id)}
          onEnroll={(id) => onSelectCourse(id)}
        />
      )}

      {/* Open Educational Resource (OER) & Open edX Guide Section */}
      <section id="apis" style={{ borderTop: "1px solid var(--border-color)", padding: "48px 24px", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div className="section-header">
            <span className="card-tag">Open Architecture</span>
            <h2>Integrated Public APIs &amp; MOOC Repositories</h2>
            <p>
              OpenLearn pulls from public educational data layers. Here are the live services and repositories that make this possible:
            </p>
          </div>

          <div className="grid">
            <div className="card" style={{ background: "#ffffff" }}>
              <div>
                <span className="card-tag">Open edX &amp; MIT OCW</span>
                <h3>Open edX &amp; MIT Course Repositories</h3>
                <p>
                  Access university MOOC packages in Open Learning XML (OLX) format from edX and MIT OpenCourseWare via GitHub and public REST endpoints.
                </p>
              </div>
              <div className="card-meta">
                <span><code>/api/courses/v1/courses/</code></span>
                <a href="https://github.com/edx/edx-demo-course" target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                  View OLX &nearr;
                </a>
              </div>
            </div>

            <div className="card" style={{ background: "#ffffff" }}>
              <div>
                <span className="card-tag">Project Gutenberg</span>
                <h3>Gutendex Public Domain E-Books</h3>
                <p>
                  Direct access to 70,000+ free digital books by Aristotle, Plato, Shakespeare, Darwin, and Einstein with full HTML and EPUB downloads.
                </p>
              </div>
              <div className="card-meta">
                <span><code>https://gutendex.com/books</code></span>
                <a href="https://gutendex.com" target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                  Gutendex API &nearr;
                </a>
              </div>
            </div>

            <div className="card" style={{ background: "#ffffff" }}>
              <div>
                <span className="card-tag">Wikipedia &amp; MediaWiki</span>
                <h3>MediaWiki REST v1 Articles</h3>
                <p>
                  Clean JSON endpoints for summaries, thumbnails, and full-text academic encyclopedic extracts with native CORS support.
                </p>
              </div>
              <div className="card-meta">
                <span><code>/api/rest_v1/page/summary/</code></span>
                <a href="https://en.wikipedia.org/api/rest_v1/" target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                  Wiki API &nearr;
                </a>
              </div>
            </div>

            <div className="card" style={{ background: "#ffffff" }}>
              <div>
                <span className="card-tag">REST Countries</span>
                <h3>REST Countries v3.1 Civic API</h3>
                <p>
                  Geopolitical, demographic, economic, and geographic data for all 250 sovereign states and territories.
                </p>
              </div>
              <div className="card-meta">
                <span><code>/v3.1/all?fields=name,capital</code></span>
                <a href="https://restcountries.com" target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                  Country API &nearr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-color)",
          padding: "32px 24px",
          textAlign: "center",
          fontSize: "13px",
          color: "var(--text-muted)"
        }}
      >
        <div style={{ maxWidth: "1160px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <strong>OpenLearn LMS</strong> • 100% Free Open Educational Resources (OER) Platform
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-sm" onClick={() => handleDemoLogin("learner@openlearn.org")}>
              Demo Learner
            </button>
            <button className="btn btn-sm" onClick={() => handleDemoLogin("instructor@openlearn.org")}>
              Demo Instructor
            </button>
            <button className="btn btn-primary btn-sm" onClick={onGoToAuth}>
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
