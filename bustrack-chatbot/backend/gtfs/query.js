/**
 * GTFS Query Engine — Full AP + VJA dataset
 */

const { stops, routes, trips, stopTimes, stopToTrips } = require("./loader");

// ── helpers ────────────────────────────────────────────────────────────────

function norm(s = "") {
  return s.toUpperCase().replace(/[^A-Z0-9\s]/g, "").trim();
}

function findStops(query) {
  const q = norm(query);
  if (!q || q.length < 2) return [];
  const results = [];
  const seen = new Set();
  for (const [, stop] of stops) {
    const sn = norm(stop.stop_name);
    if (sn.includes(q)) { results.push(stop); seen.add(stop.stop_id); }
  }
  if (results.length > 0) return results;
  // fallback: try matching individual words (handles "vijayawada bus stand" → "VIJAYAWADA")
  // Use words >= 4 chars to avoid generic matches like "BUS", "STAND"
  const words = q.split(/\s+/).filter(w => w.length >= 4);
  for (const word of words) {
    for (const [, stop] of stops) {
      if (seen.has(stop.stop_id)) continue;
      if (norm(stop.stop_name).includes(word)) {
        results.push(stop);
        seen.add(stop.stop_id);
      }
    }
  }
  return results;
}

function toMinutes(t = "") {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function fmt(t = "") {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

function routeForTrip(tripId) {
  const trip = trips.get(tripId);
  if (!trip) return null;
  return routes.get(trip.route_id) || null;
}

function buildBusCard(tripId, fromIdx = null, toIdx = null) {
  const trip = trips.get(tripId);
  if (!trip) return null;
  const route = routes.get(trip.route_id);
  if (!route) return null;
  const sts = stopTimes.get(tripId) || [];
  if (!sts.length) return null;

  const segStart = fromIdx !== null ? fromIdx : 0;
  const segEnd = toIdx !== null ? toIdx + 1 : sts.length;
  const seg = sts.slice(segStart, segEnd);

  return {
    busNumber: route.route_short_name,
    routeId: route.route_id,
    from: seg[0]?.stop_name || sts[0]?.stop_name || route.from,
    to: seg[seg.length - 1]?.stop_name || sts[sts.length - 1]?.stop_name || route.to,
    stops: seg.map((s) => s.stop_name),
    timings: seg.map((s) => fmt(s.departure_time)),
    firstDeparture: seg[0]?.departure_time || "",
    lastArrival: seg[seg.length - 1]?.arrival_time || "",
    type: route.type === "city" ? "City Ordinary" : "APSRTC Express",
  };
}

// ── 1. Search by bus number ────────────────────────────────────────────────

function searchByBusNumber(busNum) {
  const q = norm(busNum);
  const results = [];
  const seen = new Set();
  for (const [routeId, route] of routes) {
    if (norm(route.route_short_name) === q) {
      for (const [tripId, trip] of trips) {
        if (trip.route_id === routeId && !seen.has(routeId)) {
          seen.add(routeId);
          const card = buildBusCard(tripId);
          if (card) results.push(card);
        }
      }
    }
  }
  return results;
}

// ── 2. Route search (from → to) ───────────────────────────────────────────

function searchByRoute(fromQuery, toQuery) {
  const fromStops = findStops(fromQuery).map((s) => s.stop_id);
  const toStops = findStops(toQuery).map((s) => s.stop_id);
  if (!fromStops.length || !toStops.length) return [];

  const fromSet = new Set(fromStops);
  const toSet = new Set(toStops);
  const results = [];
  const seen = new Set();

  for (const [tripId, sts] of stopTimes) {
    let fromIdx = -1, toIdx = -1;
    for (let i = 0; i < sts.length; i++) {
      if (fromSet.has(sts[i].stop_id) && fromIdx === -1) fromIdx = i;
      if (toSet.has(sts[i].stop_id)) toIdx = i;
    }
    if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
      const trip = trips.get(tripId);
      const routeId = trip?.route_id;
      if (seen.has(routeId)) continue; // dedupe by route
      seen.add(routeId);
      const card = buildBusCard(tripId, fromIdx, toIdx);
      if (card) results.push(card);
    }
  }
  // sort by departure time
  results.sort((a, b) => toMinutes(a.firstDeparture) - toMinutes(b.firstDeparture));
  return results;
}

// ── 3. Stop info ──────────────────────────────────────────────────────────

function getStopInfo(stopQuery) {
  const matched = findStops(stopQuery);
  if (!matched.length) return null;
  const stop = matched[0];
  const tripIds = stopToTrips.get(stop.stop_id) || new Set();
  const buses = new Set();
  for (const tripId of tripIds) {
    const route = routeForTrip(tripId);
    if (route) buses.add(route.route_short_name);
  }
  return {
    stop_name: stop.stop_name,
    stop_lat: stop.stop_lat,
    stop_lon: stop.stop_lon,
    busesServed: [...buses].sort(),
  };
}

// ── 4. Buses via stop ─────────────────────────────────────────────────────

function getBusesViaStop(stopQuery) {
  const matched = findStops(stopQuery);
  if (!matched.length) return [];

  const results = [];
  const seenRoute = new Set();

  for (const stop of matched) {
    const tripIds = stopToTrips.get(stop.stop_id) || new Set();
    for (const tripId of tripIds) {
      const trip = trips.get(tripId);
      if (!trip) continue;
      if (seenRoute.has(trip.route_id)) continue;
      seenRoute.add(trip.route_id);
      const card = buildBusCard(tripId);
      if (card) results.push(card);
    }
  }
  return results;
}

// ── 5. Full schedule for a route ──────────────────────────────────────────

function getSchedule(busNumQuery) {
  return searchByBusNumber(busNumQuery);
}

// ── 6. Next bus from a stop ───────────────────────────────────────────────

function getNextBus(stopQuery, afterTime = null) {
  const matched = findStops(stopQuery);
  if (!matched.length) return [];

  const nowIST = new Date(Date.now() + 5.5 * 3600 * 1000);
  const nowMins = afterTime
    ? toMinutes(afterTime)
    : nowIST.getUTCHours() * 60 + nowIST.getUTCMinutes();

  const upcoming = [];
  const seen = new Set();

  for (const stop of matched.slice(0, 5)) { // limit to top 5 matched stops
    const tripIds = stopToTrips.get(stop.stop_id) || new Set();
    for (const tripId of tripIds) {
      const sts = stopTimes.get(tripId) || [];
      const entry = sts.find((s) => s.stop_id === stop.stop_id);
      if (!entry) continue;
      const depMins = toMinutes(entry.departure_time);
      if (depMins >= nowMins) {
        const route = routeForTrip(tripId);
        if (route && !seen.has(route.route_id)) {
          seen.add(route.route_id);
          upcoming.push({
            busNumber: route.route_short_name,
            stopName: stop.stop_name,
            departureTime: fmt(entry.departure_time),
            departureRaw: entry.departure_time,
            minutesAway: depMins - nowMins,
            headsign: trips.get(tripId)?.headsign || route.route_long_name,
          });
        }
      }
    }
  }

  upcoming.sort((a, b) => toMinutes(a.departureRaw) - toMinutes(b.departureRaw));
  return upcoming.slice(0, 10);
}

// ── 7. Filter by time window ──────────────────────────────────────────────

function filterByTime(stopQuery, fromTime, toTime) {
  const fromMins = toMinutes(fromTime);
  const toMins = toMinutes(toTime);
  const matched = findStops(stopQuery);
  if (!matched.length) return [];

  const results = [];
  const seen = new Set();

  for (const stop of matched) {
    const tripIds = stopToTrips.get(stop.stop_id) || new Set();
    for (const tripId of tripIds) {
      const sts = stopTimes.get(tripId) || [];
      const entry = sts.find((s) => s.stop_id === stop.stop_id);
      if (!entry) continue;
      const depMins = toMinutes(entry.departure_time);
      if (depMins >= fromMins && depMins <= toMins) {
        const route = routeForTrip(tripId);
        if (route && !seen.has(route.route_id)) {
          seen.add(route.route_id);
          results.push({
            busNumber: route.route_short_name,
            departureTime: fmt(entry.departure_time),
            departureRaw: entry.departure_time,
            headsign: trips.get(tripId)?.headsign || route.route_long_name,
          });
        }
      }
    }
  }
  results.sort((a, b) => toMinutes(a.departureRaw) - toMinutes(b.departureRaw));
  return results;
}

// ── Intent detector ────────────────────────────────────────────────────────

function detectIntent(message) {
  // Normalize: replace punctuation with spaces for robust matching
  // Preserve colons (for time parsing) and apostrophes (for contractions)
  const normalized = message.replace(/[,;!?.\n\r()[\]]+/g, ' ').replace(/\s+/g, ' ').trim();
  const m = normalized.toUpperCase();

  // ── greeting ────────────────────────────────────────────────────────────
  if (/^(HI|HELLO|HEY|GOOD\s*(MORNING|AFTERNOON|EVENING)|GREETINGS?|HOWDY|SUP|YO)\s*$/.test(m)) {
    return { intent: "greeting", params: {} };
  }

  // ── route search: "I am at/near/in X ... to Y" ─────────────────────────
  // "I am right here at benz circle I want to go to vijayawada bus stand what are buses"
  // "i'm near guntur i need to go to vijayawada"
  const atFromMatch = normalized.match(
    /i(?:'m| am)(?:\s+right\s+here)?\s+(?:at|near|in)\s+([A-Za-z0-9\s]{2,}?)\s+(?:and|so|then|i\s+|i'd\s+|i'm\s+|wanna|want|need|would|going)/i
  );
  if (atFromMatch) {
    const from = atFromMatch[1].trim();
    const toDestMatch = normalized.match(
      /.*(?:to|go\s+to|reach)\s+([A-Za-z0-9\s]{2,}?)(?=\s+(?:what|when|how|which|buses?|can\s+|do\s+|is\s+|are\s+|will\s+|should\s+|please)|[?.!]|\s*$)/i
    );
    if (toDestMatch) {
      const to = toDestMatch[1].trim();
      if (from.length > 1 && to.length > 1) {
        return { intent: "route_search", params: { from, to } };
      }
    }
  }

  // ── route search: "I want/need to go from X to Y" ──────────────────────
  // "i want to go from machilipatnam to vijayawada"
  // "i need to go from guntur to vijayawada bus stand what buses"
  const fromToNLP = normalized.match(
    /(?:i\s+want|i\s+need|i\s+would\s+like|wanna|want\s+to|need\s+to).*?from\s+([A-Za-z0-9\s]{2,}?)\s+to\s+([A-Za-z0-9\s]{2,}?)(?=\s+(?:what|when|how|which|buses?|can\s+|do\s+|is\s+|are\s+|will\s+|should\s+|please)|[?.!]|\s*$)/i
  );
  if (fromToNLP) {
    const from = fromToNLP[1].trim();
    const to = fromToNLP[2].trim();
    if (from.length > 1 && to.length > 1) {
      return { intent: "route_search", params: { from, to } };
    }
  }

  // ── route search: "how to go from X to Y" / "how can I go from X to Y" ─
  // "how to go from benz circle to vijayawada"
  // "how can i go from guntur to vijayawada bus stand"
  // "how from guntur to vijayawada"
  const howFromTo = normalized.match(
    /how\s+(?:(?:to\s+)?(?:go|get|travel|reach|come)\s+from\s+|(?:can|do|would|could)\s+(?:i|we)\s+(?:go|get|travel|reach|come)\s+from\s+|from\s+)([A-Za-z0-9\s]{2,}?)\s+to\s+([A-Za-z0-9\s]{2,}?)(?=\s+(?:what|when|how|which|buses?|can\s+|do\s+|is\s+|are\s+|will\s+|should\s+|please)|[?.!]|\s*$)/i
  );
  if (howFromTo) {
    return { intent: "route_search", params: { from: howFromTo[1].trim(), to: howFromTo[2].trim() } };
  }

  // ── route search: "buses from X to Y" / "bus from X to Y" ──────────────
  // "buses from benz circle to vijayawada"
  const busesFromTo = normalized.match(
    /(?:tell\s+(?:me\s+)?)?buses?\s+from\s+([A-Za-z0-9\s]{2,}?)\s+to\s+([A-Za-z0-9\s]{2,}?)(?=\s+(?:what|when|how|which|buses?|can\s+|do\s+|is\s+|are\s+|will\s+|should\s+|please)|[?.!]|\s*$)/i
  );
  if (busesFromTo) {
    return { intent: "route_search", params: { from: busesFromTo[1].trim(), to: busesFromTo[2].trim() } };
  }

  // ── route search: "from X to Y" anywhere in text ───────────────────────
  // "going from benz circle to vijayawada"
  // "can i get a bus from benz circle to vijayawada"
  // "tell me from benz circle to vijayawada"
  // "what are buses from benz circle to vijayawada"
  // "from guntur to vijayawada"
  const genericFromTo = normalized.match(
    /\bfrom\s+([A-Za-z0-9\s]{2,}?)\s+to\s+([A-Za-z0-9\s]{2,}?)(?=\s+(?:what|when|how|which|buses?|can\s+|do\s+|is\s+|are\s+|will\s+|should\s+|please)|[?.!]|\s*$)/i
  );
  if (genericFromTo) {
    const from = genericFromTo[1].trim();
    const to = genericFromTo[2].trim();
    if (from.length > 1 && to.length > 1) {
      return { intent: "route_search", params: { from, to } };
    }
  }

  // ── route search: simple "X to Y" (no "from" keyword) ──────────────────
  // "benz circle to vijayawada"
  const simpleTo = normalized.match(
    /^([A-Za-z0-9\s]{2,}?)\s+to\s+([A-Za-z0-9\s]{2,}?)(?=\s+(?:what|when|how|which|buses?|can\s+|do\s+|is\s+|are\s+|will\s+|should\s+|please)|[?.!]|\s*$)/i
  );
  if (simpleTo) {
    const from = simpleTo[1].trim();
    const to = simpleTo[2].trim();
    if (from.length > 1 && to.length > 1 && !/^(?:how|what|where|when|why|which|the|a|an|is|are|can|do|does|did|will|would|could|should|may|might|shall|please|tell|show|get|find|need|want|go|bus|buses|there|here|this|that|for|from)$/i.test(from)) {
      return { intent: "route_search", params: { from, to } };
    }
  }

  // schedule / timing keywords with bus number
  if (/SCHEDULE|TIMING|TIMETABLE|TIME TABLE/.test(m)) {
    const busMatch = normalized.match(/(?:of|for|bus|route)\s+([0-9]+\s*[A-Z]*(?:\s[A-Z]+)?)/i)
      || normalized.match(/([0-9]+\s*[A-Z]*(?:\s[A-Z]+)?)\s+(?:schedule|timing|timetable)/i);
    if (busMatch) return { intent: "schedule", params: { busNumber: busMatch[1].trim() } };
  }

  // explicit bus number: "bus 5 SG" / "route 116"
  const explicitBus = normalized.match(/\b(?:bus|route)\s+([0-9]+\s*[A-Z]*(?:\s[A-Z]+)?)\b/i);
  if (explicitBus) {
    return { intent: "bus_number", params: { busNumber: explicitBus[1].trim() } };
  }

  // next bus
  if (/NEXT BUS|NEXT DEPARTURE|WHEN IS|WHEN WILL|UPCOMING/.test(m)) {
    const stopMatch = normalized.match(/(?:from|at|near)\s+([A-Za-z0-9\s]+?)(?:\s*\?|$)/i);
    return { intent: "next_bus", params: { stop: stopMatch?.[1]?.trim() || normalized } };
  }

  // last bus
  if (/LAST BUS|FINAL BUS/.test(m)) {
    const stopMatch = normalized.match(/(?:from|at)\s+([A-Za-z0-9\s]+)/i);
    return { intent: "last_bus", params: { stop: stopMatch?.[1]?.trim() || normalized } };
  }

  // time range filter
  const timeRangeMatch = normalized.match(/between\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s+and\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i);
  if (timeRangeMatch) {
    const stopMatch = normalized.match(/(?:from|at|near)\s+([A-Za-z0-9\s]+?)(?:\s+between|\s*\?|$)/i);
    return {
      intent: "time_filter",
      params: {
        stop: stopMatch?.[1]?.trim() || normalized,
        from: parseTimeStr(timeRangeMatch[1]),
        to: parseTimeStr(timeRangeMatch[2]),
      },
    };
  }

  // after time
  const afterMatch = normalized.match(/after\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i);
  if (afterMatch) {
    const stopMatch = normalized.match(/(?:from|at|near)\s+([A-Za-z0-9\s]+?)(?:\s+after|\s*\?|$)/i);
    return {
      intent: "next_bus",
      params: {
        stop: stopMatch?.[1]?.trim() || normalized,
        afterTime: parseTimeStr(afterMatch[1]),
      },
    };
  }

  // via / through
  if (/\bVIA\b|\bTHROUGH\b|\bPASSING\b/.test(m)) {
    const viaMatch = normalized.match(/\bvia\b\s+([A-Za-z0-9\s]+?)(?:\s*\?|$)/i)
      || normalized.match(/\bthrough\b\s+([A-Za-z0-9\s]+?)(?:\s*\?|$)/i);
    return { intent: "buses_via_stop", params: { stop: viaMatch?.[1]?.trim() || normalized } };
  }

  // buses from a stop (after more specific route patterns above)
  const fromMatch = normalized.match(/buses?\s+(?:from|at|near)\s+([A-Za-z0-9\s]+?)(?:\s*\?|$)/i);
  if (fromMatch) {
    return { intent: "buses_via_stop", params: { stop: fromMatch[1].trim() } };
  }

  // stop lookup keyword
  if (/\bSTOP\b|\bHALT\b|\bSTAND\b/.test(m)) {
    const stopMatch = normalized.match(/(?:stop|at|near)\s+([A-Za-z0-9\s]+?)(?:\s*\?|$)/i);
    return { intent: "stop_lookup", params: { stop: stopMatch?.[1]?.trim() || normalized } };
  }

  // bare bus number
  const bareNum = normalized.match(/^([0-9]+\s*[A-Z]*(?:\s[A-Z]+)?)$/i);
  if (bareNum) {
    return { intent: "bus_number", params: { busNumber: bareNum[1].trim() } };
  }

  // default: treat as stop/area search
  return { intent: "buses_via_stop", params: { stop: normalized } };
}

function parseTimeStr(s = "") {
  s = s.trim().toUpperCase();
  const ampm = s.includes("PM") ? "PM" : s.includes("AM") ? "AM" : null;
  s = s.replace(/[APM]/g, "").trim();
  let [h, m = "00"] = s.split(":").map(Number);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

module.exports = {
  searchByBusNumber,
  searchByRoute,
  getStopInfo,
  getBusesViaStop,
  getSchedule,
  getNextBus,
  filterByTime,
  detectIntent,
  findStops,
  fmt,
};