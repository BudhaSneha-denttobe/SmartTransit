const weatherBgMap = [
  { match: (c) => /rain|drizzle|thunder/i.test(c), gradient: 'from-blue-400 to-indigo-500' },
  { match: (c) => /clear|sunny/i.test(c), gradient: 'from-yellow-400 to-orange-500' },
  { match: (c) => /cloud|overcast/i.test(c), gradient: 'from-gray-400 to-gray-600' },
  { match: (c) => /fog|mist|haze/i.test(c), gradient: 'from-gray-300 to-gray-500' },
  { match: (c) => /snow|sleet/i.test(c), gradient: 'from-blue-100 to-blue-300' },
];

export default function RouteOverview({ data }) {
  const gradient = weatherBgMap.find((e) => e.match(data.currentWeather))?.gradient || 'from-blue-400 to-blue-600';

  return (
    <div className="animate-slideUp group">
      <h2 className="text-lg font-semibold text-blue-500 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-blue-400 group-hover:scale-110 transition-transform duration-300">route</span>
        Route Overview
      </h2>
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-white/80">trip_origin</span>
              <div>
                <p className="text-xs text-white/70">Source</p>
                <p className="text-lg font-bold text-white">{data.source}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-white/80">location_on</span>
              <div>
                <p className="text-xs text-white/70">Destination</p>
                <p className="text-lg font-bold text-white">{data.destination}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="material-symbols-outlined text-3xl text-white">straight</span>
              <p className="text-xs text-white/70 mt-1">Distance</p>
              <p className="text-sm font-semibold text-white">{data.distance}</p>
            </div>
            <div className="text-center">
              <span className="material-symbols-outlined text-3xl text-white">schedule</span>
              <p className="text-xs text-white/70 mt-1">Est. Time</p>
              <p className="text-sm font-semibold text-white">{data.estimatedTime}</p>
            </div>
            <div className="text-center">
              <span className="material-symbols-outlined text-3xl text-white">thermostat</span>
              <p className="text-xs text-white/70 mt-1">Weather</p>
              <p className="text-sm font-semibold text-white">{data.currentTemp}°C</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/20">
          <p className="text-sm text-white/90 flex items-center gap-2">
            <span>Current Weather:</span>
            <span className="font-semibold">{data.currentWeather}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
