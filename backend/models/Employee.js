const mongoose = require("mongoose");

const employeeSchema = mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  officialEmail: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Employee", employeeSchema);
