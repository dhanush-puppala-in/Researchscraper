const axios = require("axios");

function parseDateBounds(startDate, endDate) {
  let from = null;
  let until = null;

  if (startDate) {
    const yr = String(startDate).match(/\b(19\d\d|20\d\d)\b/);
    if (yr) from = `${yr[1]}-01-01`;
  }
  if (endDate) {
    const yr = String(endDate).match(/\b(19\d\d|20\d\d)\b/);
    if (yr) until = `${yr[1]}-12-31`;
  }
  return { from, until };
}

/**
 * Search Crossref Works API (Over 150 Million Papers - Nature, IEEE, Springer, Wiley, ACM)
 */
async function searchCrossref(query, startDate = null, endDate = null, rows = 15) {
  try {
    const { from, until } = parseDateBounds(startDate, endDate);
    const filterParts = [];
    if (from) filterParts.push(`from-pub-date:${from}`);
    if (until) filterParts.push(`until-pub-date:${until}`);

    const params = {
      query: query.trim(),
      rows: rows,
      sort: "relevance"
    };

    if (filterParts.length > 0) {
      params.filter = filterParts.join(",");
    }

    const response = await axios.get("https://api.crossref.org/works", {
      params,
      timeout: 10000,
      headers: {
        "User-Agent": "ResearchNexus/1.0 (mailto:academic-research@nexus.org)"
      }
    });

    const items = response.data?.message?.items || [];

    return items
      .filter(item => item.title && item.title.length > 0)
      .map(item => {
        const title = Array.isArray(item.title) ? item.title[0] : item.title;
        const link = item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : null);
        const year =
          item["published-print"]?.["date-parts"]?.[0]?.[0] ||
          item["published-online"]?.["date-parts"]?.[0]?.[0] ||
          item["created"]?.["date-parts"]?.[0]?.[0] ||
          null;

        const authors = Array.isArray(item.author)
          ? item.author.map(a => [a.given, a.family].filter(Boolean).join(" ")).filter(Boolean).join(", ")
          : "";

        const publisher = item.publisher ? `Publisher: ${item.publisher}` : "";
        const container = Array.isArray(item["container-title"]) && item["container-title"][0] ? item["container-title"][0] : "";
        const snippet = [container, publisher].filter(Boolean).join(" | ");

        return {
          title: title.replace(/<[^>]*>?/gm, ""),
          link: link,
          documentLink: link,
          pdfLink: item.link?.find(l => l["content-type"] === "application/pdf")?.URL || null,
          year: year ? String(year) : null,
          snippet: snippet,
          source: container.includes("IEEE") ? "IEEE (Crossref)" : "Crossref Academic",
          authors: authors,
          doi: item.DOI || null
        };
      });
  } catch (error) {
    console.warn("Crossref search notice:", error.message);
    return [];
  }
}

module.exports = {
  searchCrossref
};
