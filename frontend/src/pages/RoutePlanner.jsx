import { useState } from 'react';
import { motion } from 'framer-motion';
import RouteDetailModal from '../components/RouteDetailModal';
import AnimatedBusRoute from '../components/AnimatedBusRoute';

const BUS_TYPES = ['All', 'Ordinary', 'Express', 'AC', 'Electric'];
const SORT_OPTIONS = [
  { value: 'fastest', label: 'Fastest' },
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'least_transfers', label: 'Least Transfers' },
  { value: 'earliest', label: 'Earliest Arrival' },
];

export default function RoutePlanner() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);

  const [directOnly, setDirectOnly] = useState(false);
  const [maxTransfers, setMaxTransfers] = useState('1');
  const [busType, setBusType] = useState('All');
  const [fareMin, setFareMin] = useState('');
  const [fareMax, setFareMax] = useState('');
  const [arrivalBefore, setArrivalBefore] = useState('');
  const [sortBy, setSortBy] = useState('fastest');

  const [showFilters, setShowFilters] = useState(false);

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set('source', source.trim());
    params.set('destination', destination.trim());
    if (directOnly) params.set('directOnly', 'true');
    params.set('maxTransfers', maxTransfers);
    if (busType !== 'All') params.set('busType', busType);
    if (fareMin) params.set('fareMin', fareMin);
    if (fareMax) params.set('fareMax', fareMax);
    if (arrivalBefore) params.set('arrivalBefore', arrivalBefore);
    params.set('sortBy', sortBy);
    return params.toString();
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!source.trim() || !destination.trim()) {
      setError('Please enter both source and destination');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/route-planner/search?${buildQuery()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Search failed');
      }
      const data = await res.json();
      setRoutes(data.routes || []);
      const token = localStorage.getItem('token');
      if (token) {
        fetch('/api/search-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            source: source.trim(),
            destination: destination.trim(),
            filters: { directOnly: directOnly ? 'true' : undefined, maxTransfers, busType: busType !== 'All' ? busType : undefined, fareMin, fareMax, arrivalBefore, sortBy },
          }),
        }).catch(() => {});
      }
    } catch (err) {
      setError(err.message);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  return (
    <div className="min-h-screen bg-white">
      <AnimatedBusRoute />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Route Planner</h1>
          <p className="text-gray-500">Find the best route between any two stops</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
        >
          <form onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm text-gray-600 mb-1">Source</label>
                <input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                  placeholder="e.g. KABELA"
                />
              </div>
              <button
                type="button"
                onClick={handleSwap}
                className="mb-1 p-2.5 rounded-lg bg-[#0099FF]/10 text-[#0099FF] hover:bg-[#0099FF]/20 transition-colors"
                title="Swap source and destination"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </button>
              <div className="flex-1 w-full">
                <label className="block text-sm text-gray-600 mb-1">Destination</label>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                  placeholder="e.g. AUTONAGAR"
                />
              </div>
              <button type="submit" className="w-full md:w-auto px-8 py-2.5 bg-[#0099FF] text-white font-semibold rounded-full hover:bg-[#0077CC] transition-colors">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : 'Search'}
              </button>
            </div>
          </form>

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0099FF] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); if (searched) handleSearch(); }}
                className="bg-white border border-gray-200 text-gray-800 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#0099FF]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Direct Buses Only</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={directOnly}
                      onChange={(e) => setDirectOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0099FF] focus:ring-[#0099FF]"
                    />
                    <span className="text-sm text-gray-700">Direct</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max Transfers</label>
                  <select
                    value={maxTransfers}
                    onChange={(e) => setMaxTransfers(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0099FF]"
                  >
                    <option value="0">Direct Only</option>
                    <option value="1">Max 1 Transfer</option>
                    <option value="2">Max 2 Transfers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Bus Type</label>
                  <select
                    value={busType}
                    onChange={(e) => setBusType(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0099FF]"
                  >
                    {BUS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min Fare (₹)</label>
                  <input
                    type="number"
                    value={fareMin}
                    onChange={(e) => setFareMin(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#0099FF]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max Fare (₹)</label>
                  <input
                    type="number"
                    value={fareMax}
                    onChange={(e) => setFareMax(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#0099FF]"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Arrival Before</label>
                  <input
                    type="time"
                    value={arrivalBefore}
                    onChange={(e) => setArrivalBefore(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0099FF]"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setDirectOnly(false);
                    setMaxTransfers('1');
                    setBusType('All');
                    setFareMin('');
                    setFareMax('');
                    setArrivalBefore('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-800 transition-colors mr-4"
                >
                  Reset Filters
                </button>
                <button onClick={handleSearch} className="px-6 py-2 bg-[#0099FF] text-white font-semibold rounded-full text-sm hover:bg-[#0077CC] transition-colors">
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#0099FF] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && routes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No routes found</p>
            <p className="text-gray-400 text-sm mt-1">Try different stops or adjust filters</p>
          </motion.div>
        )}

        {!loading && routes.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Found {routes.length} route{routes.length !== 1 ? 's' : ''}
            </p>
            {routes.map((route, i) => (
              <motion.div
                key={`${route.routeId}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedRoute(route)}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:border-[#0099FF]/30 cursor-pointer transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2.5 py-0.5 bg-[#0099FF]/10 text-[#0099FF] text-sm font-semibold rounded-md">
                        {route.busType}
                      </span>
                      <span className="text-gray-800 font-semibold text-lg">#{route.routeNumber}</span>
                      {route.transfers > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-md border border-yellow-200">
                          {route.transfers} transfer
                        </span>
                      )}
                      {route.transfers === 0 && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-md border border-green-200">
                          Direct
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-800 font-medium">{route.sourceStop}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0099FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                      <span className="text-gray-800 font-medium">{route.destinationStop}</span>
                    </div>
                    {route.transferStop && (
                      <p className="text-xs text-gray-400 mt-1">
                        Change at {route.transferStop}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Time</p>
                      <p className="text-gray-800 font-semibold">{route.travelTime}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Distance</p>
                      <p className="text-gray-800 font-semibold">{route.distance} km</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Fare</p>
                      <p className="text-green-600 font-bold">₹{route.fare}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Departs</p>
                      <p className="text-gray-800 font-semibold">{route.departureTime}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Arrives</p>
                      <p className="text-gray-800 font-semibold">{route.arrivalTime}</p>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center text-gray-300 group-hover:text-[#0099FF] transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedRoute && (
        <RouteDetailModal
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
        />
      )}
    </div>
  );
}
