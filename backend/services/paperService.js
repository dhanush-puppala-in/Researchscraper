const { searchScholar } = require("./scholarService");
const { searchIEEE } = require("./ieeeService");
const { searchSemanticScholar } = require("./semanticScholarService");
const { searchArxiv } = require("./arxivService");

/**
 * Search papers across multi-source aggregator:
 * 'google_scholar', 'ieee', 'semantic_scholar', 'arxiv', or 'all'
 */
async function fetchPapersFromSources({ query, startDate = null, endDate = null, startYear = null, endYear = null, source = "all" }) {
  const tasks = [];
  const selectedSource = (source || "all").toLowerCase();

  const effectiveStart = startYear || startDate;
  const effectiveEnd = endYear || endDate;

  // 1. Google Scholar (SerpApi / Scraper)
  if (selectedSource === "all" || selectedSource === "google_scholar" || selectedSource === "scholar") {
    tasks.push(
      searchScholar(query, effectiveStart, effectiveEnd).catch(err => {
        console.warn("Google Scholar fetch warning:", err.message);
        return [];
      })
    );
  }

  // 2. IEEE Xplore API
  if (selectedSource === "all" || selectedSource === "ieee" || selectedSource === "ieee_xplore") {
    tasks.push(
      searchIEEE(query, effectiveStart, effectiveEnd).catch(err => {
        console.warn("IEEE fetch warning:", err.message);
        return [];
      })
    );
  }

  // 3. Semantic Scholar API (Fast, Reliable Cloud API)
  if (selectedSource === "all" || selectedSource === "semantic_scholar" || selectedSource === "semantic") {
    tasks.push(
      searchSemanticScholar(query, effectiveStart, effectiveEnd).catch(err => {
        console.warn("Semantic Scholar fetch warning:", err.message);
        return [];
      })
    );
  }

  // 4. arXiv API (Open Access, No Rate Limit / IP block)
  if (selectedSource === "all" || selectedSource === "arxiv") {
    tasks.push(
      searchArxiv(query, effectiveStart, effectiveEnd).catch(err => {
        console.warn("arXiv fetch warning:", err.message);
        return [];
      })
    );
  }

  const resultsNested = await Promise.all(tasks);
  const flattened = resultsNested.flat();

  // Deduplicate by title similarity or link
  const seen = new Set();
  const uniquePapers = [];

  for (const paper of flattened) {
    if (!paper || !paper.title) continue;
    const key = paper.title.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    if (!seen.has(key)) {
      seen.add(key);
      uniquePapers.push(paper);
    }
  }

  return uniquePapers;
}

/**
 * Fetch and return papers for a bot
 */
async function runScrapeForBot(bot, options = {}) {
  const startDate = options.startDate || bot.startDate;
  const endDate = options.endDate || bot.endDate;
  const startYear = options.startYear || bot.startYear;
  const endYear = options.endYear || bot.endYear;
  const source = options.source || bot.source || "all";

  const papers = await fetchPapersFromSources({
    query: bot.searchQuery,
    startDate,
    endDate,
    startYear,
    endYear,
    source
  });

  return papers;
}

module.exports = {
  fetchPapersFromSources,
  runScrapeForBot
};
