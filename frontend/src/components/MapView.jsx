import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const busIcon = L.divIcon({
  className: 'bus-marker',
  html: '<div style="width:24px;height:24px;background:linear-gradient(135deg,#00bfff,#00ff87);border-radius:50%;border:3px solid white;box-shadow:0 0 20px rgba(0,191,255,0.5);"></div>',
  iconSize: [30, 30],
  iconAnchor: [17, 17],
});

const stopIcon = L.divIcon({
  className: 'stop-marker',
  html: '<div style="font-size:32px;line-height:1;text-align:center;">🚏</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const dotIcon = L.divIcon({
  className: 'dot-marker',
  html: '<div style="width:8px;height:8px;background:#00bfff;border-radius:50%;border:1px solid white;opacity:0.7;"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const userIcon = L.divIcon({
  className: 'user-marker',
  html: '<div style="width:20px;height:20px;background:linear-gradient(135deg,#ff4444,#ff8844);border-radius:50%;border:3px solid white;box-shadow:0 0 20px rgba(255,68,68,0.5);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const osmStopIcon = L.divIcon({
  className: 'osm-stop-marker',
  html: '<div style="width:14px;height:14px;background:#ff6b35;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(255,107,53,0.5);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function OverpassStops() {
  const map = useMap();
  const [osmStops, setOsmStops] = useState([]);
  const timerRef = useRef(null);

  const fetchOsmStops = useCallback(() => {
    const bounds = map.getBounds();
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
    const query = `[out:json][timeout:10];(node[highway=bus_stop](${bbox});node[public_transport=platform](${bbox}));out center;`;

    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => {
        const stops = (data.elements || []).map((el) => ({
          id: el.id,
          name: el.tags?.name || el.tags?.ref || `Bus Stop #${el.id}`,
          lat: el.lat || el.center?.lat,
          lng: el.lon || el.center?.lng,
          ref: el.tags?.ref || '',
        })).filter((s) => s.lat && s.lng);
        setOsmStops(stops);
      })
      .catch(() => {});
  }, [map]);

  useMapEvents({
    moveend: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(fetchOsmStops, 500);
    },
  });

  useEffect(() => {
    fetchOsmStops();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [fetchOsmStops]);

  return osmStops.map((stop) => (
    <Marker key={'osm-' + stop.id} position={[stop.lat, stop.lng]} icon={osmStopIcon}>
      <Popup>
        <div className="text-dark-800" style={{ minWidth: '140px' }}>
          <strong style={{ fontSize: '13px' }}>🚏 {stop.name}</strong>
          {stop.ref && <><br /><span className="text-xs">Ref: {stop.ref}</span></>}
          <br /><span className="text-xs" style={{ color: '#999' }}>OpenStreetMap</span>
        </div>
      </Popup>
    </Marker>
  ));
}

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || 13);
  }, [center, zoom, map]);
  return null;
}

export default function MapView({
  center = [17.385, 78.4867],
  zoom = 12,
  stops = [],
  allStops = [],
  routes = [],
  buses = [],
  userLocation = null,
  height = '500px',
}) {
  return (
    <div className="rounded-xl overflow-hidden neon-glow" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        <OverpassStops />

        {allStops.map((stop, i) => (
          <Marker
            key={stop.stopId || 'all-' + i}
            position={[stop.latitude, stop.longitude]}
            icon={dotIcon}
          >
            <Popup>
              <div className="text-dark-800" style={{ minWidth: '120px' }}>
                <strong style={{ fontSize: '13px' }}>🚌 {stop.stopName}</strong>
                <br />
                <span className="text-xs">ID: {stop.stopId}</span>
                {stop.distance != null && (
                  <>
                    <br />
                    <span className="text-xs">{stop.distance} km away</span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {stops.map((stop, i) => (
          <Marker
            key={stop.stopId || i}
            position={[stop.latitude, stop.longitude]}
            icon={stopIcon}
          >
            <Popup>
              <div className="text-dark-800" style={{ minWidth: '120px' }}>
                <strong style={{ fontSize: '13px' }}>🚌 {stop.stopName}</strong>
                <br />
                <span className="text-xs">ID: {stop.stopId}</span>
                {stop.distance != null && (
                  <>
                    <br />
                    <span className="text-xs">{stop.distance} km away</span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {routes.map((route, i) => (
          <Polyline
            key={i}
            positions={route.coordinates || []}
            pathOptions={{
              color: route.color || '#00bfff',
              weight: 3,
              opacity: 0.7,
            }}
          />
        ))}

        {buses.map((bus, i) => (
          <Marker
            key={bus.id || i}
            position={[bus.latitude, bus.longitude]}
            icon={busIcon}
          >
            <Popup>
              <div className="text-dark-800">
                <strong>Bus {bus.routeNumber}</strong>
                <br />
                <span className="text-xs">
                  Last updated: {new Date(bus.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
