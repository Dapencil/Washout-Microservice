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
  userId: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Locker", lockerSchema);
