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
 * Search OpenAlex Works API (250 Million Open Access Papers)
 */
async function searchOpenAlex(query, startDate = null, endDate = null, perPage = 15) {
  try {
    const startYear = extractYear(startDate);
    const endYear = extractYear(endDate);

    const filterParts = [];
    if (startYear && endYear) {
      filterParts.push(`publication_year:${startYear}-${endYear}`);
    } else if (startYear) {
      filterParts.push(`from_publication_date:${startYear}-01-01`);
    } else if (endYear) {
      filterParts.push(`to_publication_date:${endYear}-12-31`);
    }

    const params = {
      search: query.trim(),
      per_page: perPage
    };

    if (filterParts.length > 0) {
      params.filter = filterParts.join(",");
    }

    const response = await axios.get("https://api.openalex.org/works", {
      params,
      timeout: 10000,
      headers: {
        "User-Agent": "ResearchNexus/1.0 (mailto:team@researchnexus.ai)"
      }
    });

    const results = response.data?.results || [];

    return results
      .filter(w => w.title)
      .map(w => {
        const landingPage = w.primary_location?.landing_page_url || w.doi || w.id;
        const pdfUrl = w.primary_location?.pdf_url || w.open_access?.oa_url || null;
        const authors = Array.isArray(w.authorships)
          ? w.authorships.map(a => a.author?.display_name).filter(Boolean).slice(0, 5).join(", ")
          : "";

        return {
          title: w.title,
          link: landingPage || pdfUrl,
          documentLink: pdfUrl || landingPage,
          pdfLink: pdfUrl,
          year: w.publication_year ? String(w.publication_year) : null,
          snippet: w.abstract_inverted_index ? "Abstract available on publisher site" : (w.primary_location?.source?.display_name || ""),
          source: w.primary_location?.source?.display_name ? `OpenAlex (${w.primary_location.source.display_name})` : "OpenAlex Academic",
          authors: authors,
          doi: w.doi ? w.doi.replace("https://doi.org/", "") : null
        };
      });
  } catch (error) {
    console.warn("OpenAlex search notice:", error.message);
    return [];
  }
}

module.exports = {
  searchOpenAlex
};
