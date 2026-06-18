import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const busIcon = L.divIcon({
  className: 'bus-marker',
  html: '<div style="width:40px;height:40px;background:linear-gradient(135deg,#00bfff,#00ff87);border-radius:50%;border:3px solid white;box-shadow:0 0 20px rgba(0,191,255,0.7),0 0 40px rgba(0,255,135,0.3);display:flex;align-items:center;justify-content:center;font-size:22px;line-height:1;">🚍</div>',
  iconSize: [46, 46],
  iconAnchor: [23, 23],
});

const sourceIcon = L.divIcon({
  className: 'source-marker',
  html: '<div style="width:32px;height:32px;background:linear-gradient(135deg,#00ff87,#00bfff);border-radius:8px 8px 8px 0;border:3px solid white;box-shadow:0 0 20px rgba(0,255,135,0.5);display:flex;align-items:center;justify-content:center;transform:rotate(45deg);"><span style="transform:rotate(-45deg);font-size:14px;font-weight:bold;color:#0a0a1a;">S</span></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destIcon = L.divIcon({
  className: 'dest-marker',
  html: '<div style="width:32px;height:32px;background:linear-gradient(135deg,#ff4444,#ff8844);border-radius:8px 8px 8px 0;border:3px solid white;box-shadow:0 0 20px rgba(255,68,68,0.5);display:flex;align-items:center;justify-content:center;transform:rotate(45deg);"><span style="transform:rotate(-45deg);font-size:14px;font-weight:bold;color:#0a0a1a;">D</span></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const stopIcon = L.divIcon({
  className: 'stop-marker',
  html: '<div style="width:20px;height:20px;background:rgba(0,191,255,0.4);border:3px solid #00bfff;border-radius:50%;box-shadow:0 0 8px rgba(0,191,255,0.4);"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const upcomingStopIcon = L.divIcon({
  className: 'upcoming-stop-marker',
  html: '<div style="width:26px;height:26px;background:rgba(0,255,135,0.4);border:3px solid #00ff87;border-radius:50%;box-shadow:0 0 12px rgba(0,255,135,0.6);display:flex;align-items:center;justify-content:center;"><span style="font-size:11px;line-height:1;">⬇</span></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const stopLabelIcon = (name, isUpcoming) => L.divIcon({
  className: 'stop-label-marker',
  html: `<div style="display:flex;flex-direction:column;align-items:center;gap:1px;"><div style="width:${isUpcoming ? 26 : 20}px;height:${isUpcoming ? 26 : 20}px;background:${isUpcoming ? 'rgba(0,255,135,0.4)' : 'rgba(0,191,255,0.3)'};border:3px solid ${isUpcoming ? '#00ff87' : '#00bfff'};border-radius:50%;box-shadow:0 0 ${isUpcoming ? 12 : 8}px ${isUpcoming ? 'rgba(0,255,135,0.6)' : 'rgba(0,191,255,0.3)'};"></div><span style="font-size:10px;font-weight:600;color:white;text-shadow:0 1px 3px rgba(0,0,0,0.8),0 0 6px rgba(0,0,0,0.5);background:rgba(0,0,0,0.55);padding:1px 5px;border-radius:8px;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;">${name.replace(/'/g, '&#39;')}</span></div>`,
  iconSize: [isUpcoming ? 32 : 26, 56],
  iconAnchor: [isUpcoming ? 16 : 13, 56],
});

function FitBounds({ shape, stops }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || shape.length === 0) return;
    fitted.current = true;
    const points = shape.map(s => [s.latitude, s.longitude]);
    if (stops) {
      stops.forEach(s => {
        if (s.latitude && s.longitude) points.push([s.latitude, s.longitude]);
      });
    }
    if (points.length > 0) {
      map.fitBounds(points, { padding: [50, 50] });
    }
  }, [map, shape, stops]);
  return null;
}

function AnimatedBusMarker({ position }) {
  const markerRef = useRef(null);
  const [animatedPos, setAnimatedPos] = useState(position);
  const animFrame = useRef(null);
  const prevPos = useRef(position);

  useEffect(() => {
    const start = prevPos.current;
    const target = position;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const lat = start[0] + (target[0] - start[0]) * eased;
      const lng = start[1] + (target[1] - start[1]) * eased;
      setAnimatedPos([lat, lng]);
      if (t < 1) animFrame.current = requestAnimationFrame(animate);
    };

    animFrame.current = requestAnimationFrame(animate);
    prevPos.current = target;

    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [position]);

  return (
    <Marker ref={markerRef} position={animatedPos} icon={busIcon}>
      <Popup>
        <div className="text-dark-800">
          <strong style={{ fontSize: '13px' }}>🚍 Bus</strong>
          <br />
          <span className="text-xs">Current Location</span>
        </div>
      </Popup>
    </Marker>
  );
}

export default function TrackBusMap({ shape, busPosition, currentIndex, totalPoints, nextStopIndex, sourceStop, destinationStop, stops }) {
  const routeCoords = shape.map(s => [s.latitude, s.longitude]);

  const gqlStops = stops
    ? stops.filter(s => s.latitude && s.longitude)
    : [];

  const upcomingIdx = nextStopIndex >= 0 ? nextStopIndex : gqlStops.length - 1;

  return (
    <div className="rounded-xl overflow-hidden neon-glow" style={{ height: '600px' }}>
      <MapContainer
        center={busPosition || [17.385, 78.4867]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds shape={shape} stops={stops} />

        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#00bfff',
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}

        {gqlStops.map((stop, i) => (
          <Marker
            key={stop.stopId || i}
            position={[stop.latitude, stop.longitude]}
            icon={stopLabelIcon(stop.stopName, i === upcomingIdx)}
          >
            <Popup>
              <div className="text-dark-800">
                <strong style={{ fontSize: '12px' }}>{stop.stopName}</strong>
                <br />
                <span className="text-xs">Stop #{stop.stopSequence || i + 1}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {sourceStop && sourceStop.latitude && sourceStop.longitude && (
          <Marker position={[sourceStop.latitude, sourceStop.longitude]} icon={sourceIcon}>
            <Popup>{sourceStop.stopName} (Source)</Popup>
          </Marker>
        )}

        {destinationStop && destinationStop.latitude && destinationStop.longitude && (
          <Marker position={[destinationStop.latitude, destinationStop.longitude]} icon={destIcon}>
            <Popup>{destinationStop.stopName} (Destination)</Popup>
          </Marker>
        )}

        {busPosition && <AnimatedBusMarker position={busPosition} />}
      </MapContainer>
    </div>
  );
}
