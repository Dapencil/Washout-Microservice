const mongoose = require("mongoose");

const lockerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  branchId: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    default: null,
  },
});

module.exports = lockerSchema;
