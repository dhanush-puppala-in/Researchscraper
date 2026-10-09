const { getJson } = require("serpapi");
const scrapeScholarFallback = require("./scholarScraper");

function extractYear(val) {
  if (!val) return null;
  if (typeof val === "number") return val;
  const match = String(val).match(/\b(19\d\d|20\d\d)\b/);
  if (match) return match[1];
  const d = new Date(val);
  if (!isNaN(d.getFullYear())) return String(d.getFullYear());
  return String(val).trim();
}

/**
 * Search Google Scholar via SerpApi
 */
function searchGoogleScholarSerpApi(query, startDate = null, endDate = null) {
  const apiKey = process.env.SERPAPI_API_KEY;
  const startYear = extractYear(startDate);
  const endYear = extractYear(endDate);

  const params = {
    engine: "google_scholar",
    q: query,
    hl: "en",
    api_key: apiKey
  };

  if (startYear) {
    params.as_ylo = startYear;
  }
  if (endYear) {
    params.as_yhi = endYear;
  }

  return new Promise((resolve, reject) => {
    getJson(params, (json) => {
      if (json.error) {
        return reject(new Error(json.error));
      }

      const results = json.organic_results || [];
      const papers = results.map(item => {
        // Look for PDF link in resources or direct links
        let pdfLink = null;
        if (Array.isArray(item.resources)) {
          const pdfResource = item.resources.find(
            r => (r.file_format && r.file_format.toLowerCase() === "pdf") || (r.link && r.link.includes(".pdf"))
          );
          if (pdfResource) {
            pdfLink = pdfResource.link;
          }
        }

        const summary = item.publication_info?.summary || "";
        const yearMatch = summary.match(/\b(19\d\d|20\d\d)\b/);
        const year = yearMatch ? yearMatch[1] : null;

        return {
          title: item.title || "",
          link: item.link || "",
          documentLink: pdfLink || item.link || "",
          pdfLink: pdfLink,
          snippet: item.snippet || summary,
          year: year,
          source: "Google Scholar (SerpApi)",
          authors: summary
        };
      });

      resolve(papers);
    });
  });
}

/**
 * High-level Scholar Search: tries SerpApi first; falls back to Playwright scraper if key is dummy/missing/fails
 */
async function searchScholar(query, startDate = null, endDate = null) {
  const apiKey = process.env.SERPAPI_API_KEY;
  const hasValidApiKey = apiKey && apiKey !== "secret_api_key" && apiKey.trim().length > 0;

  if (hasValidApiKey) {
    try {
      const results = await searchGoogleScholarSerpApi(query, startDate, endDate);
      if (results && results.length > 0) {
        return results;
      }
    } catch (err) {
      console.warn("SerpApi Scholar search failed, falling back to Playwright scraper:", err.message);
    }
  }

  // Fallback to Playwright scraper
  return await scrapeScholarFallback(query, startDate, endDate);
}

module.exports = {
  searchGoogleScholarSerpApi,
  searchScholar
};
