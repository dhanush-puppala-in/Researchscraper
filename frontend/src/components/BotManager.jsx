import React, { useState } from "react";
import { BotIcon, PlayIcon, PauseIcon, TrashIcon, RefreshIcon, PlusIcon, CalendarIcon, SparklesIcon } from "./Icons";
import { api } from "../api/client";
import CreateBotModal from "./CreateBotModal";

export default function BotManager({ bots, setBots, onPaperSaved, notify }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [runningBotId, setRunningBotId] = useState(null);

  const toggleBot = async (bot) => {
    try {
      if (bot.isEnabled) {
        await api.disableBot(bot._id);
        notify(`Bot "${bot.name}" paused`, "info");
      } else {
        await api.enableBot(bot._id);
        notify(`Bot "${bot.name}" activated`, "success");
      }
      setBots(bots.map(b => b._id === bot._id ? { ...b, isEnabled: !b.isEnabled } : b));
    } catch (err) {
      notify(err.message || "Failed to toggle bot", "error");
    }
  };

  const deleteBot = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete bot "${name}"?`)) return;
    try {
      await api.deleteBot(id);
      setBots(bots.filter(b => b._id !== id));
      notify(`Bot "${name}" deleted`, "info");
    } catch (err) {
      notify(err.message || "Failed to delete bot", "error");
    }
  };

  const runBotNow = async (bot) => {
    setRunningBotId(bot._id);
    notify(`Triggered live scrape for "${bot.name}"...`, "info");

    try {
      const data = await api.runBotScraper(bot._id);
      const count = data.savedCount || data.count || (data.papers ? data.papers.length : 0);
      notify(`Bot "${bot.name}" completed! Scraped & stored ${count} papers.`, "success");
      if (onPaperSaved) onPaperSaved();
    } catch (err) {
      notify(err.message || "Failed to run bot scrape", "error");
    } finally {
      setRunningBotId(null);
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Automated Research Bots
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Manage autonomous scrapers that continuously monitor Google Scholar and IEEE.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
          style={{ padding: "10px 20px" }}
        >
          <PlusIcon size={16} />
          Create New Bot
        </button>
      </div>

      {bots.length === 0 ? (
        <div className="glass-panel" style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.1)",
            color: "#818cf8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto"
          }}>
            <BotIcon size={30} />
          </div>
          <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "8px" }}>No Research Bots Created Yet</h3>
          <p style={{ maxWidth: "420px", margin: "0 auto 20px auto", fontSize: "14px" }}>
            Create your first automated bot to periodically scrape papers with specific date filters and sources.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <PlusIcon size={16} />
            Create First Bot
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {bots.map((bot) => {
            const isRunning = runningBotId === bot._id;

            return (
              <div
                key={bot._id}
                className="glass-panel glass-panel-hover animate-fade"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative"
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={`badge ${bot.isEnabled ? "badge-active" : "badge-paused"}`}>
                        {bot.isEnabled ? "Active" : "Paused"}
                      </span>
                      <span className="badge" style={{ background: "rgba(255, 255, 255, 0.06)", color: "#cbd5e1" }}>
                        {bot.source || "All Sources"}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteBot(bot._id, bot.name)}
                      className="btn"
                      style={{
                        padding: "6px",
                        background: "transparent",
                        color: "var(--text-muted)",
                        borderRadius: "8px"
                      }}
                      title="Delete Bot"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
                    {bot.name}
                  </h3>

                  <div style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "13px",
                    color: "#93c5fd",
                    marginBottom: "14px",
                    border: "1px solid var(--border-subtle)"
                  }}>
                    <strong>Query:</strong> "{bot.searchQuery}"
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>
                    <CalendarIcon size={14} />
                    <span>Date Range:</span>
                    <strong style={{ color: "#e2e8f0" }}>
                      {bot.startDate || bot.startYear || "Any"} &rarr; {bot.endDate || bot.endYear || "Present"}
                    </strong>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--border-subtle)"
                }}>
                  <button
                    onClick={() => toggleBot(bot)}
                    className={`btn ${bot.isEnabled ? "btn-outline" : "btn-success"}`}
                    style={{ padding: "8px 14px", fontSize: "12px" }}
                  >
                    {bot.isEnabled ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
                    {bot.isEnabled ? "Pause" : "Enable"}
                  </button>

                  <button
                    onClick={() => runBotNow(bot)}
                    disabled={isRunning}
                    className="btn btn-primary"
                    style={{ padding: "8px 16px", fontSize: "12px" }}
                  >
                    {isRunning ? (
                      <>
                        <span className="spinner" style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%" }} />
                        Scraping...
                      </>
                    ) : (
                      <>
                        <RefreshIcon size={13} />
                        Scrape Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateBotModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(newBot) => setBots([newBot, ...bots])}
        notify={notify}
      />
    </div>
  );
}
