const express = require("express");
const router = express.Router();
const orderService = require("../stub/orderService");

router.get("/", (req, res) => {
  orderService.getAll(null, (err, data) => {
    if (!err) {
      res.json(data);
    }
  });
});

router.get("/:id", (req, res) => {
  orderService.get({ id: req.params.id }, (err, data) => {
    if (!err) {
      res.json(data);
    } else {
      res.status(404).json({ error: "Order item with the given ID not found" });
    }
  });
});

router.post("/", (req, res) => {
  let newOrderItem = {
    userId: req.body.userId,
    machineId: req.body.machineId,
    timestamp: req.body.timestamp,
  };

  orderService.insert(newOrderItem, (err, data) => {
    if (err) throw err;

    console.log("New Order created successfully", data);
    res.sendStatus(200);
  });
});

router.patch("/", (req, res) => {
  const updateOrderItem = {
    id: req.body.id,
    userId: req.body.userId,
    machineId: req.body.machineId,
    timestamp: req.body.timestamp,
  };

  orderService.update(updateOrderItem, (err, data) => {
    if (err) throw err;

    console.log("Order Item updated successfully", data);
    res.json(data);
  });
});

router.delete("/:id", (req, res) => {
  orderService.remove({ id: req.params.id }, (err, _) => {
    if (err)
      res.status(404).json({ error: "Order item with the given ID not found" });
    console.log("Order Item removed successfully");
    res.sendStatus(200);
  });
});

module.exports = router;
