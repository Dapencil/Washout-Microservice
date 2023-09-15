const express = require("express");
const router = express.Router();

const machinesRouter = require("./machines");
const branchesRouter = require("./branches");

router.use("/machines", machinesRouter);
router.use("/branches", branchesRouter);

module.exports = router;
