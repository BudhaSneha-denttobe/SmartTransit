const express = require('express');
const router = express.Router();
const {
  searchStops,
  getStopById,
  getAllStops,
  geocodeLocation,
  findNearbyStops,
  getStopArrivals,
} = require('../controllers/stopController');

router.get('/search', searchStops);
router.get('/', getAllStops);
router.post('/geocode', geocodeLocation);
router.post('/nearby', findNearbyStops);
router.get('/:stopId/arrivals', getStopArrivals);
router.get('/:stopId', getStopById);

module.exports = router;
