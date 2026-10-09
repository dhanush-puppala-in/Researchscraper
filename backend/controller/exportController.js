const ResearchDoc = require("../models/paper");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

/* =======================
   EXPORT AS CSV
======================= */
exports.exportCSV = async (req, res) => {
  try {
    const docs = await ResearchDoc.find().lean();

    if (!docs.length) {
      return res.status(404).json({ message: "No data found" });
    }

    const fields = [
      "title",
      "link",
      "source",
      "authors",
      "publicationYear",
      "createdAt"
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(docs);

    res.header("Content-Type", "text/csv");
    res.attachment("research_docs.csv");
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =======================
   EXPORT AS PDF
======================= */
exports.exportPDF = async (req, res) => {
  try {
    const docs = await ResearchDoc.find().limit(50);

    if (!docs.length) {
      return res.status(404).json({ message: "No data found" });
    }

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=research_docs.pdf"
    );

    doc.pipe(res);

    doc.fontSize(18).text("Research Documents", { align: "center" });
    doc.moveDown();

    docs.forEach((item, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${item.title || "Untitled"}`, { underline: true });

      if (item.authors) {
        doc.fontSize(10).text(`Authors: ${item.authors}`);
      }

      doc
        .fontSize(10)
        .text(`Source: ${item.source || "Google Scholar"}`)
        .text(`Year: ${item.publicationYear || "N/A"}`)
        .text(`Link: ${item.link || "N/A"}`)
        .text(`Date: ${item.createdAt ? item.createdAt.toDateString() : new Date().toDateString()}`);

      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =======================
   LIST / FILTER PAPERS
======================= */
exports.getPapers = async (req, res) => {
  try {
    const { source, year, startDate, endDate, q, botId } = req.query;
    const filter = {};

    if (source && source !== "all") {
      filter.source = new RegExp(source, "i");
    }

    if (botId) {
      filter.botId = botId;
    }

    if (year) {
      filter.publicationYear = Number(year);
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { authors: new RegExp(q, "i") }
      ];
    }

    const docs = await ResearchDoc.find(filter).sort({ createdAt: -1 });
    res.json({
      count: docs.length,
      papers: docs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};