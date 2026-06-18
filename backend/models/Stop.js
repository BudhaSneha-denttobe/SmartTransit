const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  stopId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  stopCode: String,
  stopName: {
    type: String,
    required: true,
    index: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  locationType: String,
  parentStation: String,
  timezone: String,
  wheelchairBoarding: String,
});

module.exports = mongoose.model('Stop', stopSchema);
