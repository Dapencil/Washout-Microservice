const express = require("express");
const router = express.Router();
const auth = require("../middleware/authen");

const machinesRouter = require("./machines");
const branchesRouter = require("./branches");
const lockersRouter = require("./lockers");

router.use("/machines", auth("admin"));
router.use("/branches", auth("admin"));
// router.use("/staffs", auth("admin"));

router.use("/lockers", auth("staff"));

router.use("/machines", machinesRouter);
router.use("/branches", branchesRouter);
router.use("/lockers", lockersRouter);

module.exports = router;
