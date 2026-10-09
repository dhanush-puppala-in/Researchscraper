const { chromium } = require("playwright");
const ResearchDoc = require("../models/paper");

function extractYear(val) {
  if (!val) return null;
  if (typeof val === "number") return val;
  const match = String(val).match(/\b(19\d\d|20\d\d)\b/);
  if (match) return match[1];
  const d = new Date(val);
  if (!isNaN(d.getFullYear())) return d.getFullYear();
  return String(val).trim();
}

async function scrapeScholar(query, startDate = null, endDate = null) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--ignore-certificate-errors",
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120"
  });

  const page = await context.newPage();

  let scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;
  const startYear = extractYear(startDate);
  const endYear = extractYear(endDate);

  if (startYear) {
    scholarUrl += `&as_ylo=${encodeURIComponent(startYear)}`;
  }
  if (endYear) {
    scholarUrl += `&as_yhi=${encodeURIComponent(endYear)}`;
  }

  await page.goto(scholarUrl, { waitUntil: "domcontentloaded" });

  await page.waitForTimeout(4000);

  const results = await page.evaluate(() => {
    const papers = [];

    const entries = document.querySelectorAll(".gs_r");

    entries.forEach(entry => {
      const titleEl = entry.querySelector("h3.gs_rt a");
      const titleTextEl = entry.querySelector("h3.gs_rt");
      const pdfEl = entry.querySelector(".gs_or_ggsm a");
      const snippetEl = entry.querySelector(".gs_a");
      const abstractEl = entry.querySelector(".gs_rs");

      const title = titleEl ? titleEl.innerText : (titleTextEl ? titleTextEl.innerText : "");
      const paperLink = titleEl ? titleEl.href : (pdfEl ? pdfEl.href : null);
      const pdfLink = pdfEl && pdfEl.href ? pdfEl.href : (paperLink && paperLink.includes(".pdf") ? paperLink : null);
      const snippet = [
        snippetEl ? snippetEl.innerText : "",
        abstractEl ? abstractEl.innerText : ""
      ].filter(Boolean).join(" - ");

      const yearMatch = snippet.match(/\b(19\d\d|20\d\d)\b/);
      const year = yearMatch ? yearMatch[1] : null;

      if (title && (paperLink || pdfLink)) {
        papers.push({
          title: title.replace(/^\[(PDF|HTML|BOOK|CITATION)\]\s*/i, ""),
          link: paperLink || pdfLink,
          documentLink: pdfLink || paperLink,
          pdfLink: pdfLink,
          year,
          snippet,
          source: "Google Scholar"
        });
      }
    });

    return papers;
  });

  await browser.close();
  return results;
}

async function scrapeBot(bot) {
  const startDate = bot.startDate || bot.startYear;
  const endDate = bot.endDate || bot.endYear;
  const results = await scrapeScholar(bot.searchQuery, startDate, endDate);

  if (results && results.length) {
    const docs = results.map(r => ({
      title: r.title,
      link: r.link || r.documentLink,
      source: "Google Scholar",
      publicationYear: extractYear(r.year) ? parseInt(extractYear(r.year), 10) : null,
      authors: r.snippet || null,
      botId: bot._id
    }));
    await ResearchDoc.insertMany(docs, { ordered: false });
  }
  return results;
}

module.exports = scrapeScholar;
module.exports.scrapeScholar = scrapeScholar;
module.exports.scrapeBot = scrapeBot;

