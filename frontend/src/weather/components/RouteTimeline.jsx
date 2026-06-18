const iconMap = {
  '☁️': 'cloud',
  '☀️': 'clear_day',
  '🌤': 'partly_cloudy_day',
  '🌧': 'rainy',
  '⛅': 'partly_cloudy_day',
};

function WeatherIcon({ icon }) {
  return (
    <span className="material-symbols-outlined text-3xl">
      {iconMap[icon] || 'cloud'}
    </span>
  );
}

export default function RouteTimeline({ locations }) {
  return (
    <div className="animate-slideUp delay-200 group">
      <h2 className="text-lg font-semibold text-blue-500 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-blue-500 group-hover:scale-110 transition-transform duration-300">timeline</span>
        Route Weather Timeline
      </h2>
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex items-start gap-0 min-w-max">
          {locations.map((loc, i) => (
            <div key={loc.name} className="flex items-start">
              <div className="flex flex-col items-center">
                <div className="backdrop-blur-xl bg-white/20 rounded-2xl border border-white/20 p-4 w-44 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <p className="text-sm font-semibold text-gray-800 text-center">{loc.name}</p>
                  <p className="text-xs text-gray-500 text-center mt-1">{loc.time}</p>
                  <div className="flex justify-center my-2">
                    <WeatherIcon icon={loc.icon} />
                  </div>
                  <p className="text-2xl font-bold text-center text-gray-800">{loc.temperature}°C</p>
                  <p className="text-xs text-gray-500 text-center mt-1">{loc.condition}</p>
                  <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">water_drop</span> Rain
                      </span>
                      <span>{loc.rainProbability}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">air</span> Wind
                      </span>
                      <span>{loc.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>
                {i < locations.length - 1 && (
                  <div className="flex flex-col items-center mt-2">
                    <span className="material-symbols-outlined text-gray-400">arrow_downward</span>
                  </div>
                )}
              </div>
              {i < locations.length - 1 && <div className="w-8" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
