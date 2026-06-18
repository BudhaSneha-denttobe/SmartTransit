const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const {
  getDashboard,
  getUsers,
  deleteUser,
  createRoute,
  updateRoute,
  deleteRoute,
  createStop,
  updateStop,
  deleteStop,
  getSimulatedBuses,
} = require('../controllers/adminController');
const { getAllRoutes } = require('../controllers/routeController');
const { getAllStops } = require('../controllers/stopController');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

router.get('/routes', getAllRoutes);
router.post('/routes', createRoute);
router.put('/routes/:routeId', updateRoute);
router.delete('/routes/:routeId', deleteRoute);

router.get('/stops', getAllStops);
router.post('/stops', createStop);
router.put('/stops/:stopId', updateStop);
router.delete('/stops/:stopId', deleteStop);

router.get('/buses', getSimulatedBuses);

module.exports = router;
