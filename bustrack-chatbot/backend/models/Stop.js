const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  stopCode: { type: String, unique: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
  facilities: { type: String, default: 'Shelter, Seating' }
}, { timestamps: true });

module.exports = mongoose.model('Stop', stopSchema);