import { useState, useEffect, useRef } from "react";
import { getRouteWeather } from "../../services/adminWeatherService";

const AdminWeatherBadge = ({ source, destination }) => {
  const [weather, setWeather] = useState(() => getRouteWeather(source, destination));
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const syncData = getRouteWeather(source, destination);
    if (mountedRef.current) {
      setWeather(syncData);
    }
    return () => { mountedRef.current = false; };
  }, [source, destination]);

  if (!weather?.source || !weather?.destination) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
        <span className="material-symbols-outlined text-sm">error_outline</span> N/A
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium"
      title={`${source}: ${weather.source.temp}°C, ${weather.source.description}\n${destination}: ${weather.destination.temp}°C, ${weather.destination.description}`}
    >
      <span className="material-symbols-outlined text-amber-500 text-sm">sunny</span>
      <span className="text-gray-700">{weather.source.temp}°</span>
      <span className="text-gray-400">&rarr;</span>
      <span className="text-gray-700">{weather.destination.temp}°</span>
    </span>
  );
};

export default AdminWeatherBadge;
