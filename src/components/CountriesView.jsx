import React, { useState, useEffect } from "react";
import { apiRequest } from "../api/client";

export default function CountriesView() {
  const [region, setRegion] = useState("Africa");
  const [searchTerm, setSearchTerm] = useState("");
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeCountry, setActiveCountry] = useState(null);
  const [flashcard, setFlashcard] = useState(null);

  useEffect(() => {
    loadRegion("Africa");
  }, []);

  async function loadRegion(selectedRegion) {
    setLoading(true);
    setError("");
    setActiveCountry(null);
    setFlashcard(null);
    try {
      const url = `https://restcountries.com/v3.1/region/${encodeURIComponent(
        selectedRegion
      )}?fields=name,capital,population,region,subregion,flags,languages,currencies,area,maps,cca3`;
      const res = await fetch(url);
      const data = await res.json();
      const sorted = Array.isArray(data) ? data.sort((a, b) => (b.population || 0) - (a.population || 0)) : [];
      setCountries(sorted.slice(0, 15));
    } catch (err) {
      setError("Failed to fetch country data: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function searchCountry(name) {
    if (!name.trim()) return loadRegion(region);
    setLoading(true);
    setError("");
    setActiveCountry(null);
    setFlashcard(null);
    try {
      const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(
        name.trim()
      )}?fields=name,capital,population,region,subregion,flags,languages,currencies,area,maps,cca3`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Country not found");
      const data = await res.json();
      setCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`No country found matching "${name}".`);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }

  function generateFlashcardQuiz() {
    const withCapitals = countries.filter((c) => c.capital && c.capital.length > 0);
    if (withCapitals.length < 4) {
      alert("Please load a region with at least 4 countries first.");
      return;
    }

    const target = withCapitals[Math.floor(Math.random() * withCapitals.length)];
    const correctCapital = target.capital[0];
    const distractors = withCapitals
      .filter((c) => c.name.common !== target.name.common)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((c) => c.capital[0]);

    const options = [...distractors, correctCapital].sort(() => 0.5 - Math.random());

    setFlashcard({
      countryName: target.name.common,
      correctCapital,
      options,
      selected: null
    });
  }

  async function bookmarkCountry(country) {
    try {
      await apiRequest("/api/bookmarks", {
        method: "POST",
        body: JSON.stringify({
          resourceType: "country",
          title: country.name.common,
          sourceRef: country.cca3 || country.name.common,
          metadata: {
            capital: (country.capital || []).join(", "),
            region: country.region,
            population: country.population
          }
        })
      });
      alert(`Bookmarked "${country.name.common}" to your dashboard!`);
    } catch (err) {
      alert("Failed to bookmark: " + err.message);
    }
  }

  return (
    <div>
      <div className="section-header">
        <h1>Geography, History &amp; Civics Lab (REST Countries v3.1)</h1>
        <p>
          Analyze demographic, economic, and geopolitical datasets worldwide directly from <code>https://restcountries.com/v3.1/</code>.
        </p>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="input"
          placeholder="Search by country name (e.g., Kenya, Canada, Germany, Japan)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchCountry(searchTerm)}
        />
        <select
          className="select"
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setSearchTerm("");
            loadRegion(e.target.value);
          }}
        >
          <option value="Africa">Region: Africa</option>
          <option value="Europe">Region: Europe</option>
          <option value="Asia">Region: Asia</option>
          <option value="Americas">Region: Americas</option>
          <option value="Oceania">Region: Oceania</option>
        </select>
        <button className="btn btn-primary" onClick={() => (searchTerm ? searchCountry(searchTerm) : loadRegion(region))} disabled={loading}>
          {loading ? "Loading..." : "Load Data"}
        </button>
        <button className="btn" onClick={generateFlashcardQuiz}>
          Generate Capital Flashcard
        </button>
      </div>

      {flashcard && (
        <div className="reader-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span className="api-source-pill">Auto-Generated Geography Flashcard (REST Countries v3.1)</span>
            <button className="btn btn-sm" onClick={generateFlashcardQuiz}>
              Next Flashcard &rarr;
            </button>
          </div>
          <h3>What is the capital city of {flashcard.countryName}?</h3>
          <div className="quiz-options">
            {flashcard.options.map((opt, i) => {
              let optClass = "quiz-option";
              if (flashcard.selected) {
                if (opt === flashcard.correctCapital) optClass += " correct";
                else if (flashcard.selected === opt) optClass += " incorrect";
              }
              return (
                <button
                  key={i}
                  className={optClass}
                  disabled={Boolean(flashcard.selected)}
                  onClick={() => setFlashcard((prev) => ({ ...prev, selected: opt }))}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeCountry && (
        <div className="reader-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div>
              <span className="api-source-pill">REST Countries v3.1 Profile — {activeCountry.cca3}</span>
              <h2>{activeCountry.name.official || activeCountry.name.common}</h2>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-sm" onClick={() => bookmarkCountry(activeCountry)}>
                Save Bookmark
              </button>
              <button className="btn btn-sm" onClick={() => setActiveCountry(null)}>
                Close
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginTop: "12px" }}>
            <img
              src={activeCountry.flags?.svg || activeCountry.flags?.png}
              alt="Flag"
              style={{ width: "100%", maxHeight: "180px", objectFit: "cover", border: "1px solid var(--border-color)", borderRadius: "6px" }}
            />
            <div className="lesson-body">
              <p><strong>Capital:</strong> {(activeCountry.capital || []).join(", ") || "N/A"}</p>
              <p><strong>Region / Subregion:</strong> {activeCountry.region} ({activeCountry.subregion || ""})</p>
              <p><strong>Population:</strong> {(activeCountry.population || 0).toLocaleString()}</p>
              <p><strong>Total Area:</strong> {(activeCountry.area || 0).toLocaleString()} km²</p>
              <p><strong>Official Languages:</strong> {Object.values(activeCountry.languages || {}).join(", ")}</p>
              <p>
                <strong>Currencies:</strong>{" "}
                {Object.values(activeCountry.currencies || {})
                  .map((cur) => `${cur.name} (${cur.symbol || ""})`)
                  .join(", ")}
              </p>
              {activeCountry.maps?.googleMaps && (
                <a href={activeCountry.maps.googleMaps} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ marginTop: "8px" }}>
                  View on Google Maps &nearr;
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}
      {loading && <p style={{ color: "var(--text-muted)" }}>Loading countries data...</p>}

      <div className="grid">
        {countries.map((c) => {
          const capital = (c.capital || []).join(", ") || "N/A";
          const languages = Object.values(c.languages || {}).slice(0, 3).join(", ") || "N/A";

          return (
            <div key={c.cca3 || c.name.common} className="card">
              <div>
                <img src={c.flags?.svg || c.flags?.png} alt={c.name.common} className="country-flag" />
                <span className="card-tag">
                  {c.subregion || c.region} ({c.cca3})
                </span>
                <h3>{c.name.common}</h3>
                <p style={{ marginBottom: "4px" }}>
                  <strong>Capital:</strong> {capital}
                </p>
                <p style={{ marginBottom: "4px" }}>
                  <strong>Population:</strong> {(c.population || 0).toLocaleString()}
                </p>
                <p>
                  <strong>Languages:</strong> {languages}
                </p>
              </div>
              <div className="card-meta">
                <span>{(c.area || 0).toLocaleString()} km²</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="btn btn-sm" onClick={() => bookmarkCountry(c)} title="Save Bookmark">
                    Save
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveCountry(c)}>
                    Fact Sheet
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
