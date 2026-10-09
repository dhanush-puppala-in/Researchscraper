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
 * Search Semantic Scholar Graph API
 */
async function searchSemanticScholar(query, startDate = null, endDate = null, limit = 20) {
  const startYear = extractYear(startDate);
  const endYear = extractYear(endDate);

  const params = {
    query,
    limit,
    fields: "title,url,openAccessPdf,authors,year,abstract,externalIds"
  };

  if (startYear && endYear) {
    params.year = `${startYear}-${endYear}`;
  } else if (startYear) {
    params.year = `${startYear}-2026`;
  } else if (endYear) {
    params.year = `1900-${endYear}`;
  }

  try {
    const response = await axios.get("https://api.semanticscholar.org/graph/v1/paper/search", {
      params,
      timeout: 10000,
      headers: {
        "User-Agent": "ResearchNexus/1.0 (Academic Paper Discovery)"
      }
    });

    const papersData = response.data?.data || [];

    return papersData.map(paper => {
      const pdfLink = paper.openAccessPdf?.url || null;
      const articleLink = paper.url || pdfLink || (paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : null);
      const authors = Array.isArray(paper.authors) ? paper.authors.map(a => a.name).join(", ") : "";

      return {
        title: paper.title || "",
        link: articleLink || pdfLink || "",
        documentLink: pdfLink || articleLink || "",
        pdfLink: pdfLink,
        year: paper.year ? String(paper.year) : null,
        snippet: paper.abstract || "",
        source: "Semantic Scholar",
        authors: authors,
        doi: paper.externalIds?.DOI || null
      };
    });
  } catch (error) {
    console.warn("Semantic Scholar API search notice:", error.response?.data?.message || error.message);
    return [];
  }
}

module.exports = {
  searchSemanticScholar
};
