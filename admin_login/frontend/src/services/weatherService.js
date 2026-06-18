import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const demoWeather = {
  Hyderabad: { temp: 32, feels_like: 34, humidity: 45, description: "haze" },
  Vijayawada: { temp: 35, feels_like: 38, humidity: 55, description: "clear sky" },
  Chennai: { temp: 34, feels_like: 37, humidity: 65, description: "few clouds" },
  Banglore: { temp: 26, feels_like: 28, humidity: 50, description: "broken clouds" },
  Visakhapatnam: { temp: 31, feels_like: 33, humidity: 60, description: "light rain" },
  Tirupati: { temp: 33, feels_like: 36, humidity: 50, description: "clear sky" },
  Kurnool: { temp: 36, feels_like: 39, humidity: 40, description: "haze" },
  Guntur: { temp: 34, feels_like: 37, humidity: 48, description: "clear sky" },
  Nellore: { temp: 33, feels_like: 36, humidity: 55, description: "few clouds" },
  Kadapa: { temp: 35, feels_like: 38, humidity: 42, description: "haze" },
  Rajahmundry: { temp: 32, feels_like: 34, humidity: 58, description: "clear sky" },
};

const weatherCache = {};

const aliases = {
  vizag: "Visakhapatnam",
  bangalore: "Bengaluru",
};

const isLive = () => API_KEY && API_KEY !== "your_api_key_here";

const lookupKey = (city) => {
  const lower = city?.toLowerCase();
  return aliases[lower] || city;
};

export const getWeatherSync = (city) => {
  if (!city) return null;
  const key = lookupKey(city);
  const cached = weatherCache[key];
  if (cached) return cached;
  const demo = demoWeather[key];
  if (demo) {
    weatherCache[key] = { ...demo, live: false };
    return weatherCache[key];
  }
  return null;
};

export const fetchWeatherLive = async (city) => {
  if (!city || !isLive()) return getWeatherSync(city);
  const key = lookupKey(city);
  try {
    const res = await axios.get(BASE_URL, {
      params: { q: key, appid: API_KEY, units: "metric" },
    });
    const data = {
      temp: Math.round(res.data.main.temp),
      feels_like: Math.round(res.data.main.feels_like),
      humidity: res.data.main.humidity,
      description: res.data.weather[0].description,
      icon: res.data.weather[0].icon,
      live: true,
    };
    weatherCache[key] = data;
    return data;
  } catch {
    return getWeatherSync(city);
  }
};

export const getWeather = (city) => {
  return getWeatherSync(city);
};

export const getRouteWeather = (source, destination) => {
  return {
    source: getWeatherSync(source),
    destination: getWeatherSync(destination),
  };
};

export const getRouteWeatherLive = async (source, destination) => {
  const [srcWeather, dstWeather] = await Promise.all([
    fetchWeatherLive(source),
    fetchWeatherLive(destination),
  ]);
  return { source: srcWeather, destination: dstWeather };
};
