import React, { useState, useEffect } from "react";
import { apiRequest } from "../api/client";

export default function GutenbergView() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("science");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBooks("", "science");
  }, []);

  async function fetchBooks(searchQuery, topicFilter) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (topicFilter) params.set("topic", topicFilter);

      const endpoint = `https://gutendex.com/books?${params.toString()}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setBooks((data.results || []).slice(0, 12));
    } catch (err) {
      setError("Failed to fetch Project Gutenberg catalog: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function bookmarkBook(book) {
    try {
      await apiRequest("/api/bookmarks", {
        method: "POST",
        body: JSON.stringify({
          resourceType: "gutenberg",
          title: book.title,
          sourceRef: String(book.id),
          metadata: {
            author: (book.authors || []).map((a) => a.name).join("; "),
            downloads: book.download_count
          }
        })
      });
      alert(`Bookmarked "${book.title}" to your dashboard!`);
    } catch (err) {
      alert("Failed to bookmark: " + err.message);
    }
  }

  return (
    <div>
      <div className="section-header">
        <h1>Project Gutenberg E-Book Catalog (Gutendex API)</h1>
        <p>
          Access over 70,000 free, public-domain books and primary source texts with zero copyright restrictions via <code>https://gutendex.com/books</code>.
        </p>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="input"
          placeholder="Search author or title (e.g., Plato, Darwin, Shakespeare, Einstein, Newton)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchBooks(query, topic)}
        />
        <select
          className="select"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            fetchBooks(query, e.target.value);
          }}
        >
          <option value="science">Topic: Science</option>
          <option value="philosophy">Topic: Philosophy</option>
          <option value="history">Topic: History</option>
          <option value="mathematics">Topic: Mathematics</option>
          <option value="education">Topic: Education</option>
          <option value="children">Topic: Children's Literature</option>
          <option value="">All Topics (Popular)</option>
        </select>
        <button className="btn btn-primary" onClick={() => fetchBooks(query, topic)} disabled={loading}>
          {loading ? "Fetching..." : "Fetch E-Books"}
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {loading && <p style={{ color: "var(--text-muted)" }}>Querying Project Gutenberg catalog...</p>}

      <div className="grid">
        {books.map((book) => {
          const authors = (book.authors || []).map((a) => a.name).join("; ") || "Anonymous";
          const subjects = (book.subjects || []).slice(0, 2).join(" • ") || "Public Domain Classic";
          const htmlLink =
            book.formats?.["text/html"] ||
            book.formats?.["text/html; charset=utf-8"] ||
            `https://www.gutenberg.org/ebooks/${book.id}`;
          const epubLink = book.formats?.["application/epub+zip"];

          return (
            <div key={book.id} className="card">
              <div>
                <span className="card-tag">Gutenberg ID #{book.id}</span>
                <h3>{book.title}</h3>
                <p style={{ fontWeight: 500, color: "var(--text-primary)", marginBottom: "6px" }}>{authors}</p>
                <p>{subjects}</p>
              </div>
              <div className="card-meta">
                <span>{(book.download_count || 0).toLocaleString()} downloads</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="btn btn-sm" onClick={() => bookmarkBook(book)} title="Save Bookmark">
                    Save
                  </button>
                  <a href={htmlLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                    Read HTML &nearr;
                  </a>
                  {epubLink && (
                    <a href={epubLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                      EPUB
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
