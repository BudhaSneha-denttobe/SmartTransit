const mongoose = require('mongoose');

const stopTimeSchema = new mongoose.Schema({
  tripId: {
    type: String,
    required: true,
    index: true,
  },
  arrivalTime: {
    type: String,
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  stopId: {
    type: String,
    required: true,
    index: true,
  },
  stopSequence: {
    type: Number,
    required: true,
  },
  pickupType: String,
  dropOffType: String,
});

stopTimeSchema.index({ tripId: 1, stopSequence: 1 });

module.exports = mongoose.model('StopTime', stopTimeSchema);
