export interface RouteLocation {
  name: string;
  time: string;
  temperature: number;
  condition: string;
  icon: string;
  rainProbability: number;
  windSpeed: number;
  lat: number;
  lng: number;
}

export interface RouteInfo {
  source: string;
  destination: string;
  distance: string;
  estimatedTime: string;
  currentWeather: string;
  currentTemp: number;
  locations: RouteLocation[];
}

export interface HourlyForecast {
  hour: string;
  temperature: number;
  condition: string;
  rainChance: number;
  windSpeed?: number;
  area?: string;
}

export interface DailyForecast {
  day: string;
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  icon: string;
  rainChance: number;
}

export interface DestinationWeatherDetail {
  name: string;
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
}

export interface Recommendation {
  icon: string;
  text: string;
  type: 'heat' | 'rain' | 'both';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface SearchParams {
  source: string;
  destination: string;
}

export type ThemeMode = 'dark' | 'light';
