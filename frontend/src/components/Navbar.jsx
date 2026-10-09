import React from "react";
import { SearchIcon, BotIcon, BookIcon, DownloadIcon, SparklesIcon, FilePdfIcon } from "./Icons";
import { api } from "../api/client";

export default function Navbar({ activeTab, setActiveTab, paperCount, botCount, notify }) {
  const handleExport = (type) => {
    const url = type === "csv" ? api.exportCSVUrl : api.exportPDFUrl;
    window.open(url, "_blank");
    notify(`Exporting ${type.toUpperCase()} file...`, "info");
  };

  return (
    <header style={{
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(9, 13, 22, 0.8)",
      backdropFilter: "blur(20px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      marginBottom: "32px"
    }}>
      <div style={{
        maxWidth: "1380px",
        margin: "0 auto",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)"
          }}>
            <SparklesIcon size={24} className="text-white" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px", background: "linear-gradient(to right, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ResearchNexus
              </span>
              <span style={{
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                padding: "2px 8px",
                borderRadius: "99px",
                background: "rgba(99, 102, 241, 0.15)",
                color: "#818cf8",
                border: "1px solid rgba(99, 102, 241, 0.3)"
              }}>
                Pro AI
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Google Scholar & IEEE Multi-Source Hub
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: "flex",
          background: "rgba(15, 23, 42, 0.6)",
          padding: "4px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          gap: "4px"
        }}>
          <button
            onClick={() => setActiveTab("search")}
            className="btn"
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              background: activeTab === "search" ? "rgba(99, 102, 241, 0.2)" : "transparent",
              color: activeTab === "search" ? "#818cf8" : "var(--text-secondary)",
              border: activeTab === "search" ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent"
            }}
          >
            <SearchIcon size={16} />
            Live Search
          </button>

          <button
            onClick={() => setActiveTab("bots")}
            className="btn"
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              background: activeTab === "bots" ? "rgba(99, 102, 241, 0.2)" : "transparent",
              color: activeTab === "bots" ? "#818cf8" : "var(--text-secondary)",
              border: activeTab === "bots" ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent"
            }}
          >
            <BotIcon size={16} />
            Bots ({botCount})
          </button>

          <button
            onClick={() => setActiveTab("library")}
            className="btn"
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              background: activeTab === "library" ? "rgba(99, 102, 241, 0.2)" : "transparent",
              color: activeTab === "library" ? "#818cf8" : "var(--text-secondary)",
              border: activeTab === "library" ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent"
            }}
          >
            <BookIcon size={16} />
            Library ({paperCount})
          </button>
        </nav>

        {/* Quick Export Actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleExport("csv")}
            className="btn btn-outline"
            style={{ padding: "8px 14px", fontSize: "13px" }}
            title="Download CSV of all saved papers"
          >
            <DownloadIcon size={15} />
            CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="btn btn-outline"
            style={{ padding: "8px 14px", fontSize: "13px" }}
            title="Download PDF Report"
          >
            <FilePdfIcon size={15} />
            PDF
          </button>
        </div>
      </div>
    </header>
  );
}
