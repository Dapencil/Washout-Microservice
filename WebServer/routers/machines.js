const express = require("express");
const router = express.Router();
const machineService = require("../stub/machineService");
const branchService = require("../stub/branchService");

router.get("/", (req, res) => {
  console.log("Got Request to Machine");
  machineService.getAll(null, (err, data1) => {
    if (!err) {
      branchService.getAll(null, (err2, data2) => {
        if (!err2) {
          let branches = data2.branches.reduce((map, branch) => {
            map[branch.id] = branch.name;
            return map;
          }, {});
          let machines = data1.machines.map((machine) => ({
            id: machine.id,
            machineType: machine.machineType,
            branchId: machine.branchId,
            branchName: branches[machine.branchId],
          }));
          res.json(machines);
        } else {
          res.status(500);
        }
      });
    } else {
      res.status(500);
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
    machineType: req.body.machineType,
  };

  machineService.insert(newMachineItem, (err, data) => {
    if (err) throw err;

    console.log("New Machine created successfully", data);
    res.sendStatus(200);
  });
});

router.patch("/:id", (req, res) => {
  const updateMachineItem = {
    id: req.params.id,
    branchId: req.body.branchId,
    machineType: req.body.machineType,
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
