const Stop = require('../models/Stop');
const StopTime = require('../models/StopTime');
const Trip = require('../models/Trip');
const Route = require('../models/Route');
const Shape = require('../models/Shape');
const PlannerBus = require('../models/PlannerBus');

const BUS_TYPES = ['Ordinary', 'Express', 'AC', 'Electric'];
const FARE_PER_KM = { Ordinary: 1.5, Express: 2.0, AC: 3.5, Electric: 2.5 };

function assignBusType(routeNumber) {
  const num = parseInt(routeNumber, 10);
  if (num % 4 === 0) return 'AC';
  if (num % 3 === 0) return 'Electric';
  if (num % 2 === 0) return 'Express';
  return 'Ordinary';
}

function calculateFare(distanceKm, busType) {
  const rate = FARE_PER_KM[busType] || 1.5;
  return Math.round(distanceKm * rate);
}

function estimateDistance(sourceLat, sourceLng, destLat, destLng) {
  const R = 6371;
  const dLat = ((destLat - sourceLat) * Math.PI) / 180;
  const dLng = ((destLng - sourceLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((sourceLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function parseTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

exports.searchRoutes = async (req, res) => {
  try {
    const {
      source,
      destination,
      directOnly,
      maxTransfers,
      fareMin,
      fareMax,
      busType,
      arrivalBefore,
      sortBy,
    } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ message: 'Source and destination are required' });
    }

    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const findStopFlexible = async (query) => {
      const tokens = query.trim().split(/\s+/).filter(Boolean);
      if (tokens.length === 0) return null;

      let stop = await Stop.findOne({ stopName: { $regex: escapeRegex(query), $options: 'i' } });
      if (stop) return stop;

      const allTokens = {
        $regex: tokens.map((t) => `(?=.*${escapeRegex(t)})`).join(''),
        $options: 'i',
      };
      stop = await Stop.findOne({ stopName: allTokens });
      if (stop) return stop;

      const anyToken = {
        $regex: tokens.map((t) => escapeRegex(t)).join('|'),
        $options: 'i',
      };
      stop = await Stop.findOne({ stopName: anyToken });
      if (stop) return stop;

      for (let i = tokens.length - 1; i >= 1; i--) {
        const partial = {
          $regex: tokens.slice(0, i).map((t) => `(?=.*${escapeRegex(t)})`).join(''),
          $options: 'i',
        };
        stop = await Stop.findOne({ stopName: partial });
        if (stop) return stop;
      }

      return null;
    };

    const sourceStop = await findStopFlexible(source);
    const destStop = await findStopFlexible(destination);

    if (!sourceStop || !destStop) {
      return res.status(404).json({ message: 'Source or destination stop not found' });
    }

    const [sourceStopTimes, destStopTimes] = await Promise.all([
      StopTime.find({ stopId: sourceStop.stopId }).lean(),
      StopTime.find({ stopId: destStop.stopId }).lean(),
    ]);

    const sourceTripIds = new Set(sourceStopTimes.map((s) => s.tripId));
    const destTripIds = new Set(destStopTimes.map((s) => s.tripId));

    const commonTripIds = [...sourceTripIds].filter((id) => destTripIds.has(id));

    const directRoutes = [];
    const transferRoutes = [];

    if (commonTripIds.length > 0) {
      const trips = await Trip.find({ tripId: { $in: commonTripIds } }).lean();
      const routeIds = [...new Set(trips.map((t) => t.routeId))];
      const routes = await Route.find({ routeId: { $in: routeIds } }).lean();
      const routeMap = new Map(routes.map((r) => [r.routeId, r]));

      const [srcCommonSTs, dstCommonSTs] = await Promise.all([
        StopTime.find({ tripId: { $in: commonTripIds }, stopId: sourceStop.stopId }).lean(),
        StopTime.find({ tripId: { $in: commonTripIds }, stopId: destStop.stopId }).lean(),
      ]);
      const srcSTMap = new Map(srcCommonSTs.map((st) => [st.tripId, st]));
      const dstSTMap = new Map(dstCommonSTs.map((st) => [st.tripId, st]));

      for (const trip of trips) {
        const srcST = srcSTMap.get(trip.tripId);
        const dstST = dstSTMap.get(trip.tripId);
        if (!srcST || !dstST || srcST.stopSequence >= dstST.stopSequence) continue;

        const route = routeMap.get(trip.routeId);
        const busTypeVal = assignBusType(route?.routeNumber || '0');
        const distance = estimateDistance(
          sourceStop.latitude || sourceStop.stopLat,
          sourceStop.longitude || sourceStop.stopLon,
          destStop.latitude || destStop.stopLat,
          destStop.longitude || destStop.stopLon,
        );
        const travelMinutes = timeToMinutes(dstST.arrivalTime) - timeToMinutes(srcST.departureTime);

        directRoutes.push({
          routeId: route?.routeId,
          routeNumber: route?.routeNumber,
          routeName: route?.routeName || route?.routeNumber,
          sourceStop: sourceStop.stopName,
          destinationStop: destStop.stopName,
          departureTime: srcST.departureTime,
          arrivalTime: dstST.arrivalTime,
          travelTime: `${Math.floor(travelMinutes / 60)}h ${travelMinutes % 60}m`,
          travelMinutes,
          distance,
          fare: calculateFare(distance, busTypeVal),
          busType: busTypeVal,
          transfers: 0,
          stopsCount: dstST.stopSequence - srcST.stopSequence,
          tripId: trip.tripId,
        });
      }
    }

    if (maxTransfers !== '0' && maxTransfers !== 0) {
      const [allSourceTrips, allDestTrips] = await Promise.all([
        Trip.find({ tripId: { $in: [...sourceTripIds] } }).lean(),
        Trip.find({ tripId: { $in: [...destTripIds] } }).lean(),
      ]);

      const allSourceTripIds = allSourceTrips.map((t) => t.tripId);
      const allDestTripIds = allDestTrips.map((t) => t.tripId);

      const [allSrcStopTimes, allDstStopTimes] = await Promise.all([
        StopTime.find({ tripId: { $in: allSourceTripIds } }).sort({ stopSequence: 1 }).lean(),
        StopTime.find({ tripId: { $in: allDestTripIds } }).sort({ stopSequence: 1 }).lean(),
      ]);

      const srcSTByTripId = {};
      for (const st of allSrcStopTimes) {
        if (!srcSTByTripId[st.tripId]) srcSTByTripId[st.tripId] = [];
        srcSTByTripId[st.tripId].push(st);
      }
      const dstSTByTripId = {};
      for (const st of allDstStopTimes) {
        if (!dstSTByTripId[st.tripId]) dstSTByTripId[st.tripId] = [];
        dstSTByTripId[st.tripId].push(st);
      }

      const tripRouteMap = new Map();
      for (const trip of allSourceTrips) tripRouteMap.set(trip.tripId, trip.routeId);
      for (const trip of allDestTrips) tripRouteMap.set(trip.tripId, trip.routeId);

      const sourceStopsByRoute = {};
      for (const trip of allSourceTrips) {
        const sts = srcSTByTripId[trip.tripId] || [];
        sourceStopsByRoute[trip.routeId] = sts.map((s) => ({
          stopId: s.stopId,
          stopSequence: s.stopSequence,
          arrivalTime: s.arrivalTime,
          departureTime: s.departureTime,
        }));
      }

      const destStopsByTripId = {};
      for (const trip of allDestTrips) {
        const sts = dstSTByTripId[trip.tripId] || [];
        destStopsByTripId[trip.tripId] = sts.map((s) => ({
          stopId: s.stopId,
          stopSequence: s.stopSequence,
          arrivalTime: s.arrivalTime,
          departureTime: s.departureTime,
        }));
      }

      const sourceRouteIds = [...new Set(allSourceTrips.map((t) => t.routeId))];

      const allSrcStopIds = [...new Set(allSrcStopTimes.map((s) => s.stopId))];
      const destTripIdsArray = [...destTripIds];

      const matchingDestStopTimes = await StopTime.find({
        stopId: { $in: allSrcStopIds },
        tripId: { $in: destTripIdsArray },
      }).lean();

      const matchingByStopId = {};
      for (const mst of matchingDestStopTimes) {
        if (!matchingByStopId[mst.stopId]) matchingByStopId[mst.stopId] = [];
        matchingByStopId[mst.stopId].push(mst);
      }

      const allStops = await Stop.find({ stopId: { $in: allSrcStopIds } }).lean();
      const stopMap = new Map(allStops.map((s) => [s.stopId, s]));

      const allRouteIds = [...new Set(allSourceTrips.map((t) => t.routeId).concat(allDestTrips.map((t) => t.routeId)))];
      const allRoutes = await Route.find({ routeId: { $in: allRouteIds } }).lean();
      const routeMap = new Map(allRoutes.map((r) => [r.routeId, r]));

      const transferCandidates = [];
      for (const srcRouteId of sourceRouteIds) {
        const srcStops = sourceStopsByRoute[srcRouteId] || [];
        for (const srcStop of srcStops) {
          const matchingDestTrips = matchingByStopId[srcStop.stopId] || [];
          for (const matchTrip of matchingDestTrips) {
            const destTripStops = destStopsByTripId[matchTrip.tripId];
            if (!destTripStops) continue;

            const lastSrc = srcStops[srcStops.length - 1];
            const transferStopData = stopMap.get(srcStop.stopId);
            const srcRoute = routeMap.get(srcRouteId);
            const destRouteId = tripRouteMap.get(matchTrip.tripId);
            const destRoute = routeMap.get(destRouteId);

            transferCandidates.push({
              firstLeg: {
                routeId: srcRouteId,
                routeNumber: srcRoute?.routeNumber,
                fromStop: sourceStop.stopName,
                toStop: transferStopData?.stopName || 'Unknown',
                departureTime: srcStop.departureTime,
                arrivalTime: lastSrc.arrivalTime,
              },
              secondLeg: {
                routeId: destRouteId,
                routeNumber: destRoute?.routeNumber,
                fromStop: transferStopData?.stopName || 'Unknown',
                toStop: destStop.stopName,
                departureTime: destTripStops[0]?.departureTime,
                arrivalTime: destTripStops[destTripStops.length - 1]?.arrivalTime,
              },
              transferStop: transferStopData?.stopName || 'Unknown',
            });
          }
        }
      }

      for (const tc of transferCandidates) {
        const totalMinutes =
          timeToMinutes(tc.firstLeg.arrivalTime) -
          timeToMinutes(tc.firstLeg.departureTime) +
          timeToMinutes(tc.secondLeg.arrivalTime) -
          timeToMinutes(tc.secondLeg.departureTime);

        const busTypeVal = assignBusType(tc.firstLeg.routeNumber || '0');
        const distance = estimateDistance(
          sourceStop.latitude || sourceStop.stopLat,
          sourceStop.longitude || sourceStop.stopLon,
          destStop.latitude || destStop.stopLat,
          destStop.longitude || destStop.stopLon,
        );

        transferRoutes.push({
          routeId: tc.firstLeg.routeId,
          routeNumber: `${tc.firstLeg.routeNumber} → ${tc.secondLeg.routeNumber}`,
          routeName: `${tc.firstLeg.routeNumber} → ${tc.secondLeg.routeNumber}`,
          sourceStop: sourceStop.stopName,
          destinationStop: destStop.stopName,
          departureTime: tc.firstLeg.departureTime,
          arrivalTime: tc.secondLeg.arrivalTime,
          travelTime: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
          travelMinutes: totalMinutes,
          distance,
          fare: calculateFare(distance, busTypeVal),
          busType: busTypeVal,
          transfers: 1,
          stopsCount: 0,
          transferStop: tc.transferStop,
          firstLeg: tc.firstLeg,
          secondLeg: tc.secondLeg,
        });
      }
    }

    let results = directRoutes;

    if (maxTransfers !== '0' && maxTransfers !== 0) {
      results = [...directRoutes, ...transferRoutes];
    }

    if (directOnly === 'true') {
      results = directRoutes;
    }

    if (busType) {
      results = results.filter((r) => r.busType.toLowerCase() === busType.toLowerCase());
    }

    if (fareMin) {
      results = results.filter((r) => r.fare >= Number(fareMin));
    }
    if (fareMax) {
      results = results.filter((r) => r.fare <= Number(fareMax));
    }

    if (arrivalBefore) {
      const cutoff = timeToMinutes(arrivalBefore);
      results = results.filter((r) => timeToMinutes(r.arrivalTime) <= cutoff);
    }

    if (sortBy) {
      switch (sortBy) {
        case 'fastest':
          results.sort((a, b) => a.travelMinutes - b.travelMinutes);
          break;
        case 'cheapest':
          results.sort((a, b) => a.fare - b.fare);
          break;
        case 'least_transfers':
          results.sort((a, b) => a.transfers - b.transfers);
          break;
        case 'earliest':
          results.sort((a, b) => timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime));
          break;
      }
    }

    res.json({ routes: results, count: results.length, sourceStop: sourceStop.stopName, destinationStop: destStop.stopName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRouteDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await Route.findOne({ routeId: id });
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const trips = await Trip.find({ routeId: id }).limit(1);
    if (trips.length === 0) {
      return res.json({ route, stops: [], shape: [] });
    }

    const trip = trips[0];
    const stopTimes = await StopTime.find({ tripId: trip.tripId }).sort({ stopSequence: 1 });
    const stopIds = stopTimes.map((s) => s.stopId);
    const stops = await Stop.find({ stopId: { $in: stopIds } });

    const orderedStops = stopTimes.map((st) => {
      const stop = stops.find((s) => s.stopId === st.stopId);
      return {
        stopId: st.stopId,
        stopName: stop?.stopName || 'Unknown',
        latitude: stop?.latitude || stop?.stopLat,
        longitude: stop?.longitude || stop?.stopLon,
        arrivalTime: st.arrivalTime,
        departureTime: st.departureTime,
        stopSequence: st.stopSequence,
      };
    });

    let shape = [];
    if (trip.shapeId) {
      shape = await Shape.find({ shapeId: trip.shapeId }).sort({ sequence: 1 });
    }

    const firstStop = orderedStops[0];
    const lastStop = orderedStops[orderedStops.length - 1];
    const distance = estimateDistance(
      firstStop?.latitude || 0,
      firstStop?.longitude || 0,
      lastStop?.latitude || 0,
      lastStop?.longitude || 0,
    );
    const busTypeVal = assignBusType(route.routeNumber || '0');

    const plannerBus = await PlannerBus.findOne({ routeId: id });

    res.json({
      route,
      stops: orderedStops,
      shape,
      distance,
      fare: calculateFare(distance, busTypeVal),
      busType: busTypeVal,
      estimatedTime: lastStop?.arrivalTime || 'N/A',
      busLocation: plannerBus?.currentLocation || null,
      busStatus: plannerBus?.status || 'unknown',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBusesByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const buses = await PlannerBus.find({ routeId });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find().lean();
    const enriched = routes.map((r) => {
      const busTypeVal = assignBusType(r.routeNumber || '0');
      return { ...r, busType: busTypeVal };
    });
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
