const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  agencyId: String,
  routeNumber: {
    type: String,
    required: true,
    index: true,
  },
  routeName: {
    type: String,
    default: '',
  },
  routeType: String,
  routeColor: String,
  routeTextColor: String,
});

module.exports = mongoose.model('Route', routeSchema);
