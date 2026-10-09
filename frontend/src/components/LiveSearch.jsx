import React, { useState } from "react";
import { SearchIcon, CalendarIcon, ExternalLinkIcon, CopyIcon, CheckIcon, DownloadIcon, SparklesIcon } from "./Icons";
import { api } from "../api/client";

export default function LiveSearch({ notify, onPaperSaved }) {
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("2022");
  const [endDate, setEndDate] = useState("2024");
  const [source, setSource] = useState("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [saveToDb, setSaveToDb] = useState(true);

  const presets = [
    { label: "2024 Only", start: "2024", end: "2024" },
    { label: "2023 - 2024", start: "2023", end: "2024" },
    { label: "2020 - 2024", start: "2020", end: "2024" },
    { label: "2015 - 2024", start: "2015", end: "2024" },
    { label: "All Years", start: "", end: "" }
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      notify("Please enter a research topic or search query", "error");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const data = await api.searchAll({
        query: query.trim(),
        startDate: startDate.trim() || undefined,
        endDate: endDate.trim() || undefined,
        source,
        save: saveToDb
      });

      const papers = data.results || [];
      setResults(papers);

      if (papers.length > 0) {
        notify(`Found ${papers.length} papers between ${startDate || "any"} and ${endDate || "present"}!`, "success");
        if (saveToDb && onPaperSaved) {
          onPaperSaved();
        }
      } else {
        notify("No papers found matching criteria.", "info");
      }
    } catch (err) {
      console.error(err);
      notify(err.message || "Failed to search papers", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (link, idx) => {
    navigator.clipboard.writeText(link);
    setCopiedIndex(idx);
    notify("Paper link copied to clipboard!", "success");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="animate-fade">
      {/* Search Header Banner */}
      <div className="glass-panel" style={{ padding: "32px", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        <div style={{ maxWidth: "800px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px", letterSpacing: "-0.5px" }}>
            Multi-Source Research Paper Discovery
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "24px" }}>
            Search academic papers across Google Scholar and IEEE Xplore with custom start and end date bounds.
          </p>

          <form onSubmit={handleSearch}>
            {/* Search Input Bar */}
            <div style={{
              display: "flex",
              gap: "12px",
              background: "rgba(15, 23, 42, 0.9)",
              padding: "8px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              boxShadow: "0 0 25px rgba(99, 102, 241, 0.15)",
              marginBottom: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", paddingLeft: "12px", color: "var(--text-muted)" }}>
                <SearchIcon size={22} />
              </div>
              <input
                type="text"
                placeholder="Search keywords, topics, arXiv titles (e.g. Deep Reinforcement Learning, CRISPR, LLM Agents)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "15px",
                  fontFamily: "inherit"
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: "12px 28px", fontSize: "15px" }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%" }} />
                    Searching...
                  </>
                ) : (
                  <>
                    <SparklesIcon size={18} />
                    Search Papers
                  </>
                )}
              </button>
            </div>

            {/* Filter Controls */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              background: "rgba(15, 23, 42, 0.5)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              marginBottom: "16px"
            }}>
              {/* Start Date */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  <CalendarIcon size={14} /> Start Search Date / Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2021 or 2021-01-01"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* End Date */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  <CalendarIcon size={14} /> End Search Date / Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2024 or 2024-12-31"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Source Selector */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                  Academic Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="input-field"
                  style={{ cursor: "pointer" }}
                >
                  <option value="all">All Sources (Scholar, IEEE, Semantic, arXiv)</option>
                  <option value="google_scholar">Google Scholar</option>
                  <option value="semantic_scholar">Semantic Scholar (Open Access)</option>
                  <option value="arxiv">arXiv (AI, ML, Science)</option>
                  <option value="ieee">IEEE Xplore</option>
                </select>
              </div>
            </div>

            {/* Quick Year Presets */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Quick Ranges:</span>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setStartDate(p.start);
                    setEndDate(p.end);
                  }}
                  className="btn btn-outline"
                  style={{
                    padding: "4px 10px",
                    fontSize: "12px",
                    borderRadius: "99px",
                    background: startDate === p.start && endDate === p.end ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.05)",
                    borderColor: startDate === p.start && endDate === p.end ? "#818cf8" : "var(--border-subtle)"
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* Results Header */}
      {results.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700" }}>
            Search Results ({results.length} Papers)
          </h2>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Showing papers between {startDate || "earliest"} &rarr; {endDate || "latest"}
          </span>
        </div>
      )}

      {/* Results Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {results.map((paper, idx) => {
          const isGoogleScholar = paper.source?.toLowerCase().includes("scholar");
          const hasDirectPdf = paper.pdfLink || (paper.documentLink && paper.documentLink.includes(".pdf"));

          return (
            <div
              key={idx}
              className="glass-panel glass-panel-hover animate-fade"
              style={{ padding: "20px", position: "relative" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "8px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <span className={`badge ${isGoogleScholar ? "badge-scholar" : "badge-ieee"}`}>
                      {paper.source || "Academic Paper"}
                    </span>
                    {paper.year && (
                      <span className="badge" style={{ background: "rgba(255, 255, 255, 0.08)", color: "#e2e8f0" }}>
                        Year: {paper.year}
                      </span>
                    )}
                    {hasDirectPdf && (
                      <span className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                        Direct PDF
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: "17px", fontWeight: "700", lineHeight: "1.4", color: "#ffffff", marginBottom: "8px" }}>
                    {paper.title}
                  </h3>

                  {paper.authors && (
                    <div style={{ fontSize: "13px", color: "#a5b4fc", marginBottom: "8px" }}>
                      <strong>Authors / Info:</strong> {paper.authors}
                    </div>
                  )}

                  {paper.snippet && (
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "12px" }}>
                      {paper.snippet}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons & Links */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
                paddingTop: "12px",
                borderTop: "1px solid var(--border-subtle)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", maxWidth: "60%" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Link:</span>
                  <a
                    href={paper.link || paper.documentLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "12px",
                      color: "#38bdf8",
                      textDecoration: "none",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {paper.link || paper.documentLink}
                  </a>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => copyToClipboard(paper.link || paper.documentLink, idx)}
                    className="btn btn-outline"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                    title="Copy Link"
                  >
                    {copiedIndex === idx ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    {copiedIndex === idx ? "Copied" : "Copy"}
                  </button>

                  <a
                    href={paper.link || paper.documentLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                  >
                    <ExternalLinkIcon size={14} />
                    Open Paper
                  </a>

                  {hasDirectPdf && (
                    <a
                      href={paper.pdfLink || paper.documentLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-cyan"
                      style={{ padding: "6px 14px", fontSize: "12px" }}
                    >
                      <DownloadIcon size={14} />
                      Download PDF
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
