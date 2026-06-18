import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import AnimatedBusRoute from '../components/AnimatedBusRoute';

const srcIcon = L.divIcon({
  className: '',
  html: '<div style="width:26px;height:26px;background:#FACC15;border:3px solid #38BDF8;border-radius:50%;box-shadow:0 0 14px rgba(56,189,248,0.6);"></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const dstIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;background:#38BDF8;border:2px solid white;border-radius:50%;box-shadow:0 0 8px rgba(56,189,248,0.5);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const busIcon = L.divIcon({
  className: '',
  html: '<div style="width:32px;height:32px;background:linear-gradient(135deg,#00bfff,#00ff87);border-radius:50%;border:3px solid white;box-shadow:0 0 24px rgba(0,191,255,0.7);display:flex;align-items:center;justify-content:center;font-size:16px;">🚍</div>',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const API = '/api';

function toSeconds(t) {
  if (!t) return 0;
  const p = t.split(':');
  return Number(p[0]) * 3600 + Number(p[1]) * 60 + Number(p[2] || 0);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function MapBounds({ stops, shape }) {
  const map = useMap();
  useEffect(() => {
    const points = [...stops.map(s => [s.latitude, s.longitude]), ...shape.map(s => [s.latitude, s.longitude])].filter(p => p[0] && p[1]);
    if (points.length > 0) {
      map.fitBounds(points, { padding: [60, 60] });
    }
  }, [stops, shape, map]);
  return null;
}

export default function BusSearch() {
  const [busNumber, setBusNumber] = useState('');
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [shape, setShape] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busPos, setBusPos] = useState(null);
  const [currentStopIdx, setCurrentStopIdx] = useState(-1);
  const [nextStopIdx, setNextStopIdx] = useState(-1);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRoute(null);
    setStops([]);
    setShape([]);
    setBusPos(null);
    try {
      const res = await fetch(`${API}/routes/${encodeURIComponent(busNumber)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRoute(data.route);
      setStops(data.stops || []);
      setShape(data.shape || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const routeCoordinates = useMemo(() => shape.map((s) => [s.latitude, s.longitude]), [shape]);

  const updateBusPosition = useCallback(() => {
    if (stops.length < 2 || shape.length < 2) return;
    const now = new Date();
    const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const times = stops.map(s => toSeconds(s.arrivalTime));
    let idx = times.findIndex(t => t > currentSec);
    if (idx === -1) { idx = times.length - 1; }
    if (idx === 0) { idx = 1; }
    const fromIdx = idx - 1;
    const toIdx = idx;

    setCurrentStopIdx(fromIdx);
    setNextStopIdx(toIdx);

    const fromTime = times[fromIdx];
    const toTime = times[toIdx];
    const progress = toTime > fromTime ? (currentSec - fromTime) / (toTime - fromTime) : 0;

    const fromLat = stops[fromIdx].latitude;
    const fromLng = stops[fromIdx].longitude;
    const toLat = stops[toIdx].latitude;
    const toLng = stops[toIdx].longitude;

    const shapePoints = shape.map(s => ({ lat: s.latitude, lng: s.longitude }));
    const fromShapeIdx = shapePoints.findIndex(p => Math.abs(p.lat - fromLat) < 0.001 && Math.abs(p.lng - fromLng) < 0.001);
    const toShapeIdx = shapePoints.findIndex(p => Math.abs(p.lat - toLat) < 0.001 && Math.abs(p.lng - toLng) < 0.001);

    if (fromShapeIdx !== -1 && toShapeIdx !== -1 && toShapeIdx > fromShapeIdx) {
      const segLen = toShapeIdx - fromShapeIdx;
      const ptIdx = Math.min(fromShapeIdx + Math.floor(progress * segLen), toShapeIdx);
      const pt = shapePoints[ptIdx];
      setBusPos({ lat: pt.lat, lng: pt.lng, from: stops[fromIdx].stopName, to: stops[toIdx].stopName });
    } else {
      setBusPos({
        lat: lerp(fromLat, toLat, progress),
        lng: lerp(fromLng, toLng, progress),
        from: stops[fromIdx].stopName,
        to: stops[toIdx].stopName,
      });
    }
  }, [stops, shape]);

  useEffect(() => {
    if (stops.length > 0) {
      updateBusPosition();
      const interval = setInterval(updateBusPosition, 5000);
      return () => clearInterval(interval);
    }
  }, [stops, updateBusPosition]);

  const srcStop = stops.length > 0 ? stops[0] : null;
  const dstStop = stops.length > 1 ? stops[stops.length - 1] : null;

  const currentInfo = busPos && currentStopIdx >= 0 && nextStopIdx >= 0 ? {
    at: stops[currentStopIdx].stopName,
    next: stops[nextStopIdx].stopName,
    dep: stops[currentStopIdx].departureTime,
    arr: stops[nextStopIdx].arrivalTime,
  } : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatedBusRoute />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Bus Search</h1>
        <p className="text-gray-500">Search bus routes by number</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Bus Number</label>
                <input
                  type="text"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                  placeholder="e.g. 1"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full px-5 py-2.5 bg-[#0099FF] text-white font-semibold rounded-full hover:bg-[#0077CC] transition-colors">
                {loading ? 'Searching...' : 'Search Bus'}
              </button>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {route && (
              <div className="mt-6 space-y-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <h3 className="text-[#0099FF] font-bold text-lg mb-2">
                    Bus #{route.routeNumber}
                  </h3>
                  <p className="text-gray-500 text-sm">{route.routeName}</p>
                  <p className="text-gray-500 text-xs mt-1">ID: {route.routeId}</p>
                </div>

                {currentInfo && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm border-l-4 border-l-[#0099FF]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Live Position</p>
                    <p className="text-gray-800 font-bold text-lg mt-1">
                      🚍 {busPos ? `${busPos.lat.toFixed(4)}, ${busPos.lng.toFixed(4)}` : '...'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      At: <span className="text-[#0099FF] font-semibold">{currentInfo.at}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Next: <span className="text-green-400 font-semibold">{currentInfo.next}</span>
                      <span className="text-gray-500 text-xs ml-2">(arr {currentInfo.arr})</span>
                    </p>
                  </div>
                )}

                {stops.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Stops ({stops.length})
                    </h4>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {stops.map((stop, i) => {
                        const isAt = i === currentStopIdx;
                        const isNext = i === nextStopIdx;
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                              isAt ? 'bg-[#0099FF]/10 border border-[#0099FF]/30' :
                              isNext ? 'bg-green-400/10 border border-green-400/30' :
                              'hover:bg-gray-50'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isAt ? 'bg-[#0099FF] text-white' :
                              isNext ? 'bg-green-400 text-white' :
                              'bg-[#0099FF]/10 text-[#0099FF]'
                            }`}>
                              {stop.stopSequence}
                            </span>
                            <div className="flex-1">
                              <span className={`${isAt ? 'text-[#0099FF] font-bold' : isNext ? 'text-green-300 font-bold' : 'text-gray-800'}`}>
                                {i === 0 ? '🟡 ' : i === stops.length - 1 ? '🔵 ' : ''}
                                {stop.stopName}
                              </span>
                              <div className="text-gray-500 text-xs">
                                {stop.arrivalTime} - {stop.departureTime}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden" style={{ height: '600px', border: '1px solid rgba(56,189,248,0.2)' }}>
            <MapContainer
              center={[16.5062, 80.6480]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapBounds stops={stops} shape={shape} />

              {routeCoordinates.length > 1 && (
                <Polyline
                  positions={routeCoordinates}
                  pathOptions={{ color: '#38BDF8', weight: 3, opacity: 0.7 }}
                />
              )}

              {srcStop && srcStop.latitude && srcStop.longitude && (
                <Marker position={[srcStop.latitude, srcStop.longitude]} icon={srcIcon}>
                  <Popup><div className="text-sm font-semibold">Start: {srcStop.stopName}</div></Popup>
                </Marker>
              )}

              {dstStop && dstStop.latitude && dstStop.longitude && (
                <Marker position={[dstStop.latitude, dstStop.longitude]} icon={dstIcon}>
                  <Popup><div className="text-sm font-semibold">End: {dstStop.stopName}</div></Popup>
                </Marker>
              )}

              {busPos && busPos.lat && busPos.lng && (
                <Marker position={[busPos.lat, busPos.lng]} icon={busIcon}>
                  <Popup>
                    <div className="text-sm">
                      <strong className="text-[#0099FF]">🚍 Bus {route?.routeNumber || ''}</strong>
                      <br />
                      <span className="text-gray-600">From: {busPos.from}</span>
                      <br />
                      <span className="text-gray-600">To: {busPos.to}</span>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
