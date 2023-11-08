const express = require("express");
const router = express.Router();
const branchService = require("../stub/branchService");
const machineService = require("../stub/machineService");

router.get("/", (req, res) => {
  branchService.getAll(null, (err, data) => {
    if (!err) {
      let branches = data.branches;

      // let results = branches.map(async (branch) => {
      //   machineService.getFromBranch(
      //     { branchId: branches[0].id },
      //     (err, data2) => {
      //       if (!err) {
      //         console.log(data2);
      //       } else {
      //         return;
      //       }
      //     }
      //   ); // res.json(results);
      // });
      res.json(results);
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
