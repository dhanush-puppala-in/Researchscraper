const mongoose = require("mongoose");

const botSchema = new mongoose.Schema(
  {
    name: String,
    searchQuery: String,
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    startYear: { type: Number, default: null },
    endYear: { type: Number, default: null },
    source: {
      type: String,
      enum: ["all", "google_scholar", "ieee"],
      default: "all"
    },
    isEnabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bot", botSchema);
