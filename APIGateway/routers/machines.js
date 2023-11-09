const express = require("express");
const router = express.Router();
const machineService = require("../stub/machineService");
const branchService = require("../stub/branchService");

// required?
router.get("/", (req, res) => {
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
        }
      });
    }
  });
});

// required?
router.get("/machineId/:id", (req, res) => {
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

router.get("/branchId/:branchId", (req, res) => {
  machineService.getFromBranch(
    { branchId: req.params.branchId },
    (err, data) => {
      if (!err) {
        res.json(data);
      } else {
        res
          .status(404)
          .json({ error: "Machine item with the given ID not found" });
      }
    }
  );
});

router.get("/start", (req, res) => {
  machineService.start(
    { machineId: req.body.machineId, userId: req.body.userId },
    (err, data) => {
      if (!err) {
        res.json(data);
      } else {
        res.status(404).json({ err });
      }
    }
  );
});

// router.post("/", (req, res) => {
//   let newMachineItem = {
//     branchId: req.body.branchId,
//     machineType: req.body.machineType,
//   };

//   machineService.insert(newMachineItem, (err, data) => {
//     if (err) throw err;

//     console.log("New Machine created successfully", data);
//     res.sendStatus(200);
//   });
// });

// router.patch("/:id", (req, res) => {
//   const updateMachineItem = {
//     id: req.body.id,
//     branchId: req.body.branchId,
//     machineType: req.body.machineType,
//   };

//   machineService.update(updateMachineItem, (err, data) => {
//     if (err) throw err;

//     console.log("Machine Item updated successfully", data);
//     res.json(data);
//   });
// });

// router.delete("/:id", (req, res) => {
//   machineService.remove({ id: req.params.id }, (err, _) => {
//     if (err)
//       res
//         .status(404)
//         .json({ error: "Machine item with the given ID not found" });
//     console.log("Machine Item removed successfully");
//     res.sendStatus(200);
//   });
// });

module.exports = router;
