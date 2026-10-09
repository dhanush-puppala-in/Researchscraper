const { searchScholar } = require("./scholarService");
const { searchIEEE } = require("./ieeeService");
const ResearchDoc = require("../models/paper");

/**
 * Search papers across sources: 'google_scholar', 'ieee', or 'all'
 */
async function fetchPapersFromSources({ query, startDate = null, endDate = null, startYear = null, endYear = null, source = "all" }) {
  const tasks = [];
  const selectedSource = (source || "all").toLowerCase();

  const effectiveStart = startYear || startDate;
  const effectiveEnd = endYear || endDate;

  if (selectedSource === "all" || selectedSource === "google_scholar" || selectedSource === "scholar") {
    tasks.push(
      searchScholar(query, effectiveStart, effectiveEnd)
        .catch(err => {
          console.error("Google Scholar fetch error:", err.message);
          return [];
        })
    );
  }

  if (selectedSource === "all" || selectedSource === "ieee" || selectedSource === "ieee_xplore") {
    tasks.push(
      searchIEEE(query, effectiveStart, effectiveEnd)
        .catch(err => {
          console.error("IEEE fetch error:", err.message);
          return [];
        })
    );
  }

  const resultsNested = await Promise.all(tasks);
  return resultsNested.flat();
}

/**
 * Fetch and save papers for a bot
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
