import type { RouteInfo, HourlyForecast, RouteLocation } from '../types';

const OPENWEATHER_BASE = import.meta.env.DEV
  ? '/openweather'
  : 'https://api.openweathermap.org';
const AVG_BUS_SPEED = 40;

function getWeatherKey(): string {
  return import.meta.env.VITE_OPENWEATHER_API_KEY || '';
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function formatDuration(km: number): string {
  const minutes = Math.round((km / AVG_BUS_SPEED) * 60);
  if (minutes < 60) return `${minutes} mins`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} Hour ${m} Minutes` : `${h} Hour`;
}

async function geocodeOsm(query: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BusTrackWeatherApp/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name.split(',')[0],
    };
  } catch {
    return null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeCity(city: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const key = getWeatherKey();

  async function tryOWM(q: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
    if (!key) return null;
    const url = `${OPENWEATHER_BASE}/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${key}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const d = await res.json();
      if (!d.length) return null;
      return { lat: d[0].lat, lng: d[0].lon, displayName: d[0].state ? `${d[0].name}, ${d[0].state}` : d[0].name };
    } catch {
      return null;
    }
  }

  let result = await tryOWM(city);
  if (result) return result;
  result = await tryOWM(`${city},IN`);
  if (result) return result;
  result = await tryOWM(`${city}, India`);
  if (result) return result;

  await delay(1100);
  result = await geocodeOsm(city);
  if (result) return result;
  await delay(1100);
  result = await geocodeOsm(`${city}, India`);
  if (result) return result;

  const words = city.split(' ');
  if (words.length > 1) {
    const lastWord = words[words.length - 1];
    const rest = words.slice(0, -1).join(' ');
    await delay(1100);
    result = await geocodeOsm(`${rest}, ${lastWord}, India`);
    if (result) return result;
  }

  return null;
}

function weatherIcon(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle') || c.includes('thunder')) return '🌧';
  if (c.includes('cloud') && (c.includes('overcast') || c.includes('mostly'))) return '☁️';
  if (c.includes('cloud') || c.includes('partly')) return '🌤';
  if (c.includes('clear') || c.includes('sunny')) return '☀️';
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return '🌫';
  if (c.includes('snow') || c.includes('sleet')) return '🌨';
  return '🌤';
}

function timeFromNow(minutes: number): string {
  const d = new Date(Date.now() + minutes * 60000);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function interpolatePoints(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  count: number
): { lat: number; lng: number; fraction: number }[] {
  const points: { lat: number; lng: number; fraction: number }[] = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    points.push({
      lat: lat1 + (lat2 - lat1) * t,
      lng: lng1 + (lng2 - lng1) * t,
      fraction: t,
    });
  }
  return points;
}

