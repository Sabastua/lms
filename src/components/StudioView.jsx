import React, { useState, useEffect } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function StudioView({ onCourseCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [institution, setInstitution] = useState("Open University & OER");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [wikiTopics, setWikiTopics] = useState("");
  const [gutenbergId, setGutenbergId] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [authoredCourses, setAuthoredCourses] = useState([]);
  const [loadingAuthored, setLoadingAuthored] = useState(false);

  // Live API Tester state
  const [apiTestOutput, setApiTestOutput] = useState(null);
  const [apiTesting, setApiTesting] = useState(false);

  useEffect(() => {
    if (user?.role === "instructor") {
      loadAuthoredCourses();
    }
  }, [user]);

  async function loadAuthoredCourses() {
    setLoadingAuthored(true);
    try {
      const data = await apiRequest("/api/dashboard");
      setAuthoredCourses(data.instructorStats?.authoredCourses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAuthored(false);
    }
  }

  async function handleCreateCourse(e) {
    e.preventDefault();
    if (!title || !category || !description) {
      setError("Please fill out Title, Category, and Description.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    const lessons = [];
    let pos = 1;

    // Wikipedia topics
    if (wikiTopics.trim()) {
      wikiTopics
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((topic) => {
          lessons.push({
            position: pos++,
            title: `Study Module: ${topic}`,
            lessonType: "wikipedia",
            sourceRef: topic.replace(/\s+/g, "_"),
            contentBody: `Academic exploration of ${topic} via Wikipedia REST API.`
          });
        });
    }

    // Gutenberg Book
    if (gutenbergId.trim()) {
      lessons.push({
        position: pos++,
        title: `Primary Source Reading (Gutenberg #${gutenbergId.trim()})`,
        lessonType: "gutenberg",
        sourceRef: gutenbergId.trim(),
        contentBody: "Full text public-domain reading via Gutendex."
      });
    }

    // Country profile
    if (countryCode.trim()) {
      lessons.push({
        position: pos++,
        title: `Geopolitical & Civics Profile (${countryCode.trim().toUpperCase()})`,
        lessonType: "country",
        sourceRef: countryCode.trim().toUpperCase(),
        contentBody: "Demographic, economic, and regional facts via REST Countries v3.1."
      });
    }

    try {
      const data = await apiRequest("/api/courses", {
        method: "POST",
        body: JSON.stringify({
          title,
          category,
          description,
          difficulty,
          institution: institution.trim() || "Open University & OER",
          lessons
        })
      });

      setMessage(`Course "${title}" published successfully to SQLite!`);
      setTitle("");
      setInstitution("Open University & OER");
      setCategory("");
      setDescription("");
      setWikiTopics("");
      setGutenbergId("");
      setCountryCode("");
      loadAuthoredCourses();
      if (onCourseCreated) onCourseCreated(data.course?.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function testApiEndpoint(url) {
    setApiTesting(true);
    setApiTestOutput({ url, text: "Testing live endpoint..." });
    try {
      const res = await fetch(url);
      const json = await res.json();
      setApiTestOutput({ url, text: JSON.stringify(json, null, 2) });
    } catch (err) {
      setApiTestOutput({ url, text: `Error fetching API: ${err.message}` });
    } finally {
      setApiTesting(false);
    }
  }

  return (
    <div>
      <div className="section-header">
        <h1>Instructor Studio &amp; Free OER API Documentation</h1>
        <p>
          Model courses with Frappe LMS &amp; Strapi-inspired Headless schemas, pull structured learning objects from free OER endpoints, and verify live public APIs.
        </p>
      </div>

      {user?.role === "instructor" ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", marginBottom: "28px" }}>
          {/* Course Builder */}
          <div className="card">
            <div>
              <span className="card-tag">Author New Course</span>
              <h3>Course &amp; Curriculum Builder</h3>
              <p>Create a structured curriculum backed by live public OER endpoints.</p>

              {message && <div className="alert-success">{message}</div>}
              {error && <div className="alert-error">{error}</div>}

              <form onSubmit={handleCreateCourse}>
                <div className="form-group">
                  <label>Course Title</label>
                  <input
                    type="text"
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="e.g., Modern Astronomy & Astrophysics"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Institution / University Sourced From</label>
                  <input
                    type="text"
                    list="university-list"
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="e.g., Harvard University (CS50), MIT, Stanford, Oxford, Open University & OER"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                  <datalist id="university-list">
                    <option value="Harvard University (CS50)" />
                    <option value="Massachusetts Institute of Technology (MIT)" />
                    <option value="Stanford University (Stanford AI)" />
                    <option value="University of Oxford" />
                    <option value="University of Cambridge" />
                    <option value="Yale University" />
                    <option value="UC Berkeley (EECS)" />
                    <option value="California Institute of Technology (Caltech)" />
                    <option value="Princeton University" />
                    <option value="Columbia University" />
                    <option value="London School of Economics (LSE)" />
                    <option value="Georgetown University (SFS)" />
                    <option value="University of Edinburgh" />
                    <option value="Open University & OER" />
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Category &amp; Difficulty</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., Physics & Astronomy"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    />
                    <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="input"
                    style={{ width: "100%", minHeight: "70px" }}
                    placeholder="Briefly describe what learners will achieve..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Wikipedia Lesson Topics (comma-separated)</label>
                  <input
                    type="text"
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="e.g., Black hole, Hubble Space Telescope, Big Bang"
                    value={wikiTopics}
                    onChange={(e) => setWikiTopics(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Project Gutenberg Book ID (Optional)</label>
                  <input
                    type="number"
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="e.g., 5001 (Relativity by Einstein)"
                    value={gutenbergId}
                    onChange={(e) => setGutenbergId(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Country Civic Profile Alpha Code (Optional)</label>
                  <input
                    type="text"
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="e.g., KE, CA, JP, DE"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
                  {submitting ? "Publishing to SQLite..." : "Publish Course to Catalog"}
                </button>
              </form>
            </div>
          </div>

          {/* Authored Courses List */}
          <div className="card">
            <div>
              <span className="card-tag">Instructor Dashboard</span>
              <h3>Your Authored Courses</h3>
              <p>Active courses managed under your instructor account (<code>{user.email}</code>).</p>

              {loadingAuthored ? (
                <p style={{ color: "var(--text-muted)" }}>Loading courses...</p>
              ) : authoredCourses.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No authored courses found yet.</p>
              ) : (
                <div style={{ display: "grid", gap: "10px", maxHeight: "420px", overflowY: "auto" }}>
                  {authoredCourses.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: "12px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        background: "var(--bg-secondary)"
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "14px" }}>{c.title}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Category: {c.category} • {c.difficulty}
                      </div>
                      <div style={{ fontSize: "12px", marginTop: "4px" }}>
                        <strong>{c.totalStudents || 0}</strong> students enrolled &nbsp;|&nbsp;{" "}
                        <strong>{c.totalLessons || 0}</strong> lessons
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="reader-box">
          <p>
            You are signed in as a <strong>Learner</strong>. To author courses or import custom OER modules, switch to the Instructor demo account (<code>instructor@openlearn.org</code>).
          </p>
        </div>
      )}

      {/* API Reference & Live Tester */}
      <div className="reader-box">
        <h3 style={{ marginBottom: "8px" }}>Live Free Educational &amp; Open APIs Reference</h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
          All endpoints below are completely open, require zero authentication keys, and support browser CORS out-of-the-box.
        </p>

        <table className="docs-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Endpoint &amp; Standard Parameters</th>
              <th>LMS Function</th>
              <th>Live Inspect</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Wikipedia REST v1</strong>
              </td>
              <td>
                <code>GET https://en.wikipedia.org/api/rest_v1/page/summary/{`{title}`}</code>
                <br />
                <code>GET https://en.wikipedia.org/w/rest.php/v1/search/page?q={`{query}`}</code>
              </td>
              <td>Delivers clean article abstracts, thumbnails, and search results.</td>
              <td>
                <button
                  className="btn btn-sm"
                  onClick={() => testApiEndpoint("https://en.wikipedia.org/api/rest_v1/page/summary/Photosynthesis")}
                >
                  Test Live
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <strong>MediaWiki Action API</strong>
              </td>
              <td>
                <code>GET https://en.wikipedia.org/w/api.php?action=query&amp;prop=extracts&amp;explaintext=1&amp;titles={`{title}`}&amp;format=json&amp;origin=*</code>
              </td>
              <td>Pulls full structured multi-paragraph article text for lesson reading views.</td>
              <td>
                <button
                  className="btn btn-sm"
                  onClick={() =>
                    testApiEndpoint(
                      "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=Alan_Turing&format=json&origin=*"
                    )
                  }
                >
                  Test Live
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Project Gutenberg (Gutendex)</strong>
              </td>
              <td>
                <code>GET https://gutendex.com/books?search={`{query}`}&amp;topic={`{topic}`}</code>
                <br />
                <code>GET https://gutendex.com/books/{`{id}`}</code>
              </td>
              <td>Queries metadata and direct reading formats (HTML, EPUB, TXT) for 70,000+ texts.</td>
              <td>
                <button className="btn btn-sm" onClick={() => testApiEndpoint("https://gutendex.com/books/1497")}>
                  Test Live
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <strong>REST Countries v3.1</strong>
              </td>
              <td>
                <code>GET https://restcountries.com/v3.1/region/{`{region}`}?fields=name,capital,population,flags,languages,currencies</code>
              </td>
              <td>Serves geopolitical, demographic, and economic civic data.</td>
              <td>
                <button
                  className="btn btn-sm"
                  onClick={() =>
                    testApiEndpoint(
                      "https://restcountries.com/v3.1/alpha/ke?fields=name,capital,population,languages,currencies,flags"
                    )
                  }
                >
                  Test Live
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <strong>Open Trivia Database</strong>
              </td>
              <td>
                <code>GET https://opentdb.com/api.php?amount=3&amp;category=18&amp;type=multiple</code>
              </td>
              <td>Provides categorized multiple-choice assessment questions.</td>
              <td>
                <button
                  className="btn btn-sm"
                  onClick={() => testApiEndpoint("https://opentdb.com/api.php?amount=2&category=18&type=multiple")}
                >
                  Test Live
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {apiTestOutput && (
          <div style={{ marginTop: "16px", padding: "14px", border: "1px solid var(--border-color)", borderRadius: "6px", background: "var(--bg-secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontFamily: "monospace" }}>URL: {apiTestOutput.url}</span>
              <button className="btn btn-sm" onClick={() => setApiTestOutput(null)}>
                Clear
              </button>
            </div>
            <pre style={{ maxHeight: "240px", overflowY: "auto", fontSize: "12px" }}>
              {apiTestOutput.text}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
