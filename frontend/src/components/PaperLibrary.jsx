import React, { useState, useEffect } from "react";
import { SearchIcon, DownloadIcon, ExternalLinkIcon, CopyIcon, CheckIcon, FilePdfIcon, CalendarIcon } from "./Icons";
import { api } from "../api/client";

export default function PaperLibrary({ papers, setPapers, notify }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  // Extract unique years from papers
  const years = Array.from(new Set(papers.map(p => p.publicationYear || p.year).filter(Boolean))).sort((a, b) => b - a);

  const filteredPapers = papers.filter(p => {
    const matchesSearch =
      !searchTerm ||
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.source?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource =
      selectedSource === "all" ||
      p.source?.toLowerCase().includes(selectedSource.toLowerCase());

    const paperYear = String(p.publicationYear || p.year || "");
    const matchesYear =
      selectedYear === "all" ||
      paperYear === String(selectedYear);

    return matchesSearch && matchesSource && matchesYear;
  });

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    notify("Paper link copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-fade">
      {/* Library Top Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Saved Research Library ({papers.length})
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            All discovered papers scraped and stored in your MongoDB database.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <a
            href={api.exportCSVUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
          >
            <DownloadIcon size={16} />
            Export CSV
          </a>
          <a
            href={api.exportPDFUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            <FilePdfIcon size={16} />
            Export PDF
          </a>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {/* Keyword Search */}
          <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
            <div style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }}>
              <SearchIcon size={18} />
            </div>
            <input
              type="text"
              placeholder="Filter saved papers by title, author, topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "38px" }}
            />
          </div>

          {/* Source Filter */}
          <div style={{ minWidth: "160px" }}>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="input-field"
            >
              <option value="all">All Sources</option>
              <option value="scholar">Google Scholar</option>
              <option value="ieee">IEEE Xplore</option>
            </select>
          </div>

          {/* Year Filter */}
          <div style={{ minWidth: "140px" }}>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="input-field"
            >
              <option value="all">All Years</option>
              {years.map((yr, idx) => (
                <option key={idx} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Papers Table / Cards */}
      {filteredPapers.length === 0 ? (
        <div className="glass-panel" style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>
          <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "8px" }}>No Papers Found</h3>
          <p style={{ fontSize: "14px" }}>Try adjusting your search filter or trigger a live scrape from the Live Search or Bots tab.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredPapers.map((paper) => {
            const isGoogleScholar = paper.source?.toLowerCase().includes("scholar");

            return (
              <div
                key={paper._id}
                className="glass-panel glass-panel-hover"
                style={{
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  flexWrap: "wrap"
                }}
              >
                <div style={{ flex: 1, minWidth: "280px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span className={`badge ${isGoogleScholar ? "badge-scholar" : "badge-ieee"}`}>
                      {paper.source || "Google Scholar"}
                    </span>
                    {(paper.publicationYear || paper.year) && (
                      <span className="badge" style={{ background: "rgba(255, 255, 255, 0.08)", color: "#cbd5e1" }}>
                        {paper.publicationYear || paper.year}
                      </span>
                    )}
                    {paper.createdAt && (
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Saved {new Date(paper.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>
                    {paper.title}
                  </h3>

                  {paper.authors && (
                    <p style={{ fontSize: "13px", color: "#a5b4fc", marginBottom: "4px" }}>
                      {paper.authors}
                    </p>
                  )}

                  <a
                    href={paper.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "12px",
                      color: "#38bdf8",
                      textDecoration: "none",
                      display: "inline-block",
                      maxWidth: "500px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {paper.link}
                  </a>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => copyLink(paper.link, paper._id)}
                    className="btn btn-outline"
                    style={{ padding: "8px 12px", fontSize: "12px" }}
                    title="Copy Link"
                  >
                    {copiedId === paper._id ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    {copiedId === paper._id ? "Copied" : "Copy"}
                  </button>

                  <a
                    href={paper.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ padding: "8px 16px", fontSize: "13px" }}
                  >
                    <ExternalLinkIcon size={14} />
                    Open Paper
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
