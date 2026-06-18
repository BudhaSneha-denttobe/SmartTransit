const SearchHistory = require('../models/SearchHistory');

exports.saveSearch = async (req, res) => {
  try {
    const { source, destination, filters } = req.body;
    if (!source || !destination) {
      return res.status(400).json({ message: 'Source and destination are required' });
    }
    const entry = await SearchHistory.create({
      user: req.user._id,
      source,
      destination,
      filters: filters || {},
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await SearchHistory.find({ user: req.user._id })
      .sort({ searchedAt: -1 })
      .limit(50)
      .lean();
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    await SearchHistory.deleteMany({ user: req.user._id });
    res.json({ message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
