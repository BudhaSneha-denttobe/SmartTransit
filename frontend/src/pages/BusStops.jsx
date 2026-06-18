import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MapView from '../components/MapView';
import BusStopCard from '../components/BusStopCard';
import ArrivingBusesModal from '../components/ArrivingBusesModal';
import AnimatedBusRoute from '../components/AnimatedBusRoute';

const API = '/api';

export default function BusStops() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stops, setStops] = useState([]);
  const [allStops, setAllStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([17.385, 78.4867]);
  const [mapZoom, setMapZoom] = useState(12);
  const [arrivingStop, setArrivingStop] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [radius, setRadius] = useState(2);

  useEffect(() => {
    fetch(`${API}/stops`)
      .then((r) => r.json())
      .then((data) => setAllStops(data))
      .catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setGeoError(null);
    setStops([]);
    setUserLocation(null);

    try {
      const geoRes = await fetch(`${API}/stops/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: searchQuery }),
      });

      if (!geoRes.ok) {
        const geoData = await geoRes.json();
        throw new Error(geoData.message || 'Invalid location');
      }

      const geoData = await geoRes.json();
      const location = { lat: geoData.lat, lng: geoData.lng };
      setSearchedLocation(location);
      setMapCenter([location.lat, location.lng]);
      setMapZoom(14);

      const stopsRes = await fetch(`${API}/stops/nearby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          radius: radius * 1000,
          query: searchQuery,
        }),
      });

      if (!stopsRes.ok) throw new Error('Failed to find nearby stops');

      const stopsData = await stopsRes.json();
      setStops(stopsData);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);
    setGeoError(null);
    setStops([]);
    setSearchedLocation(null);
    setUserLocation(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setMapCenter([location.lat, location.lng]);
        setMapZoom(14);

        try {
          const stopsRes = await fetch(`${API}/stops/nearby`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: location.lat,
              lng: location.lng,
              radius: radius * 1000,
            }),
          });

          if (!stopsRes.ok) throw new Error('Failed to find nearby stops');

          const stopsData = await stopsRes.json();
          setStops(stopsData);
        } catch (err) {
          setError(err.message);
        }

        setLoading(false);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Location permission denied. Please enable location access.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setGeoError('The request to get your location timed out.');
            break;
          default:
            setGeoError('An unknown error occurred.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleViewOnMap = (stop) => {
    setMapCenter([stop.lat, stop.lng]);
    setMapZoom(16);
  };

  const handleArrivingBuses = (stop) => {
    setArrivingStop(stop);
  };

  const hasActiveSearch = searchedLocation || userLocation;

  // MapView expects stops with latitude/longitude field names
  const mapStops = stops.map((s) => ({
    stopId: s.stopId || s.placeId,
    stopName: s.name || s.stopName,
    latitude: s.lat ?? s.latitude,
    longitude: s.lng ?? s.longitude,
    distance: s.distance,
  }));

  const mapAllStops = allStops.map((s) => ({
    stopId: s.stopId,
    stopName: s.stopName,
    latitude: s.latitude,
    longitude: s.longitude,
  }));

  // MapView expects userLocation as [lat, lng] array
  const mapUserLocation = userLocation
    ? [userLocation.lat, userLocation.lng]
    : searchedLocation
    ? [searchedLocation.lat, searchedLocation.lng]
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatedBusRoute />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Bus Stops</h1>
        <p className="text-gray-500">
          Find nearby bus stops by searching or using your current location
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Search Location
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                  placeholder="Enter a location (e.g., Benz Circle, Vijayawada)"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Search Radius: {radius} km
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full accent-[#0099FF] h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 km</span>
                  <span>10 km</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-5 py-2.5 bg-[#0099FF] text-white font-semibold rounded-full hover:bg-[#0077CC] transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : (
                  'Search'
                )}
              </button>
            </form>

            <div className="mt-4">
              <button
                onClick={handleUseMyLocation}
                disabled={loading}
                className="w-full px-4 py-3 text-sm font-medium rounded-lg border border-[#0099FF]/30 text-[#0099FF] hover:bg-[#0099FF]/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span role="img" aria-label="location">📍</span>
                Use My Location
              </button>
            </div>

            {geoError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-3 bg-red-400/10 border border-red-400/20 rounded-lg p-3"
              >
                {geoError}
              </motion.p>
            )}
          </motion.div>

          {/* Stops List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {hasActiveSearch
                ? `Nearby Stops (${stops.length})`
                : `All Bus Stops (${allStops.length})`}
            </h2>

            {loading && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-3xl mb-3">
                  {error.includes('permission') ? '🚫' : error.includes('No nearby') ? '📍' : '⚠️'}
                </p>
                <p className="text-gray-500 text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && allStops.length === 0 && stops.length === 0 && !hasActiveSearch && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-3xl mb-3">📍</p>
                <p className="text-gray-500 text-sm">
                  Search for a location or use your current location to find nearby bus stops.
                </p>
              </div>
            )}

            {!loading && !error && stops.length === 0 && hasActiveSearch && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-3xl mb-3">📍</p>
                <p className="text-gray-500 text-sm">
                  No nearby bus stops found within {radius} km.
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Try increasing the search radius.
                </p>
              </div>
            )}

            {!loading && !hasActiveSearch && allStops.length > 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">
                  All {allStops.length} stops are shown on the map.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Search for a location to filter nearby stops.
                </p>
              </div>
            )}

            {!loading && stops.length > 0 && (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {stops.map((stop, i) => (
                  <BusStopCard
                    key={stop.placeId || stop.stopId || i}
                    stop={stop}
                    index={i}
                    onViewMap={handleViewOnMap}
                    onArrivingBuses={handleArrivingBuses}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <MapView
            stops={mapStops}
            allStops={mapAllStops}
            userLocation={mapUserLocation}
            center={mapCenter}
            zoom={mapZoom}
            height="600px"
          />
        </div>
      </div>

      {arrivingStop && (
        <ArrivingBusesModal
          stop={arrivingStop}
          onClose={() => setArrivingStop(null)}
        />
      )}
    </div>
  );
}
