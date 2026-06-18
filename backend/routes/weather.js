const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');
const { getRouteWeather } = require('../controllers/routeWeatherController');

router.get('/', getWeather);
router.post('/route', getRouteWeather);

module.exports = router;
