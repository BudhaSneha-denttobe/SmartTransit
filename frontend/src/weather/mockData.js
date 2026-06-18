const now = new Date();

function generateMockHourly() {
  const hours = ['Now', ...Array.from({ length: 11 }, (_, i) => {
    const d = new Date(now.getTime() + (i + 1) * 3600000);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  })];
  const temps = [36, 37, 38, 38, 37, 36, 34, 33, 31, 30, 29, 28];
  const rains = [20, 15, 15, 20, 30, 40, 55, 70, 80, 75, 60, 40];
  const winds = [6, 7, 8, 9, 10, 11, 12, 13, 12, 10, 8, 7];
  const conditions = [
    'Partly Cloudy', 'Mostly Cloudy', 'Mostly Cloudy', 'Partly Cloudy',
    'Partly Cloudy', 'Rain Expected', 'Rain Expected', 'Light Rain',
    'Light Rain', 'Cloudy', 'Cloudy', 'Cloudy',
  ];
  return hours.map((h, i) => ({
    hour: h,
    temperature: temps[i],
    condition: conditions[i],
    rainChance: rains[i],
    windSpeed: winds[i],
    area: i < 6 ? 'Vijayawada, Guntur' : 'Guntur',
  }));
}

export const mockRouteData = {
  source: 'Vijayawada',
  destination: 'Guntur',
  distance: '35 km',
  estimatedTime: '1 Hour 10 Minutes',
  currentWeather: 'Partly Cloudy',
  currentTemp: 36,
  locations: [
    {
      name: 'Vijayawada',
      time: '2:00 PM',
      temperature: 38,
      condition: 'Mostly Cloudy',
      icon: '☁️',
      rainProbability: 20,
      windSpeed: 12,
      lat: 16.5062,
      lng: 80.6480,
    },
    {
      name: 'Mangalagiri',
      time: '2:30 PM',
      temperature: 37,
      condition: 'Sunny',
      icon: '☀️',
      rainProbability: 10,
      windSpeed: 10,
      lat: 16.4310,
      lng: 80.5610,
    },
    {
      name: 'Tadepalli',
      time: '3:00 PM',
      temperature: 36,
      condition: 'Partly Cloudy',
      icon: '🌤',
      rainProbability: 30,
      windSpeed: 8,
      lat: 16.4167,
      lng: 80.6000,
    },
    {
      name: 'Guntur',
      time: '4:00 PM',
      temperature: 34,
      condition: 'Rain Expected',
      icon: '🌧',
      rainProbability: 70,
      windSpeed: 15,
      lat: 16.3067,
      lng: 80.4365,
    },
  ],
};

export const mockHourlyForecast = generateMockHourly();

export function generateMockDailyForecast() {
  const data = [
    { day: 'Today', high: 38, low: 29, condition: 'Cloudy', rain: 20, icon: '☁️' },
    { day: '', high: 36, low: 28, condition: 'Partly sunny', rain: 15, icon: '🌤' },
    { day: '', high: 36, low: 29, condition: 'Cloudy', rain: 25, icon: '☁️' },
    { day: '', high: 36, low: 29, condition: 'Cloudy', rain: 30, icon: '☁️' },
    { day: '', high: 34, low: 28, condition: 'Light rain', rain: 65, icon: '🌧' },
    { day: '', high: 34, low: 28, condition: 'Light rain', rain: 70, icon: '🌧' },
    { day: '', high: 35, low: 28, condition: 'Light rain', rain: 60, icon: '🌧' },
  ];
  return data.map((d, i) => {
    const date = new Date(now.getTime() + i * 86400000);
    return {
      day: d.day || date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      tempHigh: d.high,
      tempLow: d.low,
      condition: d.condition,
      icon: d.icon,
      rainChance: d.rain,
    };
  });
}

export const busStops = [
  { name: 'Vijayawada Bus Stand', lat: 16.5062, lng: 80.6480 },
  { name: 'Mangalagiri Bus Stop', lat: 16.4310, lng: 80.5610 },
  { name: 'Tadepalli Bus Stop', lat: 16.4833, lng: 80.6000 },
  { name: 'Guntur Bus Stand', lat: 16.3067, lng: 80.4365 },
];
