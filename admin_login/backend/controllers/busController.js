const Bus = require("../models/Bus");

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

    const busExists = await Bus.findOne({ busNumber });

    if (busExists) {
      return res.status(400).json({ message: "Bus number already exists" });
    }

    if (departureTime >= arrivalTime) {
      return res
        .status(400)
        .json({ message: "Arrival time must be greater than departure time" });
    }

    const bus = await Bus.create({
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

    const buses = await Bus.find(query).sort({ createdAt: -1 });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

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
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });

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
    const bus = await Bus.findById(req.params.id);

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
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    await Bus.deleteOne({ _id: req.params.id });
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
