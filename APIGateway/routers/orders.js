const express = require("express");
const router = express.Router();
const orderService = require("../stub/orderService");

router.get("/:userId", (req, res) => {
  orderService.getRecentOrder({ userId: req.params.userId }, (err, data) => {
    if (!err) {
      res.json(data.orders.map((item) => item.id));
    } else {
      res.status(404).json({ error: "You don't have any order right now !" });
    }
  });
});

module.exports = router;
