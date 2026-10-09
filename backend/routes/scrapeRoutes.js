const router = require("express").Router();
const scrape = require("../controller/scrapeController");

// Bot specific scraping
router.post("/:botId/run", scrape.runScraper);
router.get("/:botId/run", scrape.runScraper);

// Direct unified search across all sources (Google Scholar, IEEE, Semantic Scholar, arXiv)
router.get("/search", scrape.searchAllSources);
router.post("/search", scrape.searchAllSources);

// Individual sources
router.get("/scholar", scrape.searchGoogleScholar);
router.post("/scholar", scrape.searchGoogleScholar);

router.get("/ieee", scrape.searchIEEE);
router.post("/ieee", scrape.searchIEEE);

router.get("/semantic", scrape.searchSemantic);
router.post("/semantic", scrape.searchSemantic);

router.get("/arxiv", scrape.searchArxiv);
router.post("/arxiv", scrape.searchArxiv);

module.exports = router;
