const Route = require('../models/Route');
const Trip = require('../models/Trip');
const Shape = require('../models/Shape');
const StopTime = require('../models/StopTime');
const Stop = require('../models/Stop');

const trackedBuses = new Map();

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseGTFSTime(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  return ((parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)) * 1000;
}

class TrackBusService {
  async findRoute(busNumber) {
    let route = await Route.findOne({ routeNumber: busNumber }).lean();
    if (!route) route = await Route.findOne({ routeId: busNumber }).lean();
    if (!route) {
      const match = busNumber.match(/(\d+)$/);
      if (match) {
        route = await Route.findOne({ routeNumber: match[1] }).lean();
      }
    }
    if (!route) {
      const match = busNumber.match(/(\d+)$/);
      if (match) {
        route = await Route.findOne({ routeNumber: { $regex: match[1] + '$' } }).lean();
      }
    }
    if (!route) {
      route = await Route.findOne({ routeNumber: { $regex: busNumber, $options: 'i' } }).lean();
    }
    return route;
  }

  async getBusTrackingData(busNumber) {
    if (trackedBuses.has(busNumber)) {
      const state = trackedBuses.get(busNumber);
      state.lastAccess = Date.now();
      const dbCount = await Shape.countDocuments({ shapeId: state.trip.shapeId });
      if (dbCount !== state.shape.length) {
        trackedBuses.delete(busNumber);
      } else {
        return this.buildResponse(busNumber, state);
      }
    }

    const route = await this.findRoute(busNumber);
    if (!route) return null;

    const trip = await Trip.findOne({ routeId: route.routeId }).lean();
    if (!trip) return null;

    const shape = await Shape.find({ shapeId: trip.shapeId })
      .sort({ sequence: 1 })
      .lean();
    if (shape.length === 0) return null;

    const stopTimes = await StopTime.find({ tripId: trip.tripId })
      .sort({ stopSequence: 1 })
      .lean();
    const stopIds = stopTimes.map(st => st.stopId);
    const stops = await Stop.find({ stopId: { $in: stopIds } }).lean();
    const stopMap = Object.fromEntries(stops.map(s => [s.stopId, s]));

    const orderedStops = stopTimes.map(st => ({
      stopId: st.stopId,
      stopName: stopMap[st.stopId]?.stopName || 'Unknown',
      latitude: stopMap[st.stopId]?.latitude,
      longitude: stopMap[st.stopId]?.longitude,
      arrivalTime: st.arrivalTime,
      departureTime: st.departureTime,
      stopSequence: st.stopSequence,
    }));

    const sourceStop = orderedStops[0] || null;
    const destinationStop = orderedStops[orderedStops.length - 1] || null;

    let routeDistance = 0;
    for (let i = 1; i < shape.length; i++) {
      routeDistance += haversineDistance(
        shape[i - 1].latitude, shape[i - 1].longitude,
        shape[i].latitude, shape[i].longitude
      );
    }

    const tripStartMs = parseGTFSTime(stopTimes[0]?.departureTime);
    const tripEndMs = parseGTFSTime(stopTimes[stopTimes.length - 1]?.arrivalTime);
    const totalTripDuration = Math.max(tripEndMs - tripStartMs, 3600000);

    const segments = this.buildSegments(shape, orderedStops, tripStartMs);

    const state = {
      route,
      trip,
      shape,
      stops: orderedStops,
      sourceStop,
      destinationStop,
      routeDistance,
      totalTripDuration,
      segments,
      startTime: Date.now(),
      lastAccess: Date.now(),
    };

    trackedBuses.set(busNumber, state);

    if (!this._cleanupInterval) {
      this._cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }

    return this.buildResponse(busNumber, state);
  }

