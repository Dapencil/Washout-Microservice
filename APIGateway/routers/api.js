const express = require("express");
const router = express.Router();
const auth = require("../middleware/authen");
const axios = require("axios");

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

router.post("/register", (req, res) => {
  axios
    .post("http://localhost:3003/user", req.body, {})
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
