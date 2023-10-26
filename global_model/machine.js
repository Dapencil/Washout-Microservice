const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  machineType: {
    type: String,
    required: true,
  },
  branchId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "available",
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  remainingTime: {
    type: Number,
    default: 0,
  },
  currentOrder: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Machine", machineSchema);