async function fetchCurrentWeather(lat: number, lng: number): Promise<{
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  icon: string;
  windSpeed: number;
  humidity: number;
  rainProbability: number;
} | null> {
  const key = getWeatherKey();
  if (!key) return null;
  const url = `${OPENWEATHER_BASE}/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${key}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temp: Math.floor(data.main.temp),
      feelsLike: Math.floor(data.main.feels_like),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: weatherIcon(data.weather[0].description),
      windSpeed: Math.round(data.wind.speed * 3.6),
      humidity: data.main.humidity,
      rainProbability: data.rain ? Math.round((data.rain['1h'] || 0) * 100) : 0,
    };
  } catch {
    return null;
  }
}

function buildHourlyFromNow(
  raw: { dt: number; temp: number; condition: string; rainChance: number; windSpeed?: number }[],
  hours: number
): HourlyForecast[] {
  if (!raw.length) return [];

  const now = new Date();
  const result: HourlyForecast[] = [];

  for (let h = 0; h < hours; h++) {
    const targetDate = new Date(now.getTime() + h * 3600000);
    const targetTime = targetDate.getTime() / 1000;

    let before = raw[0];
    let after = raw[raw.length - 1];
    for (let i = 0; i < raw.length - 1; i++) {
      if (raw[i].dt <= targetTime && raw[i + 1].dt >= targetTime) {
        before = raw[i];
        after = raw[i + 1];
        break;
      }
    }

    if (targetTime <= raw[0].dt) {
      before = raw[0];
      after = raw.length > 1 ? raw[1] : raw[0];
    }

    const range = after.dt - before.dt;
    const t = range > 0 ? (targetTime - before.dt) / range : 0;
    const clampedT = Math.max(0, Math.min(1, t));

    const hourLabel = targetDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

    const windBefore = before.windSpeed ?? 0;
    const windAfter = after.windSpeed ?? 0;

    result.push({
      hour: h === 0 ? 'Now' : hourLabel,
      temperature: Math.floor(before.temp + (after.temp - before.temp) * clampedT),
      condition: clampedT < 0.5 ? before.condition : after.condition,
      rainChance: Math.round(before.rainChance + (after.rainChance - before.rainChance) * clampedT),
      windSpeed: Math.round(windBefore + (windAfter - windBefore) * clampedT),
    });
  }

  return result;
}

async function fetchForecast(
  lat: number,
  lng: number,
  currentWeather: { temp: number; condition: string; rainProbability: number; windSpeed?: number; humidity?: number } | null
): Promise<{
  hourly: HourlyForecast[];
  daily: DailyForecast[];
} | null> {
  const key = getWeatherKey();
  if (!key) return null;
  const url = `${OPENWEATHER_BASE}/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${key}`;
  let data: any;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    data = await res.json();
  } catch {
    return null;
  }

  const now = Date.now() / 1000;
  const twelveHoursLater = now + 12 * 3600;

  const raw = data.list
    .filter((item: any) => item.dt >= now && item.dt <= twelveHoursLater)
    .slice(0, 5)
    .map((item: any) => ({
      dt: item.dt,
      temp: Math.floor(item.main.temp),
      condition: item.weather[0].main,
      rainChance: Math.round((item.pop || 0) * 100),
      windSpeed: Math.round((item.wind?.speed || 0) * 3.6),
    }));

  if (currentWeather) {
    const w = currentWeather as { temp: number; condition: string; rainProbability: number; windSpeed?: number; humidity?: number };
    raw.unshift({
      dt: Math.floor(now),
      temp: w.temp,
      condition: w.condition,
      rainChance: w.rainProbability,
      windSpeed: w.windSpeed ?? 0,
    });
  }

  const hourly = buildHourlyFromNow(raw, 12);

  const daily = buildDailyForecast(data.list);

  return { hourly, daily };
}

function buildDailyForecast(list: any[]): DailyForecast[] {
  interface DayGroup {
    dt: number;
    temps: number[];
    conditions: string[];
    pops: number[];
    descriptions: string[];
  }

  const groups: Record<string, DayGroup> = {};

  for (const item of list) {
    const d = new Date(item.dt * 1000);
    const dayKey = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (!groups[dayKey]) {
      groups[dayKey] = { dt: item.dt, temps: [], conditions: [], pops: [], descriptions: [] };
    }

    groups[dayKey].temps.push(item.main.temp);
    groups[dayKey].conditions.push(item.weather[0].main);
    groups[dayKey].pops.push(item.pop || 0);
    groups[dayKey].descriptions.push(item.weather[0].description);
  }

  const now = new Date();
  const todayKey = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return Object.entries(groups)
    .slice(0, 7)
    .map(([key, g]) => {
      const conditionCounts: Record<string, number> = {};
      for (const c of g.conditions) {
        conditionCounts[c] = (conditionCounts[c] || 0) + 1;
      }
      const dominantCondition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0][0];

      const descCounts: Record<string, number> = {};
      for (const desc of g.descriptions) {
        descCounts[desc] = (descCounts[desc] || 0) + 1;
      }
      const dominantDesc = Object.entries(descCounts).sort((a, b) => b[1] - a[1])[0][0];

      const maxPop = Math.round(Math.max(...g.pops) * 100);
      const isToday = key === todayKey;
      const dayDate = new Date(g.dt * 1000);

      return {
        day: isToday ? 'Today' : dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
        date: key,
        tempHigh: Math.floor(Math.max(...g.temps)),
        tempLow: Math.floor(Math.min(...g.temps)),
        condition: dominantCondition,
        icon: weatherIcon(dominantDesc),
        rainChance: maxPop,
      };
    });
}

export async function fetchRouteWeather(source: string, dest: string): Promise<{
  routeInfo: RouteInfo;
  hourlyForecast: HourlyForecast[];
  destinationHourlyForecast: HourlyForecast[];
  destinationWeather: DestinationWeatherDetail | null;
  destinationDailyForecast: DailyForecast[];
}> {
  const [srcCoords, dstCoords] = await Promise.all([
    geocodeCity(source),
    geocodeCity(dest),
  ]);

  if (!srcCoords && !dstCoords) {
    throw new Error(`Could not find "${source}" or "${dest}". Try different city names or check the API key.`);
  }
  if (!srcCoords) {
    throw new Error(`Could not find location: "${source}". Try a different name.`);
  }
  if (!dstCoords) {
    throw new Error(`Could not find location: "${dest}". Try a different name.`);
  }

  const srcName = srcCoords.displayName;
  const dstName = dstCoords.displayName;

  const distanceKm = haversineKm(srcCoords.lat, srcCoords.lng, dstCoords.lat, dstCoords.lng);

  const [srcWeather, destWeather] = await Promise.all([
    fetchCurrentWeather(srcCoords.lat, srcCoords.lng),
    fetchCurrentWeather(dstCoords.lat, dstCoords.lng),
  ]);

  const midRawPoints = interpolatePoints(
    srcCoords.lat, srcCoords.lng,
    dstCoords.lat, dstCoords.lng,
    2
  );

  const midWeather = await Promise.all(
    midRawPoints.map(p => fetchCurrentWeather(p.lat, p.lng))
  );

  const totalMinutes = Math.round((distanceKm / AVG_BUS_SPEED) * 60);
  const segmentMinutes = Math.round(totalMinutes / 3);

  const routeLocations: RouteLocation[] = [
    {
      name: srcName,
      time: timeFromNow(0),
      temperature: srcWeather?.temp ?? 30,
      condition: srcWeather?.condition ?? 'Unknown',
      icon: srcWeather?.icon ?? '🌤',
      rainProbability: srcWeather?.rainProbability ?? 0,
      windSpeed: srcWeather?.windSpeed ?? 0,
      lat: srcCoords.lat,
      lng: srcCoords.lng,
    },
    ...midRawPoints.map((p, i) => {
      const w = midWeather[i];
      const fraction = Math.round(p.fraction * 100);
      return {
        name: `${Math.round(fraction)}% Route`,
        time: timeFromNow(segmentMinutes * (i + 1)),
        temperature: w?.temp ?? 30,
        condition: w?.condition ?? 'Unknown',
        icon: w?.icon ?? '🌤',
        rainProbability: w?.rainProbability ?? 0,
        windSpeed: w?.windSpeed ?? 0,
        lat: p.lat,
        lng: p.lng,
      };
    }),
    {
      name: dstName,
      time: timeFromNow(segmentMinutes * 3),
      temperature: destWeather?.temp ?? srcWeather?.temp ?? 30,
      condition: destWeather?.condition ?? srcWeather?.condition ?? 'Unknown',
      icon: destWeather?.icon ?? '🌤',
      rainProbability: destWeather?.rainProbability ?? 0,
      windSpeed: destWeather?.windSpeed ?? 0,
      lat: dstCoords.lat,
      lng: dstCoords.lng,
    },
  ];

  const [srcForecast, destForecast, mid1Forecast, mid2Forecast] = await Promise.all([
    fetchForecast(srcCoords.lat, srcCoords.lng, srcWeather),
    fetchForecast(dstCoords.lat, dstCoords.lng, destWeather),
    midRawPoints[0] ? fetchForecast(midRawPoints[0].lat, midRawPoints[0].lng, midWeather[0]) : Promise.resolve(null),
    midRawPoints[1] ? fetchForecast(midRawPoints[1].lat, midRawPoints[1].lng, midWeather[1]) : Promise.resolve(null),
  ]);

  const allForecasts: { area: string; hourly: HourlyForecast[] }[] = [
    { area: srcName, hourly: srcForecast?.hourly ?? [] },
    { area: dstName, hourly: destForecast?.hourly ?? [] },
  ];
  if (mid1Forecast?.hourly.length) allForecasts.push({ area: 'Mid-Route', hourly: mid1Forecast.hourly });
  if (mid2Forecast?.hourly.length) allForecasts.push({ area: 'Mid-Route', hourly: mid2Forecast.hourly });

  const mergedHourly: HourlyForecast[] = [];
  const maxLen = Math.max(...allForecasts.map(f => f.hourly.length));
  for (let i = 0; i < maxLen && i < 12; i++) {
    const hour = allForecasts[0]?.hourly[i]?.hour ?? `+${i}h`;
    const temps = allForecasts.map(f => f.hourly[i]?.temperature).filter(t => t !== undefined);
    const rains = allForecasts.map(f => f.hourly[i]?.rainChance).filter(r => r !== undefined);
    const avgTemp = Math.floor(temps.reduce((s, t) => s + t, 0) / temps.length);
    const avgRain = Math.round(rains.reduce((s, r) => s + r, 0) / rains.length);
    mergedHourly.push({
      hour,
      temperature: avgTemp,
      condition: allForecasts[0]?.hourly[i]?.condition ?? 'Unknown',
      rainChance: avgRain,
      area: allForecasts.map(f => f.area).filter((a, idx, arr) => arr.indexOf(a) === idx).join(', '),
    });
  }

  return {
    routeInfo: {
      source: srcName,
      destination: dstName,
      distance: formatDistance(distanceKm),
      estimatedTime: formatDuration(distanceKm),
      currentWeather: srcWeather?.condition ?? 'Unknown',
      currentTemp: srcWeather?.temp ?? 30,
      locations: routeLocations,
    },
    hourlyForecast: mergedHourly,
    destinationHourlyForecast: destForecast?.hourly ?? [],
    destinationWeather: destWeather
      ? {
          name: dstName,
          temp: destWeather.temp,
          feelsLike: destWeather.feelsLike,
          condition: destWeather.condition,
          description: destWeather.description,
          icon: destWeather.icon,
          humidity: destWeather.humidity,
          windSpeed: destWeather.windSpeed,
          rainProbability: destWeather.rainProbability,
        }
      : null,
    destinationDailyForecast: destForecast?.daily ?? [],
  };
}
