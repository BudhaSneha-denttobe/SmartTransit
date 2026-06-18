const express = require('express');
const router = express.Router();
const {
  searchRoutes,
  getRouteDetail,
  getBusesByRoute,
  getAllRoutes,
} = require('../controllers/routePlannerController');

router.get('/search', searchRoutes);
router.get('/', getAllRoutes);
router.get('/:id', getRouteDetail);
router.get('/:routeId/buses', getBusesByRoute);

module.exports = router;
