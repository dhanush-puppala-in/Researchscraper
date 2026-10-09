require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Initialize MongoDB connection
connectDB();

const app = express();

// Full CORS support for Netlify / localhost
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"]
  })
);

app.use(express.json());

const startCron = require("./cron/scrapeCron");
startCron();

// Root & Health Check Routes
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "ResearchNexus API Server is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    mongodb: require("mongoose").connection.readyState === 1 ? "connected" : "connecting/disconnected",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/bots", require("./routes/botRoutes"));
app.use("/api/scrape", require("./routes/scrapeRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
