import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API = '/api';

export default function ArrivingBusesModal({ stop, onClose }) {
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchArrivals = async () => {
      setLoading(true);
      setError(null);
      try {
        const searchRes = await fetch(
          `${API}/stops/search?q=${encodeURIComponent(stop.name)}`
        );
        const stopsData = await searchRes.json();

        if (!cancelled) {
          if (stopsData.length > 0) {
            const localStop = stopsData[0];
            const arrivalsRes = await fetch(
              `${API}/stops/${localStop.stopId}/arrivals`
            );
            const data = await arrivalsRes.json();
            setArrivals(data.arrivals || []);
          } else {
            setArrivals([]);
          }
        }
      } catch {
        if (!cancelled) {
          setError('Failed to fetch arriving buses. Please try again.');
        }
      }
      if (!cancelled) setLoading(false);
    };

    fetchArrivals();
    return () => { cancelled = true; };
  }, [stop]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex justify-between items-center p-6 pb-4 border-b border-gray-100 bg-white">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-gray-800">Arriving Buses</h2>
            <p className="text-gray-500 text-sm mt-1 truncate">{stop.name}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0"
          >
            &times;
          </button>
        </div>

        <div className="p-6 pt-4">
          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-8 h-8 border-2 border-[#0099FF] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading arrivals...</p>
            </div>
          )}

          {!loading && error && (
            <p className="text-red-500 text-center py-8">{error}</p>
          )}

          {!loading && !error && arrivals.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-3xl mb-2">🚌</p>
              <p className="text-gray-500 text-sm">
                No arriving buses found at this stop.
              </p>
            </div>
          )}

          {!loading && arrivals.length > 0 && (
            <div className="space-y-3">
              {arrivals.map((bus, i) => (
                <motion.div
                  key={`${bus.tripId}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#0099FF] font-bold text-lg">
                      {bus.routeNumber}
                    </span>
                    <span className="text-gray-600 text-sm font-medium">
                      {bus.arrivalTime}
                    </span>
                  </div>
                  {bus.routeName && (
                    <p className="text-gray-700 text-sm mb-1">{bus.routeName}</p>
                  )}
                  <p className="text-gray-400 text-xs">
                    Destination: {bus.destination}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
