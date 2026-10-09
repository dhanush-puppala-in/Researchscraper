const mongoose = require("mongoose");

const researchDocSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    link: {
      type: String,
      required: true
    },

    source: {
      type: String,
      default: "Google Scholar"
    },

    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      required: true
    },

    authors: {
      type: String,
      default: null
    },

    publicationYear: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ResearchDoc", researchDocSchema);