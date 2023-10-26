const express = require("express");
const router = express.Router();
const machineService = require("./stub/machineService");
const branchService = require("./stub/branchService");

router.get("/", (req, res) => {
  machineService.getAll(null, (err, machines) => {
    if (!err) {
      branchS;
    }
  });
});

router.get("/:id", (req, res) => {
  machineService.get({ id: req.params.id }, (err, data) => {
    if (!err) {
      res.json(data);
    } else {
      res
        .status(404)
        .json({ error: "Machine item with the given ID not found" });
    }
  });
});

router.post("/", (req, res) => {
  let newMachineItem = {
    branchId: req.body.branchId,
    status: req.body.status,
    type: req.body.type,
  };

  machineService.insert(newMachineItem, (err, data) => {
    if (err) throw err;

    console.log("New Machine created successfully", data);
    res.sendStatus(200);
  });
});

router.patch("/:id", (req, res) => {
  const updateMachineItem = {
    id: req.body.id,
    branchId: req.body.branchId,
    status: req.body.status,
    type: req.body.type,
  };

  machineService.update(updateMachineItem, (err, data) => {
    if (err) throw err;

    console.log("Machine Item updated successfully", data);
    res.json(data);
  });
});

router.delete("/:id", (req, res) => {
  machineService.remove({ id: req.params.id }, (err, _) => {
    if (err)
      res
        .status(404)
        .json({ error: "Machine item with the given ID not found" });
    console.log("Machine Item removed successfully");
    res.sendStatus(200);
  });
});

module.exports = router;
