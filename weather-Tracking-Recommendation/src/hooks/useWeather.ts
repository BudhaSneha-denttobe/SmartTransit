import { useState, useCallback } from 'react';
import type { RouteInfo, HourlyForecast, DailyForecast, DestinationWeatherDetail, SearchParams } from '../types';
import { fetchRouteWeather } from '../services/api';
import { mockRouteData, mockHourlyForecast, generateMockDailyForecast } from '../utils/mockData';

interface WeatherData {
  routeInfo: RouteInfo | null;
  hourlyForecast: HourlyForecast[];
  destinationHourlyForecast: HourlyForecast[];
  destinationWeather: DestinationWeatherDetail | null;
  destinationDailyForecast: DailyForecast[];
  loading: boolean;
  error: string | null;
  usedMock: boolean;
  routeKey: number;
}

export function useWeather() {
  const [data, setData] = useState<WeatherData>({
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

  const fetchWeather = useCallback(async (params: SearchParams) => {
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
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      console.log('🔑 API Key detected:', apiKey ? 'Yes (' + apiKey.substring(0, 4) + '...)' : 'No');

      if (!apiKey) {
        console.log('⚠️ No API key — using mock data');
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockDaily = generateMockDailyForecast();
        setData(prev => ({
          ...prev,
          routeInfo: { ...mockRouteData, source: params.source, destination: params.destination },
          hourlyForecast: mockHourlyForecast,
          destinationHourlyForecast: mockHourlyForecast,
          destinationWeather: {
            name: params.destination,
            temp: 33,
            feelsLike: 35,
            condition: 'Cloudy',
            description: 'mostly cloudy',
            icon: '☁️',
            humidity: 65,
            windSpeed: 6,
            rainProbability: 10,
          },
          destinationDailyForecast: mockDaily,
          loading: false,
          usedMock: true,
        }));
        return;
      }

      console.log(`🌤 Fetching real weather for ${params.source} → ${params.destination}`);
      const result = await fetchRouteWeather(params.source, params.destination);
      console.log('✅ Weather data received:', result.routeInfo.source, '→', result.routeInfo.destination);
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
      console.error('❌ API Error:', message);
      setData(prev => ({ ...prev, loading: false, error: message, usedMock: false }));
    }
  }, []);

  return { ...data, fetchWeather };
}
