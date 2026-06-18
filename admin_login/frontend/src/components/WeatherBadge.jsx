import { useState, useEffect, useRef } from "react";
import { getRouteWeather, getRouteWeatherLive } from "../services/weatherService";
import { HiOutlineSun, HiOutlineExclamationCircle } from "react-icons/hi2";

const WeatherBadge = ({ source, destination }) => {
  const [weather, setWeather] = useState(() => getRouteWeather(source, destination));
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const syncData = getRouteWeather(source, destination);
    setWeather(syncData);
    setLoading(false);
    getRouteWeatherLive(source, destination).then((liveData) => {
      if (mountedRef.current) {
        setWeather(liveData);
      }
    });
    return () => { mountedRef.current = false; };
  }, [source, destination]);

  if (!weather?.source || !weather?.destination) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
        <HiOutlineExclamationCircle /> N/A
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" title={`${source}: ${weather.source.temp}°C, ${weather.source.description}\n${destination}: ${weather.destination.temp}°C, ${weather.destination.description}`}>
      <HiOutlineSun className="text-amber-500" />
      <span className="text-gray-700">{weather.source.temp}°</span>
      <span className="text-gray-400">→</span>
      <span className="text-gray-700">{weather.destination.temp}°</span>
    </span>
  );
};

export default WeatherBadge;
