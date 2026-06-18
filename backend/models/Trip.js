const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  tripId: {
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
  serviceId: String,
  tripHeadsign: String,
  directionId: String,
  blockId: String,
  shapeId: {
    type: String,
    index: true,
  },
});

module.exports = mongoose.model('Trip', tripSchema);
