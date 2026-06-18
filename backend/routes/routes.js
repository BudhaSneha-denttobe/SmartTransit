const express = require('express');
const router = express.Router();
const {
  searchRoutes,
  getRouteByNumber,
  getAllRoutes,
} = require('../controllers/routeController');

router.get('/search', searchRoutes);
router.get('/', getAllRoutes);
router.get('/:busNumber', getRouteByNumber);

module.exports = router;
