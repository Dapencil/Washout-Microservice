const express = require("express");
const router = express.Router();
const auth = require("../middleware/authen");

const machinesRouter = require("./machines");
const branchesRouter = require("./branches");

router.use("/machines", auth("user"));
router.use("/branches", auth("user"));

router.use("/machines", machinesRouter);
router.use("/branches", branchesRouter);

module.exports = router;
