require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const startCron = require("./cron/scrapeCron");
startCron();

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "ResearchNexus API Server is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.use("/api/bots", require("./routes/botRoutes"));
app.use("/api/scrape", require("./routes/scrapeRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
