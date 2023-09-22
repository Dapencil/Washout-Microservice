const express = require("express");
const router = express.Router();
const lockerService = require("../stub/lockerService");

router.get("/", (req, res) => {
  lockerService.getAll(null, (err, data) => {
    if (!err) {
      res.json(data);
    }
  });
});

router.get("/:id", (req, res) => {
  lockerService.get({ id: req.params.id }, (err, data) => {
    if (!err) {
      res.json(data);
    } else {
      res
        .status(404)
        .json({ error: "Locker item with the given ID not found" });
    }
  });
});

router.post("/", (req, res) => {
  let newLockerItem = {
    branchId: req.body.branchId,
    userId: req.body.userId,
  };

  lockerService.insert(newLockerItem, (err, data) => {
    if (err) throw err;

    console.log("New Locker created successfully", data);
    res.sendStatus(200);
  });
});

router.patch("/", (req, res) => {
  const updateLockerItem = {
    id: req.body.id,
    branchId: req.body.branchId,
    userId: req.body.userId,
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
