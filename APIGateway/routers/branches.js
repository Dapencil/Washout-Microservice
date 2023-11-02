const express = require("express");
const router = express.Router();
const branchService = require("../stub/branchService");

router.get("/", (req, res) => {
  branchService.getAll(null, (err, data) => {
    if (!err) {
      res.json(data);
    }
  });
});

router.get("/:id", (req, res) => {
  branchService.get({ id: req.params.id }, (err, data) => {
    if (!err) {
      res.json(data);
    } else {
      res
        .status(404)
        .json({ error: "Branch item with the given ID not found" });
    }
  });
});

module.exports = router;
