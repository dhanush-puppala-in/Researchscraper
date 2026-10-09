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

async function searchIEEE(query, startDate = null, endDate = null, maxRecords = 25) {
  const apiKey = process.env.IEEE_API_KEY;
  if (!apiKey) {
    throw new Error("IEEE_API_KEY is not configured in .env");
  }

  const startYear = extractYear(startDate);
  const endYear = extractYear(endDate);

  const params = {
    apikey: apiKey,
    querytext: query,
    format: "json",
    max_records: maxRecords
  };

  if (startYear) {
    params.start_year = startYear;
  }
  if (endYear) {
    params.end_year = endYear;
  }

  try {
    const response = await axios.get("https://ieeexploreapi.ieee.org/api/v1/search/articles", {
      params,
      timeout: 15000
    });

    const articles = response.data?.articles || [];

    const papers = articles.map(art => {
      const pdfLink = art.pdf_url || (art.access_type === "OPEN_ACCESS" ? art.pdf_url : null);
      const articleLink = art.html_url || art.pdf_url || `https://doi.org/${art.doi}`;

      return {
        title: art.title || "",
        link: articleLink,
        documentLink: pdfLink || articleLink,
        pdfLink: art.pdf_url || null,
        year: art.publication_year ? String(art.publication_year) : null,
        snippet: art.abstract || "",
        source: "IEEE Xplore",
        doi: art.doi || null,
        authors: Array.isArray(art.authors?.authors)
          ? art.authors.authors.map(a => a.full_name).join(", ")
          : ""
      };
    });

    return papers;
  } catch (error) {
    console.error("IEEE API search error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  searchIEEE
};
