const cron = require("node-cron");
const Bot = require("../models/bot");
const ResearchDoc = require("../models/paper");
const { runScrapeForBot } = require("../services/paperService");

function parseYear(val) {
  if (!val) return null;
  if (typeof val === "number") return val;
  const match = String(val).match(/\b(19\d\d|20\d\d)\b/);
  if (match) return parseInt(match[1], 10);
  const d = new Date(val);
  if (!isNaN(d.getFullYear())) return d.getFullYear();
  return null;
}

const startCron = () => {
  const schedule = process.env.CRON_SCHEDULE || "0 * * * *";
  console.log(`Initializing scraper cron job with schedule: ${schedule}`);

  cron.schedule(schedule, async () => {
    console.log("Running scheduled multi-source paper scraping...");

    try {
      const bots = await Bot.find({
        $or: [{ isEnabled: true }, { status: "enabled" }]
      });

      console.log(`Found ${bots.length} active bot(s) to execute.`);

      for (const bot of bots) {
        try {
          console.log(`Scraping for bot "${bot.name}" (query: "${bot.searchQuery}", source: "${bot.source || 'all'}")`);
          const papers = await runScrapeForBot(bot);
          if (papers && papers.length > 0) {
            const documents = papers
              .filter(p => p && p.title && (p.link || p.documentLink))
              .map(p => ({
                title: p.title,
                link: p.link || p.documentLink,
                source: p.source || "Google Scholar",
                authors: p.authors || p.snippet || null,
                publicationYear: parseYear(p.year || p.publicationYear),
                botId: bot._id
              }));

            if (documents.length > 0) {
              await ResearchDoc.insertMany(documents, { ordered: false });
              console.log(`Saved ${documents.length} papers for bot "${bot.name}"`);
            }
          }
        } catch (botErr) {
          console.error(`Error processing bot ${bot._id} (${bot.name}):`, botErr.message);
        }
      }
    } catch (err) {
      console.error("Cron job execution error:", err.message);
    }
  });
};

module.exports = startCron;
