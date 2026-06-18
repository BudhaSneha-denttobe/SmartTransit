const mongoose = require('mongoose');

const plannerBusSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  routeId: {
    type: String,
    required: true,
    index: true,
  },
  currentLocation: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
  },
  speed: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'inactive', 'delayed', 'maintenance'],
    default: 'active',
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PlannerBus', plannerBusSchema);