  buildSegments(shape, stops, tripStartMs) {
    const segments = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const fromStop = stops[i];
      const toStop = stops[i + 1];
      if (!fromStop.latitude || !fromStop.longitude || !toStop.latitude || !toStop.longitude) continue;

      const startShapeIdx = this.findNearestShapeIndex(shape, fromStop.latitude, fromStop.longitude);
      const endShapeIdx = this.findNearestShapeIndex(shape, toStop.latitude, toStop.longitude);

      const startTimeMs = parseGTFSTime(fromStop.departureTime) - tripStartMs;
      const endTimeMs = parseGTFSTime(toStop.arrivalTime) - tripStartMs;

      if (endTimeMs > startTimeMs && endShapeIdx >= startShapeIdx) {
        segments.push({ startShapeIdx, endShapeIdx, startTimeMs, endTimeMs });
      }
    }
    return segments;
  }

  getCurrentIndex(state) {
    if (state.segments.length === 0) return 0;

    const elapsed = Date.now() - state.startTime;
    const duration = state.totalTripDuration;
    const tripProgress = (elapsed % duration) / duration;
    const elapsedInTrip = tripProgress * duration;

    for (const seg of state.segments) {
      if (elapsedInTrip >= seg.startTimeMs && elapsedInTrip < seg.endTimeMs) {
        const segDuration = seg.endTimeMs - seg.startTimeMs;
        const segElapsed = elapsedInTrip - seg.startTimeMs;
        const segProgress = segDuration > 0 ? segElapsed / segDuration : 0;
        const idx = seg.startShapeIdx + segProgress * (seg.endShapeIdx - seg.startShapeIdx);
        return Math.min(idx, state.shape.length - 1);
      }
    }

    if (elapsedInTrip < state.segments[0].startTimeMs) return state.segments[0].startShapeIdx;
    return state.segments[state.segments.length - 1].endShapeIdx;
  }

  getCurrentSegment(state, currentIndex) {
    for (const seg of state.segments) {
      if (currentIndex >= seg.startShapeIdx && currentIndex < seg.endShapeIdx) return seg;
    }
    for (const seg of state.segments) {
      if (currentIndex >= seg.startShapeIdx && currentIndex <= seg.endShapeIdx) return seg;
    }
    return state.segments[state.segments.length - 1] || null;
  }

  getInterpolatedPosition(shape, index) {
    const i = Math.floor(index);
    const frac = index - i;
    if (i >= shape.length - 1 || frac === 0) return shape[i];
    const p0 = shape[i];
    const p1 = shape[i + 1];
    return {
      latitude: p0.latitude + (p1.latitude - p0.latitude) * frac,
      longitude: p0.longitude + (p1.longitude - p0.longitude) * frac,
    };
  }

  buildResponse(busNumber, state) {
    const currentIndex = this.getCurrentIndex(state);
    const point = this.getInterpolatedPosition(state.shape, currentIndex);
    if (!point) return null;

    const currentSeg = this.getCurrentSegment(state, currentIndex);
    const segIdx = currentSeg ? state.segments.indexOf(currentSeg) : -1;
    const nextStop = segIdx >= 0 && segIdx < state.stops.length - 1
      ? state.stops[segIdx + 1]
      : state.destinationStop;
    const eta = this.calculateETA(state, currentIndex, currentSeg);

    const nextStopIndex = segIdx >= 0 && segIdx < state.stops.length - 1 ? segIdx + 1 : -1;

    return {
      busNumber,
      routeId: state.route.routeId,
      routeNumber: state.route.routeNumber,
      routeName: state.route.routeName,
      currentLocation: { lat: point.latitude, lng: point.longitude },
      currentIndex,
      totalPoints: state.shape.length,
      nextStop: nextStop?.stopName || 'N/A',
      nextStopIndex,
      eta,
      sourceStop: state.sourceStop?.stopName || 'N/A',
      destinationStop: state.destinationStop?.stopName || 'N/A',
      routeDistance: state.routeDistance.toFixed(2) + ' km',
      shape: state.shape,
      stops: state.stops,
    };
  }

  findNearestShapeIndex(shape, lat, lng) {
    let minDist = Infinity;
    let minIdx = 0;
    for (let i = 0; i < shape.length; i++) {
      const dist = haversineDistance(shape[i].latitude, shape[i].longitude, lat, lng);
      if (dist < minDist) {
        minDist = dist;
        minIdx = i;
      }
    }
    return minIdx;
  }

  calculateETA(state, currentIndex, currentSeg) {
    if (!currentSeg) return 'N/A';
    const elapsed = Date.now() - state.startTime;
    const duration = state.totalTripDuration;
    const tripProgress = (elapsed % duration) / duration;
    const elapsedInTrip = tripProgress * duration;

    const segIdx = state.segments.indexOf(currentSeg);
    let remainingTime = 0;

    if (elapsedInTrip < currentSeg.startTimeMs) {
      remainingTime = currentSeg.startTimeMs - elapsedInTrip;
      for (let i = segIdx; i < state.segments.length; i++) {
        remainingTime += state.segments[i].endTimeMs - state.segments[i].startTimeMs;
      }
    } else if (elapsedInTrip >= currentSeg.startTimeMs && elapsedInTrip < currentSeg.endTimeMs) {
      const segElapsed = elapsedInTrip - currentSeg.startTimeMs;
      const segDuration = currentSeg.endTimeMs - currentSeg.startTimeMs;
      const segRemaining = Math.max(0, segDuration - segElapsed);
      remainingTime = segRemaining;
      for (let i = segIdx + 1; i < state.segments.length; i++) {
        remainingTime += state.segments[i].endTimeMs - state.segments[i].startTimeMs;
      }
    } else {
      remainingTime = 0;
      for (let i = segIdx + 1; i < state.segments.length; i++) {
        remainingTime += state.segments[i].endTimeMs - state.segments[i].startTimeMs;
      }
    }

    if (remainingTime <= 0) return 'Arrived';
    const remainingMins = Math.round(remainingTime / 60000);
    if (remainingMins < 1) return 'Arriving';
    if (remainingMins >= 60) {
      const h = Math.floor(remainingMins / 60);
      const m = remainingMins % 60;
      return `${h}h ${m}m`;
    }
    return `${remainingMins} mins`;
  }

  resetSimulation(busNumber) {
    const state = trackedBuses.get(busNumber);
    if (state) {
      state.startTime = Date.now();
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [busNumber, state] of trackedBuses) {
      if (now - state.lastAccess > 600000) {
        trackedBuses.delete(busNumber);
      }
    }
  }
}

module.exports = new TrackBusService();
