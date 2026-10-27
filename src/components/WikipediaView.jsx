import React, { useState, useEffect } from "react";
import { apiRequest } from "../api/client";

export default function WikipediaView() {
  const [query, setQuery] = useState("Photosynthesis");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [readerArticle, setReaderArticle] = useState(null);
  const [readingLoading, setReadingLoading] = useState(false);

  useEffect(() => {
    searchWikipedia("Photosynthesis");
  }, []);

  async function searchWikipedia(searchTerm) {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError("");
    setReaderArticle(null);
    try {
      const url = `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(searchTerm)}&limit=9`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.pages || []);
    } catch (err) {
      setError("Failed to fetch Wikipedia articles: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openReader(pageKey) {
    setReadingLoading(true);
    try {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageKey)}`;
      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(pageKey)}&format=json&origin=*`;
      const [sumRes, extRes] = await Promise.all([fetch(summaryUrl), fetch(extractUrl)]);
      const sumData = await sumRes.json();
      const extData = await extRes.json();
      const pages = extData?.query?.pages || {};
      const pageObj = Object.values(pages)[0] || {};
      const rawText = pageObj.extract || sumData.extract || "";
      const paragraphs = rawText
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 40 && !p.startsWith("=="))
        .slice(0, 10);

      setReaderArticle({
        key: pageKey,
        title: sumData.title || pageKey,
        description: sumData.description,
        thumbnail: sumData.thumbnail?.source,
        url: sumData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(pageKey)}`,
        paragraphs: paragraphs.length ? paragraphs : [sumData.extract || "No full text extract available."]
      });
    } catch (err) {
      alert("Error reading article: " + err.message);
    } finally {
      setReadingLoading(false);
    }
  }

  async function bookmarkArticle(article) {
    try {
      await apiRequest("/api/bookmarks", {
        method: "POST",
        body: JSON.stringify({
          resourceType: "wikipedia",
          title: article.title,
          sourceRef: article.key || article.title,
          metadata: { description: article.description }
        })
      });
      alert(`Bookmarked "${article.title}" to your dashboard!`);
    } catch (err) {
      alert("Failed to bookmark: " + err.message);
    }
  }

  return (
    <div>
      <div className="section-header">
        <h1>Wikipedia &amp; MediaWiki OER Encyclopedia</h1>
        <p>
          Search and study peer-reviewed open articles live via the official Wikipedia REST API (<code>/w/rest.php/v1/search/page</code>) and summary endpoints.
        </p>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="input"
          placeholder="Search any educational topic (e.g., Photosynthesis, Quantum computing, Renaissance, Calculus)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchWikipedia(query)}
        />
        <button className="btn btn-primary" onClick={() => searchWikipedia(query)} disabled={loading}>
          {loading ? "Searching..." : "Search Articles"}
        </button>
      </div>

      {readingLoading && <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>Opening live encyclopedia reader...</p>}

      {readerArticle && (
        <div className="reader-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <span className="api-source-pill">GET /api/rest_v1/page/summary/{readerArticle.key}</span>
              <h2>{readerArticle.title}</h2>
              {readerArticle.description && (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic", marginTop: "4px" }}>
                  {readerArticle.description}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-sm" onClick={() => bookmarkArticle(readerArticle)}>
                Save Bookmark
              </button>
              <button className="btn btn-sm" onClick={() => setReaderArticle(null)}>
                Close
              </button>
            </div>
          </div>

          {readerArticle.thumbnail && (
            <img
              src={readerArticle.thumbnail}
              alt="Thumbnail"
              style={{ maxHeight: "200px", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "16px" }}
            />
          )}

          <div className="lesson-body">
            {readerArticle.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div style={{ marginTop: "16px" }}>
            <a href={readerArticle.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
              Read Complete Article on Wikipedia &nearr;
            </a>
          </div>
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}

      <div className="grid">
        {results.map((page) => (
          <div key={page.id} className="card">
            <div>
              <span className="card-tag">Wikipedia OER</span>
              <h3>{page.title}</h3>
              {page.description && (
                <p style={{ fontWeight: 500, color: "var(--text-primary)", marginBottom: "6px" }}>
                  {page.description}
                </p>
              )}
              <p
                dangerouslySetInnerHTML={{
                  __html: page.excerpt ? page.excerpt + "..." : "No excerpt available."
                }}
              />
            </div>
            <div className="card-meta">
              <span>Key: <code>{page.key}</code></span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  className="btn btn-sm"
                  onClick={() => bookmarkArticle({ title: page.title, key: page.key, description: page.description })}
                  title="Save Bookmark"
                >
                  Save
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => openReader(page.key)}>
                  Read Article
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
