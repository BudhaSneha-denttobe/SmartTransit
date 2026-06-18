const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Stop = require('../models/Stop');
const RouteModel = require('../models/Route');
const Trip = require('../models/Trip');
const StopTime = require('../models/StopTime');
const Shape = require('../models/Shape');

const GTFS_DIR = path.join(__dirname, '..', '..', 'GTFS_Data');

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath, { encoding: 'utf-8' })
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

async function importMainStops() {
  console.log('Importing main stops...');
  const rows = await parseCSV(path.join(GTFS_DIR, 'stops.txt'));
  const stops = rows.map((r) => ({
    stopId: r.stop_id,
    stopCode: r.stop_code || '',
    stopName: r.stop_name,
    latitude: parseFloat(r.stop_lat),
    longitude: parseFloat(r.stop_lon),
    locationType: r.location_type || '0',
    parentStation: r.parent_station || '',
    timezone: r.stop_timezone || '',
    wheelchairBoarding: r.wheelchair_boarding || '',
  })).filter(s => !isNaN(s.latitude) && !isNaN(s.longitude));

  await Stop.deleteMany({});
  await Stop.insertMany(stops);
  console.log(`Imported ${stops.length} main stops`);
}

async function importVjaStops() {
  console.log('Importing Vijayawada stops...');
  const rows = await parseCSV(path.join(GTFS_DIR, 'stops_merged.txt'));
  const stops = rows.map((r) => ({
    stopId: r.stop_id,
    stopCode: r.stop_code || '',
    stopName: r.stop_name,
    latitude: parseFloat(r.stop_lat),
    longitude: parseFloat(r.stop_lon),
    locationType: r.location_type || '0',
    parentStation: r.parent_station || '',
    timezone: r.stop_timezone || '',
    wheelchairBoarding: r.wheelchair_boarding || '',
  })).filter(s => !isNaN(s.latitude) && !isNaN(s.longitude));

  const existingIds = new Set((await Stop.find({}, { stopId: 1 }).lean()).map(s => s.stopId));
  const newStops = stops.filter(s => !existingIds.has(s.stopId));
  if (newStops.length > 0) {
    await Stop.insertMany(newStops);
  }
  console.log(`Imported ${newStops.length} new Vijayawada stops`);
}

async function importData(label, file, model, transform, isMain) {
  console.log(`Importing ${label}...`);
  const rows = await parseCSV(path.join(GTFS_DIR, file));
  const data = rows.map(transform);
  if (isMain) {
    await model.deleteMany({});
  }
  const batchSize = 5000;
  for (let i = 0; i < data.length; i += batchSize) {
    await model.insertMany(data.slice(i, i + batchSize));
  }
  console.log(`Imported ${data.length} ${label}`);
}

async function importAll() {
  await connectDB();
  console.log('Starting GTFS import...\n');

  await importMainStops();
  await importVjaStops();

  await importData('main routes', 'routes.txt', RouteModel,
    (r) => ({
      routeId: r.route_id,
      agencyId: r.agency_id || '',
      routeNumber: r.route_short_name,
      routeName: r.route_long_name || r.route_short_name,
      routeType: r.route_type || '',
      routeColor: r.route_color || '',
      routeTextColor: r.route_text_color || '',
    }), true);

  await importData('Vijayawada routes', 'vja_routes.txt', RouteModel,
    (r) => ({
      routeId: r.route_id,
      agencyId: r.agency_id || '',
      routeNumber: r.route_short_name,
      routeName: r.route_long_name || r.route_short_name,
      routeType: r.route_type || '',
      routeColor: r.route_color || '',
      routeTextColor: r.route_text_color || '',
    }), false);

  await importData('main trips', 'trips.txt', Trip,
    (r) => ({
      tripId: r.trip_id,
      routeId: r.route_id,
      serviceId: r.service_id || '',
      tripHeadsign: r.trip_headsign || '',
      directionId: r.direction_id || '',
      blockId: r.block_id || '',
      shapeId: r.shape_id || '',
    }), true);

  await importData('Vijayawada trips', 'vja_trips.txt', Trip,
    (r) => ({
      tripId: r.trip_id,
      routeId: r.route_id,
      serviceId: r.service_id || '',
      tripHeadsign: r.trip_headsign || '',
      directionId: r.direction_id || '',
      blockId: r.block_id || '',
      shapeId: r.shape_id || '',
    }), false);

  await importData('main stop times', 'stop_times.txt', StopTime,
    (r) => ({
      tripId: r.trip_id,
      arrivalTime: r.arrival_time,
      departureTime: r.departure_time,
      stopId: r.stop_id,
      stopSequence: parseInt(r.stop_sequence, 10),
      pickupType: r.pickup_type || '',
      dropOffType: r.drop_off_type || '',
    }), true);

  await importData('Vijayawada stop times', 'vja_stop_times.txt', StopTime,
    (r) => ({
      tripId: r.trip_id,
      arrivalTime: r.arrival_time,
      departureTime: r.departure_time,
      stopId: r.stop_id,
      stopSequence: parseInt(r.stop_sequence, 10),
      pickupType: r.pickup_type || '',
      dropOffType: r.drop_off_type || '',
    }), false);

  await importData('main shapes', 'shapes.txt', Shape,
    (r) => ({
      shapeId: r.shape_id,
      latitude: parseFloat(r.shape_pt_lat),
      longitude: parseFloat(r.shape_pt_lon),
      sequence: parseInt(r.shape_pt_sequence, 10),
    }), true);

  await importData('Vijayawada shapes', 'vja_shapes.txt', Shape,
    (r) => ({
      shapeId: r.shape_id,
      latitude: parseFloat(r.shape_pt_lat),
      longitude: parseFloat(r.shape_pt_lon),
      sequence: parseInt(r.shape_pt_sequence, 10),
    }), false);

  console.log('\nGTFS import complete!');
  process.exit(0);
}

importAll().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
