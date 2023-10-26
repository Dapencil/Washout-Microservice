const express = require("express");
const router = express.Router();

const machinesRouter = require("./machines");
const branchesRouter = require("./branches");
const lockersRouter = require("./lockers");

router.use("/machines", machinesRouter);
router.use("/branches", branchesRouter);
router.use("/lockers", lockersRouter);

module.exports = router;
