const RAW_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const API_BASE = RAW_URL.endsWith("/api") ? RAW_URL : `${RAW_URL.replace(/\/$/, "")}/api`;

export async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || errorBody.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Bots
  getBots: () => fetchJson(`${API_BASE}/bots`),
  getBotById: (id) => fetchJson(`${API_BASE}/bots/${id}`),
  createBot: (data) => fetchJson(`${API_BASE}/bots`, { method: "POST", body: JSON.stringify(data) }),
  updateBot: (id, data) => fetchJson(`${API_BASE}/bots/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  enableBot: (id) => fetchJson(`${API_BASE}/bots/${id}/enable`, { method: "PUT" }),
  disableBot: (id) => fetchJson(`${API_BASE}/bots/${id}/disable`, { method: "PUT" }),
  deleteBot: (id) => fetchJson(`${API_BASE}/bots/${id}`, { method: "DELETE" }),

  // Scraping / Search
  runBotScraper: (botId, options = {}) =>
    fetchJson(`${API_BASE}/scrape/${botId}/run`, {
      method: "POST",
      body: JSON.stringify(options)
    }),

  searchAll: (options = {}) => {
    const params = new URLSearchParams();
    if (options.query || options.q) params.append("q", options.query || options.q);
    if (options.startDate) params.append("startDate", options.startDate);
    if (options.endDate) params.append("endDate", options.endDate);
    if (options.source) params.append("source", options.source);
    if (options.save) params.append("save", options.save);
    return fetchJson(`${API_BASE}/scrape/search?${params.toString()}`);
  },

  // Saved Papers & Exports
  getPapers: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.source && filters.source !== "all") params.append("source", filters.source);
    if (filters.year) params.append("year", filters.year);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.q) params.append("q", filters.q);
    if (filters.botId) params.append("botId", filters.botId);
    return fetchJson(`${API_BASE}/export/papers?${params.toString()}`);
  },

  exportCSVUrl: `${API_BASE}/export/csv`,
  exportPDFUrl: `${API_BASE}/export/pdf`
};
