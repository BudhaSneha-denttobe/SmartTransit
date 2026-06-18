const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  source: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  filters: {
    directOnly: String,
    maxTransfers: String,
    busType: String,
    fareMin: String,
    fareMax: String,
    arrivalBefore: String,
    sortBy: String,
  },
  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

searchHistorySchema.index({ user: 1, searchedAt: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
