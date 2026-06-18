const Stop = require('../models/Stop');
const StopTime = require('../models/StopTime');
const Trip = require('../models/Trip');
const Route = require('../models/Route');
const fetch = require('node-fetch');

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.searchStops = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      const stops = await Stop.find().limit(50).lean();
      return res.json(stops);
    }

    const stops = await Stop.find({
      stopName: { $regex: q, $options: 'i' },
    }).limit(20).lean();

    res.json(stops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStopById = async (req, res) => {
  try {
    const stop = await Stop.findOne({ stopId: req.params.stopId });
    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }

    const stopTimes = await StopTime.find({ stopId: stop.stopId })
      .limit(20)
      .lean();
    const tripIds = [...new Set(stopTimes.map((st) => st.tripId))];
    const trips = await Trip.find({ tripId: { $in: tripIds } }).lean();

    res.json({ stop, stopTimes, trips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllStops = async (req, res) => {
  try {
    const stops = await Stop.find().lean();
    res.json(stops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.geocodeLocation = async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const indiaBounds = { minLat: 6.5, maxLat: 35.5, minLng: 68.0, maxLng: 97.5 };

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=5&countrycodes=IN`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SmartTransit/1.0 (APSRTC Bus Tracking)',
      },
    });
    const data = await response.json();

    if (data && data.length > 0) {
      const inIndia = data.filter(
        (r) =>
          parseFloat(r.lat) >= indiaBounds.minLat &&
          parseFloat(r.lat) <= indiaBounds.maxLat &&
          parseFloat(r.lon) >= indiaBounds.minLng &&
          parseFloat(r.lon) <= indiaBounds.maxLng
      );
      if (inIndia.length > 0) {
        const result = inIndia[0];
        return res.json({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          formattedAddress: result.display_name,
        });
      }
    }

    const stop = await Stop.findOne({
      stopName: { $regex: address, $options: 'i' },
    }).lean();

    if (stop) {
      return res.json({
        lat: stop.latitude,
        lng: stop.longitude,
        formattedAddress: stop.stopName,
      });
    }

    const allStops = await Stop.find().limit(50).lean();
    if (allStops.length > 0) {
      const mid = Math.floor(allStops.length / 2);
      return res.json({
        lat: allStops[mid].latitude,
        lng: allStops[mid].longitude,
        formattedAddress: allStops[mid].stopName,
      });
    }

    return res.status(404).json({
      message: 'Location not found. Please enter a valid location name.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Geocoding service error', error: error.message });
  }
};

exports.findNearbyStops = async (req, res) => {
  try {
    const { lat, lng, radius = 2000, query } = req.body;
    if (lat == null || lng == null) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const clampedRadius = Math.min(Math.max(radius, 100), 50000);
    const allStops = await Stop.find().lean();

    const stopsWithDistance = allStops.map((stop) => {
      const d = getDistance(lat, lng, stop.latitude, stop.longitude);
      return {
        placeId: stop.stopId,
        name: stop.stopName,
        vicinity: `Stop ID: ${stop.stopId}`,
        lat: stop.latitude,
        lng: stop.longitude,
        distance: Math.round(d * 100) / 100,
        stopId: stop.stopId,
      };
    }).sort((a, b) => a.distance - b.distance);

    const withinRadius = stopsWithDistance.filter((s) => s.distance * 1000 <= clampedRadius);

    if (withinRadius.length > 0) {
      return res.json(withinRadius);
    }

    const closest50 = stopsWithDistance.slice(0, 50);

    if (query) {
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameMatchedNearby = closest50.filter((s) => new RegExp(safeQuery, 'i').test(s.name));
      if (nameMatchedNearby.length > 0) {
        return res.json(nameMatchedNearby);
      }
    }

    res.json(closest50);
  } catch (error) {
    res.status(500).json({ message: 'Nearby search error', error: error.message });
  }
};

exports.getStopArrivals = async (req, res) => {
  try {
    const { stopId } = req.params;

    const stop = await Stop.findOne({ stopId });
    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }

    const stopTimes = await StopTime.find({ stopId }).sort({ arrivalTime: 1 }).limit(30).lean();
    if (stopTimes.length === 0) {
      return res.json({ stop, arrivals: [] });
    }

    const tripIds = [...new Set(stopTimes.map((st) => st.tripId))];
    const trips = await Trip.find({ tripId: { $in: tripIds } }).lean();
    const routeIds = [...new Set(trips.map((t) => t.routeId))];
    const routes = await Route.find({ routeId: { $in: routeIds } }).lean();

    const arrivals = stopTimes.map((st) => {
      const trip = trips.find((t) => t.tripId === st.tripId);
      const route = routes.find((r) => r.routeId === trip?.routeId);
      return {
        tripId: st.tripId,
        routeId: route?.routeId || trip?.routeId || '',
        routeNumber: route?.routeNumber || '',
        routeName: route?.routeName || '',
        destination: trip?.tripHeadsign || 'Unknown',
        arrivalTime: st.arrivalTime,
        departureTime: st.departureTime,
      };
    });

    res.json({ stop, arrivals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
