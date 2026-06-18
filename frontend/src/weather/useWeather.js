import { useState, useCallback } from 'react';
import { fetchRouteWeather } from './api';
import { mockRouteData, mockHourlyForecast, generateMockDailyForecast } from './mockData';

function buildMockResult(source, dest) {
  const now = new Date();
  const hours = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getTime() + i * 3600000);
    return {
      hour: i === 0 ? 'Now' : d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      temperature: Math.floor(30 + Math.sin(i / 4) * 5),
      condition: 'Partly Cloudy',
      rainChance: Math.floor(Math.random() * 40),
      windSpeed: Math.floor(Math.random() * 15 + 3),
    };
  });

  return {
    routeInfo: {
      source,
      destination: dest,
      distance: `${Math.floor(Math.random() * 50 + 5)} km`,
      estimatedTime: `${Math.floor(Math.random() * 2 + 1)} Hour ${Math.floor(Math.random() * 60)} Minutes`,
      currentWeather: 'Partly Cloudy',
      currentTemp: 32,
      locations: [
        { name: source, time: 'Now', temperature: 32, condition: 'Partly Cloudy', icon: '🌤', rainProbability: 10, windSpeed: 8, lat: 16.5, lng: 80.6, },
        { name: dest, time: '+1h', temperature: 34, condition: 'Sunny', icon: '☀️', rainProbability: 5, windSpeed: 10, lat: 16.3, lng: 80.4, },
      ],
    },
    hourlyForecast: hours,
    destinationHourlyForecast: hours,
    destinationWeather: {
      name: dest,
      temp: 32,
      feelsLike: 36,
      condition: 'Partly Cloudy',
      description: 'partly cloudy',
      icon: '🌤',
      humidity: 65,
      windSpeed: 8,
      rainProbability: 10,
    },
    destinationDailyForecast: generateMockDailyForecast(),
  };
}

export function useWeather() {
  const [data, setData] = useState({
    routeInfo: null,
    hourlyForecast: [],
    destinationHourlyForecast: [],
    destinationWeather: null,
    destinationDailyForecast: [],
    loading: false,
    error: null,
    usedMock: false,
    routeKey: 0,
  });

  const fetchWeather = useCallback(async (params) => {
    setData({
      routeInfo: null,
      hourlyForecast: [],
      destinationHourlyForecast: [],
      destinationWeather: null,
      destinationDailyForecast: [],
      loading: true,
      error: null,
      usedMock: false,
      routeKey: Date.now(),
    });

    try {
      const result = await fetchRouteWeather(params.source, params.destination);
      setData(prev => ({
        ...prev,
        routeInfo: result.routeInfo,
        hourlyForecast: result.hourlyForecast,
        destinationHourlyForecast: result.destinationHourlyForecast,
        destinationWeather: result.destinationWeather,
        destinationDailyForecast: result.destinationDailyForecast,
        loading: false,
        error: null,
        usedMock: false,
      }));
    } catch {
      const fallback = buildMockResult(params.source, params.destination);
      setData(prev => ({
        ...prev,
        routeInfo: fallback.routeInfo,
        hourlyForecast: fallback.hourlyForecast,
        destinationHourlyForecast: fallback.destinationHourlyForecast,
        destinationWeather: fallback.destinationWeather,
        destinationDailyForecast: fallback.destinationDailyForecast,
        loading: false,
        error: null,
        usedMock: true,
      }));
    }
  }, []);

  return { ...data, fetchWeather };
}
