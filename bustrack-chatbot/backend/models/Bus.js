const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  driverName: { type: String, required: true },
  capacity: { type: Number, default: 50 },
  status: { type: String, enum: ['active', 'inactive', 'delayed'], default: 'active' },
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);