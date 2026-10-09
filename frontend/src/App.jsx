import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LiveSearch from "./components/LiveSearch";
import BotManager from "./components/BotManager";
import PaperLibrary from "./components/PaperLibrary";
import { BookIcon, BotIcon, SparklesIcon, RefreshIcon } from "./components/Icons";
import { api } from "./api/client";

export default function App() {
  const [activeTab, setActiveTab] = useState("search");
  const [bots, setBots] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [toasts, setToasts] = useState([]);

  const notify = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loadData = async () => {
    try {
      const [botsData, papersData] = await Promise.all([
        api.getBots().catch(() => []),
        api.getPapers().catch(() => ({ papers: [] }))
      ]);
      setBots(Array.isArray(botsData) ? botsData : []);
      setPapers(papersData.papers || []);
    } catch (err) {
      console.error("Initial load error:", err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePaperSaved = () => {
    loadData();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        paperCount={papers.length}
        botCount={bots.length}
        notify={notify}
      />

      <main className="app-container" style={{ flex: 1 }}>
        {/* Quick Stats Top Bar */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "28px"
        }}>
          <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "#818cf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <BookIcon size={22} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>SAVED RESEARCH PAPERS</div>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#fff" }}>{papers.length}</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(6, 182, 212, 0.15)",
              color: "#22d3ee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <BotIcon size={22} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>AUTOMATED BOTS</div>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#fff" }}>
                {bots.filter(b => b.isEnabled).length} <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>/ {bots.length} Active</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <SparklesIcon size={22} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>SEARCH ENGINES</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", display: "inline-block", boxShadow: "0 0 10px #34d399" }} />
                Scholar & IEEE Ready
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "search" && (
          <LiveSearch notify={notify} onPaperSaved={handlePaperSaved} />
        )}

        {activeTab === "bots" && (
          <BotManager
            bots={bots}
            setBots={setBots}
            onPaperSaved={handlePaperSaved}
            notify={notify}
          />
        )}

        {activeTab === "library" && (
          <PaperLibrary
            papers={papers}
            setPapers={setPapers}
            notify={notify}
          />
        )}
      </main>

      {/* Floating Toast Alerts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
