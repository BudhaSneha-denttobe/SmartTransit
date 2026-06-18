const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  daysOfOperation: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  status: { type: String, enum: ['on-time', 'delayed', 'cancelled'], default: 'on-time' }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);