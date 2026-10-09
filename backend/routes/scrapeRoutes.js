const router = require("express").Router();
const scrape = require("../controller/scrapeController");

// Bot specific scraping
router.post("/:botId/run", scrape.runScraper);
router.get("/:botId/run", scrape.runScraper);

// Direct unified search across all sources (Google Scholar + IEEE Xplore)
router.get("/search", scrape.searchAllSources);
router.post("/search", scrape.searchAllSources);

// Direct Google Scholar search (SerpApi / Scraper fallback)
router.get("/scholar", scrape.searchGoogleScholar);
router.post("/scholar", scrape.searchGoogleScholar);

// Direct IEEE Xplore search
router.get("/ieee", scrape.searchIEEE);
router.post("/ieee", scrape.searchIEEE);

module.exports = router;
