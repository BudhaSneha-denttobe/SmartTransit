const express = require('express');
const router = express.Router();
const { saveSearch, getHistory, clearHistory } = require('../controllers/searchHistoryController');
const { protect } = require('../middleware/auth');

router.post('/', protect, saveSearch);
router.get('/', protect, getHistory);
router.delete('/', protect, clearHistory);

module.exports = router;
