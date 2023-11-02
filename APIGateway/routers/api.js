const express = require("express");
const router = express.Router();
const auth = require("../middleware/authen");

const machinesRouter = require("./machines");
const branchesRouter = require("./branches");
const usersRouter = require("./users");
const ordersRouter = require("./orders");

router.use("/machines", auth("user"));
router.use("/branches", auth("user"));
router.use("/users", auth("user"));
router.use("/orders", auth("user"));

router.use("/machines", machinesRouter);
router.use("/branches", branchesRouter);
router.use("/users", usersRouter);
router.use("/orders", ordersRouter);

module.exports = router;
