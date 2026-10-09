const axios = require("axios");

function extractYear(val) {
  if (!val) return null;
  if (typeof val === "number") return val;
  const match = String(val).match(/\b(19\d\d|20\d\d)\b/);
  if (match) return parseInt(match[1], 10);
  const d = new Date(val);
  if (!isNaN(d.getFullYear())) return d.getFullYear();
  return null;
}

/**
 * Search arXiv API (Public, No Key Required, 100% Reliable in Cloud)
 */
async function searchArxiv(query, startDate = null, endDate = null, maxResults = 20) {
  const startYear = extractYear(startDate);
  const endYear = extractYear(endDate);

  try {
    const formattedQuery = encodeURIComponent(query.trim());
    const url = `http://export.arxiv.org/api/query?search_query=all:${formattedQuery}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

    const response = await axios.get(url, { timeout: 10000 });
    const xml = response.data || "";

    const entries = xml.split("<entry>").slice(1);
    const papers = [];

    for (const entry of entries) {
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
      const idMatch = entry.match(/<id>(.*?)<\/id>/);

      const title = titleMatch ? titleMatch[1].replace(/\n/g, " ").trim() : "";
      const summary = summaryMatch ? summaryMatch[1].replace(/\n/g, " ").trim() : "";
      const published = publishedMatch ? publishedMatch[1].trim() : "";
      const rawId = idMatch ? idMatch[1].trim() : "";

      const pubYear = published ? new Date(published).getFullYear() : null;

      // Filter by year if specified
      if (startYear && pubYear && pubYear < startYear) continue;
      if (endYear && pubYear && pubYear > endYear) continue;

      // Author names
      const authorMatches = [...entry.matchAll(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g)];
      const authors = authorMatches.map(m => m[1]).join(", ");

      const arxivId = rawId.split("/abs/").pop() || rawId;
      const pdfLink = arxivId ? `https://arxiv.org/pdf/${arxivId}.pdf` : null;

      if (title && rawId) {
        papers.push({
          title,
          link: rawId,
          documentLink: pdfLink || rawId,
          pdfLink: pdfLink,
          year: pubYear ? String(pubYear) : null,
          snippet: summary.substring(0, 300) + (summary.length > 300 ? "..." : ""),
          source: "arXiv (Open Access)",
          authors: authors
        });
      }
    }

    return papers;
  } catch (error) {
    console.warn("arXiv API search notice:", error.message);
    return [];
  }
}

module.exports = {
  searchArxiv
};
