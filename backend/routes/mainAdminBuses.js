const express = require('express');
const { protect } = require('../middleware/auth');
const { addBus, deleteBus, getBusByNumber } = require('../controllers/adminBusController');
const Route = require('../models/Route');
const router = express.Router();

router.use(protect);

const adminCheck = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Not authorized as admin' });
};

router.get('/', adminCheck, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { routeNumber: { $regex: search, $options: 'i' } },
        { routeName: { $regex: search, $options: 'i' } },
      ];
    }
    const routes = await Route.find(query).sort({ routeNumber: 1 }).lean();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/add', adminCheck, addBus);
router.get('/number/:busNumber', adminCheck, getBusByNumber);
router.delete('/:id', adminCheck, deleteBus);

router.delete('/gtfs/:routeId', adminCheck, async (req, res) => {
  try {
    const route = await Route.findOneAndDelete({ routeId: req.params.routeId });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    const Trip = require('../models/Trip');
    const StopTime = require('../models/StopTime');
    const Shape = require('../models/Shape');
    const PlannerBus = require('../models/PlannerBus');
    const BusManagement = require('../models/BusManagement');
    const trip = await Trip.findOne({ routeId: req.params.routeId });
    if (trip) {
      await Promise.all([
        Trip.deleteOne({ routeId: req.params.routeId }),
        StopTime.deleteMany({ tripId: trip.tripId }),
        Shape.deleteMany({ shapeId: trip.shapeId || trip.tripId }),
        PlannerBus.deleteOne({ busNumber: route.routeNumber }),
      ]);
    }
    await BusManagement.deleteOne({ busNumber: route.routeNumber });
    res.json({ message: 'GTFS route deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
