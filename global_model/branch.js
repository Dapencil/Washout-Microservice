const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  telNum: {
    type: String,
  },
});

module.exports = mongoose.model("Branch", branchSchema);
