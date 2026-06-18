const mongoose = require('mongoose');

const shapeSchema = new mongoose.Schema({
  shapeId: {
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
  sequence: {
    type: Number,
    required: true,
  },
});

shapeSchema.index({ shapeId: 1, sequence: 1 });

module.exports = mongoose.model('Shape', shapeSchema);
