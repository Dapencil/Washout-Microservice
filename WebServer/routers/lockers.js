const express = require("express");
const router = express.Router();
const lockerService = require("../stub/lockerService");
const machineService = require("../stub/machineService");
const { default: axios } = require("axios");

router.get("/:branchId", async (req, res) => {
  lockerService.GetFromBranch({ id: req.params.branchId }, (err, data) => {
    if (!err) {
      res.json(data);
    } else {
      res
        .status(404)
        .json({ error: "Locker item with the branch ID not found" });
    }
  });
});

router.put("/:id", (req, res) => {
  const updaterLockerItem = {
    id: req.params.id,
    branchId: req.body.branchId,
    orderId: req.body.orderId,
  };
  lockerService.update(updaterLockerItem, (err, data) => {
    if (!err) {
      console.log("Update Locker", data);
      res.json(data);
    } else {
      res.status(400).json({ err });
    }
  });
});

router.put("/moveClothes", (req, res) => {
  const updateLockerItem = {
    machineId: req.body.machineId,
    lockerId: req.body.lockerId,
  };
  lockerService.moveClothes(updateLockerItem, (err, data) => {
    if (!err) {
      console.log("Locker Item updated successfully", data);
      res.json(data);
    } else {
      res.status(400).json({ err });
    }
  });
});

// -----THIS SECTION IS FOR DEVELOPMENT----- //
// router.get("/:id", (req, res) => {
//   lockerService.get({ id: req.params.id }, (err, data) => {
//     if (!err) {
//       res.json(data);
//     } else {
//       res
//         .status(404)
//         .json({ error: "Locker item with the given ID not found" });
//     }
//   });
// });

router.post("/", (req, res) => {
  let newLockerItem = {
    branchId: req.body.branchId,
    orderId: "no order",
  };

  lockerService.insert(newLockerItem, (err, data) => {
    if (err) throw err;
    console.log("New Locker created successfully", data);
    res.sendStatus(200);
  });
});

router.patch("/:id", (req, res) => {
  const updateLockerItem = {
    id: req.params.id,
    branchId: req.body.branchId,
    orderId: req.body.orderId,
  };

  lockerService.update(updateLockerItem, (err, data) => {
    if (err) throw err;

    console.log("Locker Item updated successfully", data);
    res.json(data);
  });
});

router.delete("/:id", (req, res) => {
  lockerService.remove({ id: req.params.id }, (err, _) => {
    if (err)
      res
        .status(404)
        .json({ error: "Locker item with the given ID not found" });
    console.log("Locker Item removed successfully");
    res.sendStatus(200);
  });
});

module.exports = router;
