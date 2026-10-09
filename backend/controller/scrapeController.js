const Bot = require("../models/bot");
const ResearchDoc = require("../models/paper");
const {
  fetchPapersFromSources,
  runScrapeForBot
} = require("../services/paperService");
const { searchScholar } = require("../services/scholarService");
const { searchIEEE } = require("../services/ieeeService");
const { searchSemanticScholar } = require("../services/semanticScholarService");
const { searchArxiv } = require("../services/arxivService");

function parseYear(val) {
  if (!val) return null;
  if (typeof val === "number") return val;
  const match = String(val).match(/\b(19\d\d|20\d\d)\b/);
  if (match) return parseInt(match[1], 10);
  const d = new Date(val);
  if (!isNaN(d.getFullYear())) return d.getFullYear();
  return null;
}

// ========================================================
// RUN SCRAPER FOR A SPECIFIC BOT
// Scrape -> Save to MongoDB -> Return results
// ========================================================
exports.runScraper = async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.botId);

    if (!bot) {
      return res.status(404).json({
        message: "Bot not found"
      });
    }

    if (!bot.isEnabled) {
      return res.status(403).json({
        message: "Bot is disabled"
      });
    }

    // ----------------------------------------------------
    // Date & Source filters
    // ----------------------------------------------------
    const startDate =
      req.query.startDate ||
      req.body?.startDate ||
      bot.startDate ||
      null;

    const endDate =
      req.query.endDate ||
      req.body?.endDate ||
      bot.endDate ||
      null;

    const startYear =
      req.query.startYear ||
      req.body?.startYear ||
      bot.startYear ||
      null;

    const endYear =
      req.query.endYear ||
      req.body?.endYear ||
      bot.endYear ||
      null;

    const source =
      req.query.source ||
      req.body?.source ||
      bot.source ||
      "all";

    console.log("----------------------------------------");
    console.log("Starting scraper for Bot:", bot.name);
    console.log("Query:", bot.searchQuery);
    console.log("Source:", source);
    console.log("Date Range:", { startDate, endDate, startYear, endYear });
    console.log("----------------------------------------");

    // ----------------------------------------------------
    // SCRAPE PAPERS
    // ----------------------------------------------------
    const papers = await runScrapeForBot(bot, {
      startDate,
      endDate,
      startYear,
      endYear,
      source
    });

    console.log("Papers returned from scraper:", papers ? papers.length : 0);

    if (!papers || papers.length === 0) {
      return res.json({
        success: true,
        message: "No documents found",
        count: 0,
        query: bot.searchQuery,
        dateRange: {
          startDate,
          endDate,
          startYear,
          endYear
        },
        source,
        saved: 0
      });
    }

    // ----------------------------------------------------
    // Convert scraper results into MongoDB documents
    // ----------------------------------------------------
    const documents = papers
      .filter((paper) => paper && paper.title)
      .map((paper) => ({
        title: paper.title,
        link: paper.link || paper.documentLink || paper.url || null,
        source: paper.source || (source === "all" ? "Google Scholar" : source),
        authors: paper.authors || paper.snippet || null,
        publicationYear: parseYear(paper.year || paper.publicationYear || startYear || endDate),
        botId: bot._id
      }));

    // Remove documents without a link
    const validDocuments = documents.filter((paper) => paper.link);

    console.log("Valid documents ready for MongoDB:", validDocuments.length);

    // ----------------------------------------------------
    // SAVE TO MONGODB
    // ----------------------------------------------------
    let savedDocuments = [];
    if (validDocuments.length > 0) {
      savedDocuments = await ResearchDoc.insertMany(validDocuments, {
        ordered: false
      });
      console.log(`Saved ${savedDocuments.length} papers to MongoDB`);
    }

    // ----------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------
    return res.json({
      success: true,
      message: "Research paper scraping completed successfully",
      query: bot.searchQuery,
      source,
      dateRange: {
        startDate,
        endDate,
        startYear,
        endYear
      },
      scrapedCount: papers.length,
      savedCount: savedDocuments.length,
      papers: savedDocuments
    });
  } catch (err) {
    console.error("runScraper error:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ========================================================
// DIRECT SEARCH ACROSS ALL SOURCES (SCHOLAR, IEEE, SEMANTIC, ARXIV)
// ========================================================
exports.searchAllSources = async (req, res) => {
  try {
    const query = req.query.q || req.query.query || req.body?.q || req.body?.query;
    const startDate = req.query.startDate || req.body?.startDate;
    const endDate = req.query.endDate || req.body?.endDate;
    const source = req.query.source || req.body?.source || "all";

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const papers = await fetchPapersFromSources({
      query,
      startDate,
      endDate,
      source
    });

    res.json({
      success: true,
      count: papers.length,
      query,
      dateRange: { startDate, endDate },
      source,
      results: papers
    });
  } catch (err) {
    console.error("searchAllSources error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ========================================================
// DIRECT GOOGLE SCHOLAR SEARCH
// ========================================================
exports.searchGoogleScholar = async (req, res) => {
  try {
    const query = req.query.q || req.query.query || req.body?.q || req.body?.query;
    const startDate = req.query.startDate || req.body?.startDate;
    const endDate = req.query.endDate || req.body?.endDate;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const papers = await searchScholar(query, startDate, endDate);
    res.json({
      success: true,
      source: "Google Scholar",
      count: papers.length,
      dateRange: { startDate, endDate },
      results: papers
    });
  } catch (err) {
    console.error("searchGoogleScholar error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ========================================================
// DIRECT IEEE XPLORE SEARCH
// ========================================================
exports.searchIEEE = async (req, res) => {
  try {
    const query = req.query.q || req.query.query || req.body?.q || req.body?.query;
    const startDate = req.query.startDate || req.body?.startDate;
    const endDate = req.query.endDate || req.body?.endDate;
    const maxRecords = req.query.max_records || req.body?.max_records || 25;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const papers = await searchIEEE(query, startDate, endDate, maxRecords);
    res.json({
      success: true,
      source: "IEEE Xplore",
      count: papers.length,
      dateRange: { startDate, endDate },
      results: papers
    });
  } catch (err) {
    console.error("searchIEEE error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ========================================================
// DIRECT SEMANTIC SCHOLAR SEARCH
// ========================================================
exports.searchSemantic = async (req, res) => {
  try {
    const query = req.query.q || req.query.query || req.body?.q || req.body?.query;
    const startDate = req.query.startDate || req.body?.startDate;
    const endDate = req.query.endDate || req.body?.endDate;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const papers = await searchSemanticScholar(query, startDate, endDate);
    res.json({
      success: true,
      source: "Semantic Scholar",
      count: papers.length,
      dateRange: { startDate, endDate },
      results: papers
    });
  } catch (err) {
    console.error("searchSemantic error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ========================================================
// DIRECT ARXIV SEARCH
// ========================================================
exports.searchArxiv = async (req, res) => {
  try {
    const query = req.query.q || req.query.query || req.body?.q || req.body?.query;
    const startDate = req.query.startDate || req.body?.startDate;
    const endDate = req.query.endDate || req.body?.endDate;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const papers = await searchArxiv(query, startDate, endDate);
    res.json({
      success: true,
      source: "arXiv",
      count: papers.length,
      dateRange: { startDate, endDate },
      results: papers
    });
  } catch (err) {
    console.error("searchArxiv error:", err);
    res.status(500).json({ error: err.message });
  }
};
