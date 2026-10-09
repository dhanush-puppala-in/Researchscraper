import React, { useState } from "react";
import { PlusIcon, BotIcon } from "./Icons";
import { api } from "../api/client";

export default function CreateBotModal({ isOpen, onClose, onCreated, notify }) {
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("2022");
  const [endDate, setEndDate] = useState("2024");
  const [source, setSource] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !searchQuery.trim()) {
      notify("Please provide a bot name and search query", "error");
      return;
    }

    setSubmitting(true);
    try {
      const newBot = await api.createBot({
        name: name.trim(),
        searchQuery: searchQuery.trim(),
        startDate: startDate.trim() || null,
        endDate: endDate.trim() || null,
        source,
        isEnabled: true
      });

      notify(`Research Bot "${newBot.name}" created and enabled!`, "success");
      onCreated(newBot);
      onClose();
    } catch (err) {
      notify(err.message || "Failed to create bot", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div className="glass-panel animate-fade" style={{
        width: "100%",
        maxWidth: "520px",
        padding: "32px",
        background: "rgba(18, 24, 38, 0.95)",
        border: "1px solid rgba(99, 102, 241, 0.4)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(99, 102, 241, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#818cf8"
          }}>
            <BotIcon size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Create Automated Research Bot</h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Set up periodic background scraping with custom date boundaries</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
              Bot Name
            </label>
            <input
              type="text"
              placeholder="e.g. LLM Reasoning Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
              Search Keywords / Query
            </label>
            <input
              type="text"
              placeholder="e.g. Large Language Model Reasoning Planning"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                Start Date / Year
              </label>
              <input
                type="text"
                placeholder="2022"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                End Date / Year
              </label>
              <input
                type="text"
                placeholder="2024"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
              Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="input-field"
            >
              <option value="all">All Sources (Scholar, IEEE, Semantic, arXiv)</option>
              <option value="google_scholar">Google Scholar</option>
              <option value="semantic_scholar">Semantic Scholar</option>
              <option value="arxiv">arXiv</option>
              <option value="ieee">IEEE Xplore</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              <PlusIcon size={16} />
              {submitting ? "Creating..." : "Create & Launch Bot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
