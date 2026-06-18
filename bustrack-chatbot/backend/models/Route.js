const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeNumber: { type: String, required: true, unique: true },
  routeName: { type: String, required: true },
  startPoint: { type: String, required: true },
  endPoint: { type: String, required: true },
  stops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stop' }],
  totalDistance: { type: Number },
  estimatedTime: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);