const Bot = require("../models/bot");

exports.getBots = async (req, res) => {
  const bots = await Bot.find().sort({ createdAt: -1 });
  res.json(bots);
};

exports.getBotById = async (req, res) => {
  const bot = await Bot.findById(req.params.id);
  if (!bot) return res.status(404).json({ message: "Bot not found" });
  res.json(bot);
};

exports.createBot = async (req, res) => {
  const bot = await Bot.create(req.body);
  res.status(201).json(bot);
};

exports.updateBot = async (req, res) => {
  const bot = await Bot.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!bot) return res.status(404).json({ message: "Bot not found" });
  res.json(bot);
};

exports.enableBot = async (req, res) => {
  const bot = await Bot.findByIdAndUpdate(
    req.params.id,
    { isEnabled: true },
    { new: true }
  );
  res.json(bot);
};

exports.disableBot = async (req, res) => {
  const bot = await Bot.findByIdAndUpdate(
    req.params.id,
    { isEnabled: false },
    { new: true }
  );
  res.json(bot);
};

exports.deleteBot = async (req, res) => {
  await Bot.findByIdAndDelete(req.params.id);
  res.json({ message: "Bot deleted" });
};

