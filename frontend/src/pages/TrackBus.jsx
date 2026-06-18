import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import TrackBusMap from '../components/TrackBusMap';
import AnimatedBusRoute from '../components/AnimatedBusRoute';

const API = '/api';

export default function TrackBus() {
  const [busNumber, setBusNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const intervalRef = useRef(null);

  const startTracking = useCallback(async (number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/bus/track/${encodeURIComponent(number)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTrackingData(data);
      setIsTracking(true);
    } catch (err) {
      setError(err.message);
      setIsTracking(false);
    }
    setLoading(false);
  }, []);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
    setTrackingData(null);
  }, []);

  useEffect(() => {
    if (!isTracking || !busNumber) return;
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/bus/track/${encodeURIComponent(busNumber)}`);
        const data = await res.json();
        if (res.ok) setTrackingData(data);
      } catch {
        // ignore polling errors
      }
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTracking, busNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!busNumber.trim()) return;
    stopTracking();
    startTracking(busNumber.trim());
  };

  const busPosition = trackingData
    ? [trackingData.currentLocation.lat, trackingData.currentLocation.lng]
    : null;

  const progress = trackingData
    ? ((trackingData.currentIndex / trackingData.totalPoints) * 100).toFixed(1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatedBusRoute />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 font-bold mb-2">Track Bus</h1>
        <p className="text-gray-500">
          Enter a bus number to track its real-time location on the route
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Bus Number
                </label>
                <input
                  type="text"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                  placeholder="e.g. APSRTC-1001"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || isTracking}
                  className="flex-1 px-5 py-2.5 bg-[#0099FF] text-white font-semibold rounded-full hover:bg-[#0077CC] transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Tracking...
                    </span>
                  ) : isTracking ? (
                    'Tracking...'
                  ) : (
                    'Track Bus'
                  )}
                </button>
                {isTracking && (
                  <button
                    type="button"
                    onClick={stopTracking}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                  >
                    Stop
                  </button>
                )}
              </div>
            </form>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}
          </motion.div>

          {trackingData && (
            <>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Bus Information
                </h2>
                <div className="space-y-3">
                  <InfoRow
                    label="Bus Number"
                    value={trackingData.busNumber}
                  />
                  <InfoRow
                    label="Route Name"
                    value={trackingData.routeName}
                  />
                  <InfoRow
                    label="Source"
                    value={trackingData.sourceStop}
                  />
                  <InfoRow
                    label="Destination"
                    value={trackingData.destinationStop}
                  />
                  <InfoRow
                    label="Route Distance"
                    value={trackingData.routeDistance}
                  />
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Journey Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0099FF] to-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Live Status
                </h2>
                <div className="space-y-3">
                  <InfoRow
                    label="Current Location"
                    value={`${trackingData.currentLocation.lat.toFixed(4)}, ${trackingData.currentLocation.lng.toFixed(4)}`}
                  />
                  <InfoRow
                    label="Next Stop"
                    value={trackingData.nextStop}
                  />
                  <InfoRow
                    label="Estimated Arrival"
                    value={trackingData.eta}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </span>
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </div>
              </motion.div>

              {trackingData.stops && trackingData.stops.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Route Stops ({trackingData.stops.length})
                  </h2>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {trackingData.stops.map((stop, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50"
                      >
                        <span className="w-6 h-6 rounded-full bg-[#0099FF]/10 text-[#0099FF] flex items-center justify-center text-xs font-bold">
                          {stop.stopSequence}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-800 truncate block">
                            {stop.stopName}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {stop.arrivalTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {!trackingData && !loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            >
              <p className="text-gray-400 text-3xl mb-3">🚍</p>
              <p className="text-gray-500 text-sm">
                Enter a bus number above to start tracking its live location on the map.
              </p>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-2">
          {trackingData ? (
            <TrackBusMap
              shape={trackingData.shape || []}
              busPosition={busPosition}
              currentIndex={trackingData.currentIndex}
              totalPoints={trackingData.totalPoints}
              nextStopIndex={trackingData.nextStopIndex}
              sourceStop={trackingData.stops?.[0] || null}
              destinationStop={
                trackingData.stops?.[trackingData.stops.length - 1] || null
              }
              stops={trackingData.stops || []}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center"
              style={{ height: '600px' }}
            >
              <div className="text-center">
                <p className="text-gray-600 text-5xl mb-4">🗺️</p>
                <p className="text-gray-500">
                  Map will appear here when tracking a bus
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}
