const mongoose = require("mongoose");

const busManagementSchema = mongoose.Schema({
  busNumber: {
    type: String,
    unique: true,
    required: true,
  },
  busName: {
    type: String,
    required: true,
  },
  busType: {
    type: String,
    enum: ["Express", "AC", "Sleeper"],
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  arrivalTime: {
    type: String,
    required: true,
  },
  driverName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Delayed", "Cancelled", "Maintenance"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("BusManagement", busManagementSchema);
