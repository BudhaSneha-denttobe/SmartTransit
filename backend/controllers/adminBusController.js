const BusManagement = require("../models/BusManagement");
const Route = require("../models/Route");
const Trip = require("../models/Trip");
const Stop = require("../models/Stop");
const StopTime = require("../models/StopTime");
const Shape = require("../models/Shape");
const PlannerBus = require("../models/PlannerBus");

function formatTime(t) {
  if (!t) return t;
  if (/^\d{2}:\d{2}$/.test(t)) return t + ':00';
  return t;
}

function generateRouteId(busNumber) {
  return `ADMIN_${busNumber}`;
}

function generateTripId(busNumber) {
  return `TRIP_ADMIN_${busNumber}`;
}

async function createGtfsRecords(busNumber, source, destination, busType) {
  const routeId = generateRouteId(busNumber);
  const tripId = generateTripId(busNumber);

  const routeExists = await Route.findOne({ routeId });
  if (!routeExists) {
    await Route.create({ routeId, routeNumber: busNumber, routeName: `${source} - ${destination}`, agencyId: 'ADMIN', routeType: '3' });
  }

  const tripExists = await Trip.findOne({ tripId });
  if (!tripExists) {
    await Trip.create({ tripId, routeId, serviceId: 'ADMIN', tripHeadsign: destination, directionId: '0', shapeId: tripId });
  }

  for (const [name, seq, arrival, departure] of [[source, 1, formatTime('00:00'), formatTime('00:00')], [destination, 2, formatTime('23:59'), formatTime('23:59')]]) {
    let stop = await Stop.findOne({ stopName: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
    if (!stop) {
      stop = await Stop.create({ stopId: `ADMIN_${busNumber}_${seq}`, stopName: name.toUpperCase(), latitude: 0, longitude: 0, locationType: '0' });
    }
    const stExists = await StopTime.findOne({ tripId, stopId: stop.stopId });
    if (!stExists) {
      await StopTime.create({ tripId, stopId: stop.stopId, stopSequence: seq, arrivalTime: arrival, departureTime: departure });
    }
  }

  const shapeExists = await Shape.findOne({ shapeId: tripId });
  if (!shapeExists) {
    await Shape.create([
      { shapeId: tripId, latitude: 0, longitude: 0, sequence: 1 },
      { shapeId: tripId, latitude: 0.01, longitude: 0.01, sequence: 2 },
    ]);
  }

  const pbExists = await PlannerBus.findOne({ busNumber });
  if (!pbExists) {
    await PlannerBus.create({ busNumber, routeId, status: 'active', currentLocation: { latitude: 0, longitude: 0 }, speed: 0 });
  }
}

async function removeGtfsRecords(busNumber) {
  const routeId = generateRouteId(busNumber);
  const tripId = generateTripId(busNumber);
  await Promise.all([
    Route.deleteOne({ routeId }),
    Trip.deleteOne({ tripId }),
    StopTime.deleteMany({ tripId }),
    Shape.deleteMany({ shapeId: tripId }),
    PlannerBus.deleteOne({ busNumber }),
  ]);
}

const addBus = async (req, res) => {
  try {
    const {
      busNumber,
      busName,
      busType,
      source,
      destination,
      departureTime,
      arrivalTime,
      driverName,
      status,
    } = req.body;

    if (
      !busNumber ||
      !busName ||
      !busType ||
      !source ||
      !destination ||
      !departureTime ||
      !arrivalTime ||
      !driverName
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const busExists = await BusManagement.findOne({ busNumber });

    if (busExists) {
      return res.status(400).json({ message: "Bus number already exists" });
    }

    if (departureTime >= arrivalTime) {
      return res
        .status(400)
        .json({ message: "Arrival time must be greater than departure time" });
    }

    const bus = await BusManagement.create({
      busNumber,
      busName,
      busType,
      source,
      destination,
      departureTime,
      arrivalTime,
      driverName,
      status: status || "Active",
    });

    await createGtfsRecords(busNumber, source, destination, busType);

    if (bus) {
      res.status(201).json(bus);
    } else {
      res.status(400).json({ message: "Invalid bus data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBuses = async (req, res) => {
  try {
    const { search, type, status } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { busNumber: { $regex: search, $options: "i" } },
        { source: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
      ];
    }

    if (type) {
      query.busType = type;
    }

    if (status) {
      query.status = status;
    }

    const buses = await BusManagement.find(query).sort({ createdAt: -1 });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBusById = async (req, res) => {
  try {
    const bus = await BusManagement.findById(req.params.id);

    if (bus) {
      res.json(bus);
    } else {
      res.status(404).json({ message: "Bus not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBusByNumber = async (req, res) => {
  try {
    const bus = await BusManagement.findOne({ busNumber: req.params.busNumber });

    if (bus) {
      res.json(bus);
    } else {
      res.status(404).json({ message: "Bus not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBus = async (req, res) => {
  try {
    const bus = await BusManagement.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const {
      busName,
      busType,
      source,
      destination,
      departureTime,
      arrivalTime,
      driverName,
      status,
    } = req.body;

    if (departureTime && arrivalTime && departureTime >= arrivalTime) {
      return res
        .status(400)
        .json({ message: "Arrival time must be greater than departure time" });
    }

    bus.busName = busName || bus.busName;
    bus.busType = busType || bus.busType;
    bus.source = source || bus.source;
    bus.destination = destination || bus.destination;
    bus.departureTime = departureTime || bus.departureTime;
    bus.arrivalTime = arrivalTime || bus.arrivalTime;
    bus.driverName = driverName || bus.driverName;
    bus.status = status || bus.status;

    const updatedBus = await bus.save();
    res.json(updatedBus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBus = async (req, res) => {
  try {
    const bus = await BusManagement.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    await BusManagement.deleteOne({ _id: req.params.id });
    await removeGtfsRecords(bus.busNumber);
    res.json({ message: "Bus removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addBus,
  getBuses,
  getBusById,
  getBusByNumber,
  updateBus,
  deleteBus,
};
