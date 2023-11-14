const express = require("express");
const router = express.Router();
const auth = require("../middleware/authen");
const axios = require("axios");
const AUTH_URL = process.env.AUTH_URL || "http://localhost:3003/";

const machinesRouter = require("./machines");
const branchesRouter = require("./branches");
const lockersRouter = require("./lockers");
const staffsRouter = require("./staffs");

router.use("/machines");
router.use("/branches", auth("admin"));
router.use("/staffs", auth("admin"));

router.use("/lockers", auth("staff"));

router.use("/machines", machinesRouter);
router.use("/branches", branchesRouter);
router.use("/lockers", lockersRouter);
router.use("/staffs", staffsRouter);

router.post("/login", (req, res) => {
  axios
    .post(AUTH_URL + "login", req.body, {})
    .then(function (response) {
      console.log(response.data);
      res.json(response.data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
});

module.exports = router;
