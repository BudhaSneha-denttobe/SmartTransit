const User = require('../models/User');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Trip = require('../models/Trip');
const StopTime = require('../models/StopTime');
const Shape = require('../models/Shape');
const BusManagement = require('../models/BusManagement');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalRoutes, totalStops, totalTrips, totalShapes, totalBuses] =
      await Promise.all([
        User.countDocuments(),
        Route.countDocuments(),
        Stop.countDocuments(),
        Trip.countDocuments(),
        Shape.countDocuments(),
        BusManagement.countDocuments(),
      ]);

    res.json({
      totalUsers,
      totalRoutes,
      totalStops,
      totalTrips,
      totalBuses,
      activeSimulatedBuses: totalBuses,
      totalShapes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findOneAndUpdate(
      { routeId: req.params.routeId },
      req.body,
      { new: true }
    );
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findOneAndDelete({ routeId: req.params.routeId });
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    await Trip.deleteMany({ routeId: req.params.routeId });
    res.json({ message: 'Route and associated trips deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStop = async (req, res) => {
  try {
    const stop = await Stop.create(req.body);
    res.status(201).json(stop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStop = async (req, res) => {
  try {
    const stop = await Stop.findOneAndUpdate(
      { stopId: req.params.stopId },
      req.body,
      { new: true }
    );
    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }
    res.json(stop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStop = async (req, res) => {
  try {
    const stop = await Stop.findOneAndDelete({ stopId: req.params.stopId });
    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }
    await StopTime.deleteMany({ stopId: req.params.stopId });
    res.json({ message: 'Stop and associated stop times deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSimulatedBuses = async (req, res) => {
  try {
    const routes = await Route.find().limit(10).lean();
    const buses = routes.map((r, i) => ({
      id: `bus_${r.routeId}`,
      routeNumber: r.routeNumber,
      routeName: r.routeName,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    }));
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
