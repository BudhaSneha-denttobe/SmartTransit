import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function RouteDetailModal({ route, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/route-planner/${route.routeId}`);
        if (res.ok) {
          const data = await res.json();
          setDetail(data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    if (route.routeId) fetchDetail();
    else setLoading(false);
  }, [route.routeId]);

  const stops = detail?.stops || [];
  const distance = detail?.distance || route.distance;
  const fare = detail?.fare || route.fare;
  const busType = detail?.busType || route.busType;
  const busLocation = detail?.busLocation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Route Details</h2>
            <p className="text-sm text-gray-500">#{route.routeNumber} &middot; {busType}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#F0F8FF] rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Distance</p>
              <p className="text-lg font-bold text-gray-800">{distance} km</p>
            </div>
            <div className="bg-[#F0F8FF] rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Fare</p>
              <p className="text-lg font-bold text-green-600">₹{fare}</p>
            </div>
            <div className="bg-[#F0F8FF] rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Travel Time</p>
              <p className="text-lg font-bold text-gray-800">{route.travelTime}</p>
            </div>
            <div className="bg-[#F0F8FF] rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Stops</p>
              <p className="text-lg font-bold text-gray-800">{route.stopsCount || stops.length}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{route.sourceStop}</p>
                  <p className="text-xs text-gray-500">Departs {route.departureTime}</p>
                </div>
              </div>
              <div className="flex-1 mx-4 border-t border-dashed border-gray-300 relative">
                {route.transferStop && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FFCC00]/10 px-2 py-0.5 rounded text-xs text-[#b38600] whitespace-nowrap border border-[#FFCC00]/30">
                    Change at {route.transferStop}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-sm font-medium text-gray-800">{route.destinationStop}</p>
                  <p className="text-xs text-gray-500">Arrives {route.arrivalTime}</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-[#0099FF]" />
              </div>
            </div>

            {route.firstLeg && route.secondLeg && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Leg 1:</span>
                  <span className="text-gray-800">{route.firstLeg.routeNumber} &mdash; {route.firstLeg.fromStop} → {route.firstLeg.toStop}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Leg 2:</span>
                  <span className="text-gray-800">{route.secondLeg.routeNumber} &mdash; {route.secondLeg.fromStop} → {route.secondLeg.toStop}</span>
                </div>
              </div>
            )}
          </div>

          {busLocation && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Current Bus Location</h3>
              <p className="text-sm text-gray-500">
                Lat: {busLocation.latitude?.toFixed(4)}, Lng: {busLocation.longitude?.toFixed(4)}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Complete Stop List</h3>
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#0099FF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : stops.length > 0 ? (
              <div className="space-y-1">
                {stops.map((stop, i) => (
                  <div
                    key={stop.stopId || i}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-green-400' : i === stops.length - 1 ? 'bg-[#0099FF]' : 'bg-gray-300'}`} />
                      {i < stops.length - 1 && <div className="w-0.5 h-4 bg-gray-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{stop.stopName}</p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {stop.arrivalTime && <span>Arr: {stop.arrivalTime}</span>}
                      {stop.departureTime && <span className="ml-2">Dep: {stop.departureTime}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Stop details not available</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
