import React, { useState, useEffect, useRef } from "react";

export default function UniversalSearchModal({ isOpen, onClose, onNavigate, courses = [] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [wikiResults, setWikiResults] = useState([]);
  const [searchingWiki, setSearchingWiki] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setWikiResults([]);
    }
  }, [isOpen]);

  // Live Wikipedia Search Debounced
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setWikiResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingWiki(true);
      try {
        const res = await fetch(`https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(query)}&limit=4`);
        const data = await res.json();
        setWikiResults(data.pages || []);
      } catch (err) {
        console.error("Wikipedia search failed", err);
      } finally {
        setSearchingWiki(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.institution && c.institution.toLowerCase().includes(q)) ||
      c.description.toLowerCase().includes(q)
    );
  }).slice(0, 6);

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "680px",
          width: "95%",
          padding: "0",
          background: "var(--bg-primary)",
          borderRadius: "10px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          overflow: "hidden"
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-color)",
            gap: "12px",
            background: "var(--bg-secondary)"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="input"
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: "16px",
              boxShadow: "none",
              padding: "4px 0",
              outline: "none"
            }}
            placeholder="Search across 16 university courses, 94 lectures, Wikipedia & Gutenberg..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd
            style={{
              padding: "3px 6px",
              fontSize: "11px",
              background: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              color: "var(--text-muted)"
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "6px", padding: "10px 20px", borderBottom: "1px solid var(--border-color)" }}>
          {["all", "courses", "wikipedia", "gutenberg", "countries"].map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm ${filter === tab ? "btn-primary" : ""}`}
              onClick={() => setFilter(tab)}
              style={{ textTransform: "capitalize" }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "12px 20px" }}>
          {!query.trim() && (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              Type keywords like <em>"CS50"</em>, <em>"Machine Learning"</em>, <em>"Calculus"</em>, <em>"Plato"</em>, or <em>"Einstein"</em>...
            </div>
          )}

          {/* Courses Matches */}
          {(filter === "all" || filter === "courses") && filteredCourses.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>
                University Courses ({filteredCourses.length})
              </div>
              {filteredCourses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onNavigate("courses", c.id);
                    onClose();
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    marginBottom: "6px",
                    cursor: "pointer",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-primary)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{c.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {c.institution} &bull; {c.category} &bull; {c.totalLessons || 0} modules
                    </div>
                  </div>
                  <span className="btn btn-sm">Open &rarr;</span>
                </div>
              ))}
            </div>
          )}

          {/* Wikipedia Matches */}
          {(filter === "all" || filter === "wikipedia") && wikiResults.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>
                Wikipedia OER Articles
              </div>
              {wikiResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onNavigate("wikipedia", p.title);
                    onClose();
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    marginBottom: "6px",
                    cursor: "pointer",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 6px", background: "var(--bg-secondary)", borderRadius: "4px", color: "var(--text-secondary)" }}>WIKI</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{p.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {p.description || "Wikipedia academic entry"}
                    </div>
                  </div>
                  <span className="btn btn-sm">Read &rarr;</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick jump to Gutenberg */}
          {(filter === "all" || filter === "gutenberg") && query.trim() && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px" }}>
                Project Gutenberg Library (70,000+ texts)
              </div>
              <div
                onClick={() => {
                  onNavigate("gutenberg", query);
                  onClose();
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  border: "1px dashed var(--border-color)",
                  background: "var(--bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>Search Project Gutenberg for "{query}"</span>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Find free public-domain books and primary sources via Gutendex API
                  </div>
                </div>
                <span className="btn btn-sm">Search Books &rarr;</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "10px 20px",
            borderTop: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            fontSize: "12px",
            color: "var(--text-muted)",
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <span>Use &uarr; &darr; to navigate &bull; Press ESC to dismiss</span>
          <span>OpenLearn Universal Search</span>
        </div>
      </div>
    </div>
  );
}
