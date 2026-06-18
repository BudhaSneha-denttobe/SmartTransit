const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  message: { type: String, required: true },
  reply: { type: String, required: true },
  intent: { type: String, default: 'general' }
}, { timestamps: true });

module.exports = mongoose.model('ChatLog', chatLogSchema);