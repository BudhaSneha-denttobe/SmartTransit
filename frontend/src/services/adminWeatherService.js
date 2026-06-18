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

export const getRouteWeather = (source, destination) => {
  return {
    source: getWeatherSync(source),
    destination: getWeatherSync(destination),
  };
};
