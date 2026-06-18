/**
 * GTFS Loader — loads BOTH datasets:
 *   1. Full AP/Telangana intercity (routes.txt, stops.txt, trips.txt, stop_times.txt)
 *   2. Vijayawada city buses (vja_routes.txt, vja_trips.txt, vja_stop_times.txt, stops_merged.txt)
 *
 * All data is merged into unified in-memory maps.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const GTFS_DIR = path.join(__dirname, "../GTFS_Data");

// ── helpers ────────────────────────────────────────────────────────────────

async function readCSV(filename) {
  const filePath = path.join(GTFS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  GTFS file not found: ${filename}`);
    return [];
  }
  return new Promise((resolve) => {
    const rows = [];
    let headers = null;
    const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
    rl.on("line", (line) => {
      if (!line.trim()) return;
      const cols = line.split(",");
      if (!headers) { headers = cols.map(h => h.trim().replace(/^\uFEFF/, "")); return; }
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (cols[i] || "").trim(); });
      rows.push(obj);
    });
    rl.on("close", () => resolve(rows));
  });
}

// ── exported data stores ───────────────────────────────────────────────────

let gtfsLoaded = false;
// FIX: expose a promise so server.js can await it properly
let gtfsLoadPromise = null;

/** Map: stop_id → { stop_id, stop_name, stop_lat, stop_lon, dataset } */
const stops = new Map();

/** Map: route_id → { route_id, route_short_name, route_long_name, from, to } */
const routes = new Map();

/** Map: trip_id → { trip_id, route_id, headsign } */
const trips = new Map();

/** Map: trip_id → [ { stop_id, stop_name, arrival_time, departure_time, stop_sequence } ] */
const stopTimes = new Map();

/** Map: stop_id → Set of trip_ids */
const stopToTrips = new Map();

// ── loader ─────────────────────────────────────────────────────────────────

async function loadGTFS() {
  // FIX: return existing promise if already loading/loaded (prevents double-load)
  if (gtfsLoadPromise) return gtfsLoadPromise;

  gtfsLoadPromise = _doLoad();
  return gtfsLoadPromise;
}

async function _doLoad() {
  if (gtfsLoaded) return;
  console.log("📂 Loading GTFS data...");

  // ── 1. STOPS: full AP stops.txt first, then VJA stops_merged.txt ─────────
  const apStopsRaw = await readCSV("stops.txt");
  for (const s of apStopsRaw) {
    const lat = parseFloat(s.stop_lat);
    const lon = parseFloat(s.stop_lon);
    if (!s.stop_id || !s.stop_name) continue;
    stops.set(s.stop_id, {
      stop_id: s.stop_id,
      stop_name: s.stop_name.trim(),
      stop_lat: isNaN(lat) ? 0 : lat,
      stop_lon: isNaN(lon) ? 0 : lon,
      dataset: "intercity",   // FIX: tag dataset so query.js can filter
    });
  }

  // VJA stops_merged — add city bus stops with "city" tag
  // Only adds NEW stop_ids, does NOT override intercity stops
  // (prevents city stop "VIJAYAWADA" id=100129 from shadowing intercity id=15881)
  const vjaStopsRaw = await readCSV("stops_merged.txt");
  for (const s of vjaStopsRaw) {
    const lat = parseFloat(s.stop_lat);
    const lon = parseFloat(s.stop_lon);
    if (!s.stop_id || !s.stop_name) continue;
    // FIX: only add if not already present from intercity dataset
    if (!stops.has(s.stop_id)) {
      stops.set(s.stop_id, {
        stop_id: s.stop_id,
        stop_name: s.stop_name.trim(),
        stop_lat: isNaN(lat) ? 0 : lat,
        stop_lon: isNaN(lon) ? 0 : lon,
        dataset: "city",
      });
    }
  }
  console.log(`  ✅ ${stops.size} stops loaded (AP + VJA)`);

  // ── 2. ROUTES: full AP routes.txt + VJA vja_routes.txt ──────────────────
  const apRoutesRaw = await readCSV("routes.txt");
  for (const r of apRoutesRaw) {
    if (!r.route_id) continue;
    const name = r.route_long_name || r.route_short_name || r.route_id;
    const parts = name.split(" - ");
    routes.set(r.route_id, {
      route_id: r.route_id,
      route_short_name: r.route_short_name || r.route_id,
      route_long_name: name,
      from: parts[0]?.trim() || "",
      to: parts[1]?.trim() || "",
      type: "intercity",
    });
  }

  const vjaRoutesRaw = await readCSV("vja_routes.txt");
  for (const r of vjaRoutesRaw) {
    if (!r.route_id) continue;
    const name = r.route_long_name || r.route_short_name || r.route_id;
    const parts = name.split(" - ");
    routes.set(r.route_id, {
      route_id: r.route_id,
      route_short_name: r.route_short_name || r.route_id,
      route_long_name: name,
      from: parts[0]?.trim() || "",
      to: parts[1]?.trim() || "",
      type: "city",
    });
  }
  console.log(`  ✅ ${routes.size} routes loaded (AP intercity + VJA city)`);

  // ── 3. TRIPS: full AP trips.txt + VJA vja_trips.txt ─────────────────────
  const apTripsRaw = await readCSV("trips.txt");
  for (const t of apTripsRaw) {
    if (!t.trip_id) continue;
    trips.set(t.trip_id, {
      trip_id: t.trip_id,
      route_id: t.route_id,
      headsign: t.trip_headsign || "",
    });
  }

  const vjaTripsRaw = await readCSV("vja_trips.txt");
  for (const t of vjaTripsRaw) {
    if (!t.trip_id) continue;
    trips.set(t.trip_id, {
      trip_id: t.trip_id,
      route_id: t.route_id,
      headsign: t.trip_headsign || "",
    });
  }
  console.log(`  ✅ ${trips.size} trips loaded`);

  // ── 4. STOP TIMES: full AP stop_times.txt + VJA vja_stop_times.txt ──────
  async function loadStopTimes(filename) {
    const raw = await readCSV(filename);
    const grouped = new Map();
    for (const st of raw) {
      if (!st.trip_id || !st.stop_id) continue;
      if (!grouped.has(st.trip_id)) grouped.set(st.trip_id, []);
      grouped.get(st.trip_id).push(st);
    }
    for (const [tripId, rows] of grouped) {
      rows.sort((a, b) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence));
      const enriched = rows.map((r) => {
        const stop = stops.get(r.stop_id) || {};
        return {
          stop_id: r.stop_id,           // stays as string (matches stops Map key)
          stop_name: stop.stop_name || r.stop_id,
          stop_lat: stop.stop_lat || 0,
          stop_lon: stop.stop_lon || 0,
          arrival_time: r.arrival_time,
          departure_time: r.departure_time,
          stop_sequence: parseInt(r.stop_sequence),
        };
      });
      stopTimes.set(tripId, enriched);
      for (const st of enriched) {
        if (!stopToTrips.has(st.stop_id)) stopToTrips.set(st.stop_id, new Set());
        stopToTrips.get(st.stop_id).add(tripId);
      }
    }
  }

  await loadStopTimes("stop_times.txt");
  await loadStopTimes("vja_stop_times.txt");

  console.log(`  ✅ ${stopTimes.size} trips with stop-times loaded`);
  console.log("🚌 GTFS ready! (Full AP + VJA)\n");
  gtfsLoaded = true;
}

module.exports = { loadGTFS, stops, routes, trips, stopTimes, stopToTrips };