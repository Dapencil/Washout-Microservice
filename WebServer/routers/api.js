const express = require("express");
const router = express.Router();
const auth = require("../middleware/authen");
const axios = require("axios");

const machinesRouter = require("./machines");
const branchesRouter = require("./branches");
const lockersRouter = require("./lockers");
const staffsRouter = require("./staffs");

router.use("/machines", auth("admin"));
router.use("/branches", auth("admin"));
router.use("/staffs", auth("admin"));

router.use("/lockers", auth("staff"));

router.use("/machines", machinesRouter);
router.use("/branches", branchesRouter);
router.use("/lockers", lockersRouter);
router.use("/staffs", staffsRouter);

router.post("/login", (req, res) => {
  axios
    .post("http://localhost:3003/login", req.body, {})
    .then(function (response) {
      console.log(response);
      res.json(response.data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
});

module.exports = router;
