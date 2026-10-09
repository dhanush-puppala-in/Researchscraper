const router = require("express").Router();
const exportCtrl = require("../controller/exportController");

router.get("/csv", exportCtrl.exportCSV);
router.get("/pdf", exportCtrl.exportPDF);
router.get("/papers", exportCtrl.getPapers);

module.exports = router;
