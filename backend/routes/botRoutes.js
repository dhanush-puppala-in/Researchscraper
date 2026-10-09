const router = require("express").Router();
const bot = require("../controller/botController");

router.get("/", bot.getBots);
router.get("/:id", bot.getBotById);
router.post("/", bot.createBot);
router.put("/:id", bot.updateBot);
router.put("/:id/enable", bot.enableBot);
router.put("/:id/disable", bot.disableBot);
router.delete("/:id", bot.deleteBot);

module.exports = router;
