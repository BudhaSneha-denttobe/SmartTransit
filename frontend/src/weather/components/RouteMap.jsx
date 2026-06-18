import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function createWeatherIcon(loc) {
  const isRain = loc.rainProbability > 50;
  const isHot = loc.temperature > 36;
  let bg = '#0099FF';
  let label = `${loc.temperature}°`;
  if (isRain) bg = '#60a5fa';
  if (isHot) bg = '#f97316';
  if (isRain && isHot) bg = '#8b5cf6';

  return L.divIcon({
    className: '',
    html: `<div style="
      width: 44px; height: 44px;
      border-radius: 50%;
      background: ${bg};
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      line-height: 1.1;
      border: 3px solid white;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      cursor: pointer;
    ">${label}${isRain ? '<span style="font-size:8px">🌧</span>' : ''}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

const startIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #22c55e;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">🚌</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

const endIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #ef4444;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">📍</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

function MapBounds({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(l => [l.lat, l.lng])
      );
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [locations, map]);
  return null;
}

export default function RouteMap({ locations, source, destination }) {
  const center = locations.length > 0
    ? [locations[0].lat, locations[0].lng]
    : [16.5062, 80.6480];

  const polylinePositions = useMemo(
    () => locations.map(l => [l.lat, l.lng]),
    [locations]
  );

  const middleLocs = useMemo(
    () => locations.slice(1, -1),
    [locations]
  );

  return (
    <div className="animate-slideUp delay-400 group">
      <h2 className="text-lg font-semibold text-blue-500 mb-4 flex items-center gap-2 group-hover:text-blue-500 transition-colors duration-300">
        <span className="material-symbols-outlined text-blue-400">map</span>
        Route Map
      </h2>
      <div className="backdrop-blur-xl bg-white/20 rounded-2xl border border-white/20 p-2 sm:p-3 shadow-xl overflow-hidden">
        <div className="rounded-xl overflow-hidden" style={{ height: '450px' }}>
          <MapContainer
            center={center}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapBounds locations={locations} />

            {polylinePositions.length > 1 && (
              <Polyline
                positions={polylinePositions}
                pathOptions={{
                  color: '#0099FF',
                  weight: 4,
                  opacity: 0.7,
                  dashArray: '10 6',
                }}
              />
            )}

            {locations[0] && (
              <Marker position={[locations[0].lat, locations[0].lng]} icon={startIcon}>
                <Popup>
                  <div className="text-sm font-medium text-gray-800">
                    🚌 {source}<br />
                    <span className="text-xs text-gray-500">{locations[0].temperature}°C • {locations[0].condition}</span>
                  </div>
                </Popup>
              </Marker>
            )}

            {middleLocs.map((loc, i) => (
              <Marker key={loc.name + i} position={[loc.lat, loc.lng]} icon={createWeatherIcon(loc)}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-800">{loc.name}</p>
                    <p className="text-xs text-gray-500">{loc.time}</p>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <p>🌡 {loc.temperature}°C — {loc.condition}</p>
                      <p>🌧 Rain: {loc.rainProbability}%</p>
                      <p>💨 Wind: {loc.windSpeed} km/h</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {locations.length > 1 && (
              <Marker
                position={[locations[locations.length - 1].lat, locations[locations.length - 1].lng]}
                icon={endIcon}
              >
                <Popup>
                  <div className="text-sm font-medium text-gray-800">
                    📍 {destination}<br />
                    <span className="text-xs text-gray-500">{locations[locations.length - 1].temperature}°C • {locations[locations.length - 1].condition}</span>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-[#22c55e]" /> Source
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-[#0099FF]" /> Waypoint
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-[#f97316]" /> Heat Alert
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-[#60a5fa]" /> Rain Alert
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-[#ef4444]" /> Destination
          </span>
        </div>
      </div>
    </div>
  );
}
