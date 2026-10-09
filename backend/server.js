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

app.use("/api/bots", require("./routes/botRoutes"));
app.use("/api/scrape", require("./routes/scrapeRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
