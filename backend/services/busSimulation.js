const Shape = require('../models/Shape');
const Route = require('../models/Route');
const Trip = require('../models/Trip');

const simulatedBuses = new Map();

class BusSimulator {
  constructor() {
    this.buses = new Map();
    this.interval = null;
  }

  async initialize() {
    const routes = await Route.find().limit(10).lean();
    for (const route of routes) {
      const trips = await Trip.find({ routeId: route.routeId }).limit(1).lean();
      if (trips.length > 0) {
        const shape = await Shape.find({ shapeId: trips[0].shapeId })
          .sort({ sequence: 1 })
          .lean();
        if (shape.length > 0) {
          this.buses.set(route.routeId, {
            routeId: route.routeId,
            routeNumber: route.routeNumber,
            shape,
            currentIndex: 0,
            speed: 1,
          });
        }
      }
    }
    console.log(`Initialized ${this.buses.size} simulated buses`);
  }

  getPositions() {
    const positions = [];
    for (const [routeId, bus] of this.buses) {
      const point = bus.shape[bus.currentIndex];
      if (point) {
        positions.push({
          id: `bus_${routeId}`,
          routeId,
          routeNumber: bus.routeNumber,
          latitude: point.latitude,
          longitude: point.longitude,
          timestamp: new Date().toISOString(),
        });
      }
    }
    return positions;
  }

  updatePositions() {
    for (const [routeId, bus] of this.buses) {
      if (!bus || !Array.isArray(bus.shape) || bus.shape.length === 0) continue;
      bus.currentIndex = (bus.currentIndex + bus.speed) % bus.shape.length;
    }
  }

  start(intervalMs = 3000) {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      try {
        this.updatePositions();
      } catch (err) {
        console.error('BusSimulator update error:', err.message);
      }
    }, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

let simulator = null;

function getSimulator() {
  if (!simulator) {
    simulator = new BusSimulator();
  }
  return simulator;
}

module.exports = { BusSimulator, getSimulator };
