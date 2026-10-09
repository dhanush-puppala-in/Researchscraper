const { searchScholar } = require("./scholarService");
const { searchIEEE } = require("./ieeeService");
const { searchSemanticScholar } = require("./semanticScholarService");
const { searchArxiv } = require("./arxivService");
const { searchCrossref } = require("./crossrefService");
const { searchOpenAlex } = require("./openAlexService");

/**
 * Search papers across multi-source aggregator:
 * 'crossref', 'openalex', 'arxiv', 'google_scholar', 'ieee', 'semantic_scholar', or 'all'
 */
async function fetchPapersFromSources({ query, startDate = null, endDate = null, startYear = null, endYear = null, source = "all" }) {
  const tasks = [];
  const selectedSource = (source || "all").toLowerCase();

  const effectiveStart = startYear || startDate;
  const effectiveEnd = endYear || endDate;

  // 1. Crossref API (Nature, IEEE, Springer, ACM, Wiley, Elsevier) - 100% Reliable
  if (selectedSource === "all" || selectedSource === "crossref" || selectedSource === "ieee") {
    tasks.push(
      searchCrossref(query, effectiveStart, effectiveEnd).catch(err => {
        console.warn("Crossref fetch notice:", err.message);
        return [];
      })
    );
  }

  // 2. OpenAlex API (250 Million Open Access Works) - 100% Reliable
  if (selectedSource === "all" || selectedSource === "openalex") {
    tasks.push(
      searchOpenAlex(query, effectiveStart, effectiveEnd).catch(err => {
        console.warn("OpenAlex fetch notice:", err.message);
        return [];
      })
    );
  }

  // 3. arXiv API (AI, Computer Science, Physics) - 100% Reliable
  if (selectedSource === "all" || selectedSource === "arxiv") {
    tasks.push(
      searchArxiv(query, effectiveStart, effectiveEnd).catch(err => {
        console.warn("arXiv fetch notice:", err.message);
        return [];
      })
    );
  }

  // 4. Google Scholar (SerpApi / Scraper)
  if (selectedSource === "all" || selectedSource === "google_scholar" || selectedSource === "scholar") {
    tasks.push(
      searchScholar(query, effectiveStart, effectiveEnd).catch(err => {
        console.warn("Google Scholar fetch notice:", err.message);
        return [];
      })
    );
  }

  // 5. IEEE Xplore API
  if (selectedSource === "ieee" || selectedSource === "ieee_xplore") {
    tasks.push(
      searchIEEE(query, effectiveStart, effectiveEnd).catch(err => {
        console.warn("IEEE API notice:", err.message);
        return [];
      })
    );
  }

  // 6. Semantic Scholar
  if (selectedSource === "semantic_scholar" || selectedSource === "semantic") {
    tasks.push(
      searchSemanticScholar(query, effectiveStart, effectiveEnd).catch(err => {
        console.warn("Semantic Scholar notice:", err.message);
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
