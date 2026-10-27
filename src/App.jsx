import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./components/LandingPage";
import AuthView from "./components/AuthView";
import DashboardView from "./components/DashboardView";
import CoursesView from "./components/CoursesView";
import WikipediaView from "./components/WikipediaView";
import GutenbergView from "./components/GutenbergView";
import CountriesView from "./components/CountriesView";
import QuizzesView from "./components/QuizzesView";
import StudioView from "./components/StudioView";
import UniversalSearchModal from "./components/UniversalSearchModal";
import ProfileModal from "./components/ProfileModal";
import { apiRequest } from "./api/client";

const TAB_LABELS = {
  landing: "Public Course Catalog & Showcase",
  dashboard: "My Learning Dashboard",
  courses: "Course Catalog & Player",
  wikipedia: "Wikipedia OER Encyclopedia",
  gutenberg: "Project Gutenberg Library",
  countries: "Geography & Civics Lab",
  quizzes: "Interactive Assessments",
  studio: "Instructor Studio & API Docs"
};

export default function App() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Universal Search & Themes
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem("openlearn_theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("openlearn_theme", theme);
  }, [theme]);

  // Load catalog courses on mount for instant universal search & target previews
  useEffect(() => {
    apiRequest("/api/courses")
      .then((data) => setCatalogCourses(data.courses || []))
      .catch(console.error);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function cycleTheme() {
    if (theme === "light") setTheme("sepia");
    else if (theme === "sepia") setTheme("dark");
    else setTheme("light");
  }

  function handleNavigateFromSearch(targetTab, param) {
    if (targetTab === "courses") {
      setSelectedCourseId(param);
      setActiveTab("courses");
    } else {
      setActiveTab(targetTab);
    }
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p style={{ color: "var(--text-muted)" }}>Connecting to OpenLearn SQLite backend...</p>
      </div>
    );
  }

  // If user is not logged in
  if (!user) {
    if (showAuthModal) {
      return (
        <AuthView
          initialMode={authMode}
          targetCourse={catalogCourses.find((c) => c.id === selectedCourseId)}
          onBackToLanding={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            if (selectedCourseId) {
              setActiveTab("courses");
            } else {
              setActiveTab("dashboard");
            }
          }}
        />
      );
    }
    return (
      <LandingPage
        onGoToAuth={(mode = "login") => {
          setAuthMode(mode);
          setShowAuthModal(true);
        }}
        onSelectCourse={(courseId) => {
          setSelectedCourseId(courseId);
          setAuthMode("login");
          setShowAuthModal(true);
        }}
        onGoToDashboard={() => {
          setAuthMode("login");
          setShowAuthModal(true);
        }}
      />
    );
  }

  function handleOpenCourse(courseId) {
    setSelectedCourseId(courseId);
    setActiveTab("courses");
  }

  // If user is logged in and chose to view the Public Landing Page
  if (activeTab === "landing") {
    return (
      <div>
        <div
          style={{
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-color)",
            padding: "8px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px"
          }}
        >
          <span>
            Signed in as <strong>{user.name}</strong> ({user.role})
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab("dashboard")}>
            &larr; Return to My Learning Workspace
          </button>
        </div>
        <LandingPage
          onGoToAuth={() => setActiveTab("dashboard")}
          onSelectCourse={(courseId) => {
            setSelectedCourseId(courseId);
            setActiveTab("courses");
          }}
          onGoToDashboard={() => setActiveTab("dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">OL</div>
          <div>
            <span className="brand-title">OpenLearn LMS</span>
            <span className="brand-subtitle">React + Vite • SQLite</span>
          </div>
        </div>

        <div className="nav-section-label">Learner Workspace</div>
        <ul className="nav-list">
          <li>
            <button
              className={`nav-item ${activeTab === "landing" ? "active" : ""}`}
              onClick={() => setActiveTab("landing")}
            >
              <span>Explore Landing Page</span>
              <span className="nav-badge">Public</span>
            </button>
          </li>
          <li>
            <button
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => {
                setSelectedCourseId(null);
                setActiveTab("dashboard");
              }}
            >
              <span>My Dashboard</span>
              <span className="nav-badge">Home</span>
            </button>
          </li>
          <li>
            <button
              className={`nav-item ${activeTab === "courses" ? "active" : ""}`}
              onClick={() => setActiveTab("courses")}
            >
              <span>Structured Courses</span>
              <span className="nav-badge">16</span>
            </button>
          </li>
          <li>
            <button
              className={`nav-item ${activeTab === "wikipedia" ? "active" : ""}`}
              onClick={() => {
                setSelectedCourseId(null);
                setActiveTab("wikipedia");
              }}
            >
              <span>Wikipedia Articles</span>
              <span className="nav-badge">REST v1</span>
            </button>
          </li>
          <li>
            <button
              className={`nav-item ${activeTab === "gutenberg" ? "active" : ""}`}
              onClick={() => {
                setSelectedCourseId(null);
                setActiveTab("gutenberg");
              }}
            >
              <span>Gutenberg Books</span>
              <span className="nav-badge">Gutendex</span>
            </button>
          </li>
          <li>
            <button
              className={`nav-item ${activeTab === "countries" ? "active" : ""}`}
              onClick={() => {
                setSelectedCourseId(null);
                setActiveTab("countries");
              }}
            >
              <span>Geography &amp; Civics</span>
              <span className="nav-badge">v3.1</span>
            </button>
          </li>
          <li>
            <button
              className={`nav-item ${activeTab === "quizzes" ? "active" : ""}`}
              onClick={() => {
                setSelectedCourseId(null);
                setActiveTab("quizzes");
              }}
            >
              <span>Practice Quizzes</span>
              <span className="nav-badge">OpenTDB</span>
            </button>
          </li>
          <li>
            <button
              className={`nav-item ${activeTab === "studio" ? "active" : ""}`}
              onClick={() => {
                setSelectedCourseId(null);
                setActiveTab("studio");
              }}
            >
              <span>{user.role === "instructor" ? "Instructor Studio" : "API Docs & Schema"}</span>
              <span className="nav-badge">{user.role === "instructor" ? "CMS" : "API"}</span>
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
                {user.email}
              </div>
            </div>
            <button
              className="btn btn-sm"
              style={{ padding: "3px 8px", fontSize: "11px" }}
              title="Edit Profile Settings"
              onClick={() => setIsProfileOpen(true)}
            >
              Edit
            </button>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className="btn btn-sm"
              style={{ flex: 1 }}
              onClick={() => setIsProfileOpen(true)}
            >
              Profile
            </button>
            <button
              className="btn btn-sm"
              style={{ flex: 1, color: "var(--danger)" }}
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-title">{TAB_LABELS[activeTab] || "OpenLearn LMS"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              className="btn btn-sm"
              onClick={() => setIsSearchOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-secondary)" }}
            >
              <span>Search</span>
              <kbd style={{ fontSize: "10px", padding: "1px 5px", background: "var(--bg-primary)", borderRadius: "3px" }}>
                Ctrl+K
              </kbd>
            </button>
            <button
              className="btn btn-sm"
              onClick={cycleTheme}
              title={`Active Theme: ${theme.toUpperCase()}. Click to cycle theme.`}
            >
              {theme === "light" ? "Light Mode" : theme === "sepia" ? "Sepia Mode" : "Dark Mode"}
            </button>
            <div
              className="topbar-user"
              style={{ cursor: "pointer" }}
              onClick={() => setIsProfileOpen(true)}
              title="Click to view and edit profile"
            >
              <span className="role-pill">{user.role}</span>
              <span>{user.name}</span>
            </div>
          </div>
        </header>

        <main className="content-area">
          {activeTab === "dashboard" && (
            <DashboardView
              onOpenCourse={handleOpenCourse}
              onNavigateTab={(tab) => {
                setSelectedCourseId(null);
                setActiveTab(tab);
              }}
            />
          )}

          {activeTab === "courses" && (
            <CoursesView
              initialCourseId={selectedCourseId}
              onClearInitialCourseId={() => setSelectedCourseId(null)}
            />
          )}

          {activeTab === "wikipedia" && <WikipediaView />}

          {activeTab === "gutenberg" && <GutenbergView />}

          {activeTab === "countries" && <CountriesView />}

          {activeTab === "quizzes" && <QuizzesView />}

          {activeTab === "studio" && (
            <StudioView
              onCourseCreated={(newCourseId) => {
                setSelectedCourseId(newCourseId);
                setActiveTab("courses");
              }}
            />
          )}
        </main>
      </div>

      <UniversalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigateFromSearch}
        courses={catalogCourses}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
