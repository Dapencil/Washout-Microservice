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
    }
  });
});

router.post("/", (req, res) => {
  let newBranchItem = {
    name: req.body.name,
    address: req.body.address,
    telNum: req.body.telNum,
  };

  branchService.insert(newBranchItem, (err, data) => {
    if (err) throw err;

    console.log("New Branch created successfully", data);
    res.sendStatus(200);
  });
});

router.patch("/", (req, res) => {
  const updateBranchItem = {
    id: req.body.id,
    name: req.body.name,
    address: req.body.address,
    telNum: req.body.telNum,
  };

  branchService.update(updateBranchItem, (err, data) => {
    if (err) throw err;

    console.log("Branch Item updated successfully", data);
    res.json(data);
  });
});

router.delete("/:id", (req, res) => {
  branchService.remove({ id: req.params.id }, (err, _) => {
    if (err) throw err;
    console.log("Branch Item removed successfully");
    res.sendStatus(200);
  });
});

module.exports = router;
