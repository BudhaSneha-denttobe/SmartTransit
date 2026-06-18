const Route = require('../models/Route');
const Trip = require('../models/Trip');
const StopTime = require('../models/StopTime');
const Stop = require('../models/Stop');
const Shape = require('../models/Shape');

exports.searchRoutes = async (req, res) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ message: 'Source and destination required' });
    }

    const sourceStop = await Stop.findOne({
      stopName: { $regex: source, $options: 'i' },
    });
    const destStop = await Stop.findOne({
      stopName: { $regex: destination, $options: 'i' },
    });

    if (!sourceStop || !destStop) {
      return res.status(404).json({ message: 'Stops not found' });
    }

    const sourceStopTimes = await StopTime.find({ stopId: sourceStop.stopId });
    const destStopTimes = await StopTime.find({ stopId: destStop.stopId });

    const sourceTripIds = new Set(sourceStopTimes.map((st) => st.tripId));
    const destTripIds = new Set(destStopTimes.map((st) => st.tripId));

    const commonTripIds = [...sourceTripIds].filter((id) => destTripIds.has(id));

    if (commonTripIds.length === 0) {
      return res.json({ routes: [], message: 'No direct routes found' });
    }

    const trips = await Trip.find({ tripId: { $in: commonTripIds } });
    const routeIds = [...new Set(trips.map((t) => t.routeId))];
    const routes = await Route.find({ routeId: { $in: routeIds } });

    const results = [];
    for (const trip of trips) {
      const route = routes.find((r) => r.routeId === trip.routeId);
      const sourceST = await StopTime.findOne({
        tripId: trip.tripId,
        stopId: sourceStop.stopId,
      });
      const destST = await StopTime.findOne({
        tripId: trip.tripId,
        stopId: destStop.stopId,
      });

      if (sourceST && destST && sourceST.stopSequence < destST.stopSequence) {
        const travelTime = calculateTravelTime(
          sourceST.departureTime,
          destST.arrivalTime
        );
        results.push({
          routeId: route?.routeId,
          routeNumber: route?.routeNumber,
          routeName: route?.routeName,
          tripId: trip.tripId,
          sourceStop: sourceStop.stopName,
          destinationStop: destStop.stopName,
          departureTime: sourceST.departureTime,
          arrivalTime: destST.arrivalTime,
          travelTime,
        });
      }
    }

    res.json({ routes: results, count: results.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRouteByNumber = async (req, res) => {
  try {
    const { busNumber } = req.params;
    const route = await Route.findOne({
      routeNumber: busNumber,
    });

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const trips = await Trip.find({ routeId: route.routeId }).limit(1);
    if (trips.length === 0) {
      return res.json({ route, stops: [], shape: [] });
    }

    const trip = trips[0];
    const stopTimes = await StopTime.find({ tripId: trip.tripId }).sort({
      stopSequence: 1,
    });

    const stopIds = stopTimes.map((st) => st.stopId);
    const stops = await Stop.find({ stopId: { $in: stopIds } });

    const orderedStops = stopTimes.map((st) => {
      const stop = stops.find((s) => s.stopId === st.stopId);
      return {
        stopId: st.stopId,
        stopName: stop?.stopName || 'Unknown',
        latitude: stop?.latitude,
        longitude: stop?.longitude,
        arrivalTime: st.arrivalTime,
        departureTime: st.departureTime,
        stopSequence: st.stopSequence,
      };
    });

    let shape = [];
    if (trip.shapeId) {
      shape = await Shape.find({ shapeId: trip.shapeId }).sort({ sequence: 1 });
    }

    res.json({ route, stops: orderedStops, shape });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find().lean();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function calculateTravelTime(departure, arrival) {
  if (!departure || !arrival) return 'N/A';
  const [dh, dm] = departure.split(':').map(Number);
  const [ah, am] = arrival.split(':').map(Number);
  const depMinutes = dh * 60 + dm;
  const arrMinutes = ah * 60 + am;
  let diff = arrMinutes - depMinutes;
  if (diff < 0) diff += 24 * 60;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours}h ${minutes}m`;
}
