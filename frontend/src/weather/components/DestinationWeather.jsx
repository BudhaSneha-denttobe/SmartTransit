import { useMemo, useState } from 'react';

export default function DestinationWeather({ weather, hourly, daily }) {
  const [activeTab, setActiveTab] = useState('hourly');

  const now = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true });
  }, []);

  if (!weather) return null;

  const conditionIcon =
    weather.rainProbability > 50 ? 'rainy' :
    weather.condition?.includes('Cloud') ? 'cloud' :
    weather.condition?.includes('Rain') ? 'rainy' :
    'clear_day';

  return (
    <div className="animate-slideUp delay-500 group">
      <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-semibold text-yellow-500">{weather.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{now}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-5xl text-blue-500">{conditionIcon}</span>
            <div>
              <p className="text-5xl font-bold text-slate-900">{weather.temp}°</p>
              <p className="text-sm text-slate-500 capitalize mt-0.5">{weather.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center sm:ml-auto gap-x-6 gap-y-2 text-sm">
            <div className="text-center">
              <p className="text-slate-400 text-xs">Precipitation</p>
              <p className="font-semibold text-slate-700">{weather.rainProbability}%</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs">Humidity</p>
              <p className="font-semibold text-slate-700">{weather.humidity}%</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs">Wind</p>
              <p className="font-semibold text-slate-700">{weather.windSpeed} km/h</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('hourly')}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === 'hourly'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Hourly
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === 'daily'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            7-Day
          </button>
        </div>

        {activeTab === 'hourly' && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="text-left py-2 pr-4 font-medium">Time</th>
                  <th className="text-center py-2 px-2 font-medium">Temp</th>
                  <th className="text-center py-2 px-2 font-medium">Precip</th>
                  <th className="text-right py-2 pl-4 font-medium">Wind</th>
                </tr>
              </thead>
              <tbody>
                {(hourly || []).slice(0, 12).map((h, i) => (
                  <tr
                    key={i}
                    className={`border-b border-slate-50 transition-colors hover:bg-blue-50/50 ${
                      h.hour === 'Now' ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className={`py-2.5 pr-4 font-medium ${
                      h.hour === 'Now' ? 'text-blue-500' : 'text-slate-700'
                    }`}>
                      {h.hour}
                    </td>
                    <td className="text-center py-2.5 px-2 text-slate-800 font-semibold">
                      {h.temperature}°
                    </td>
                    <td className="text-center py-2.5 px-2">
                      <span className={`inline-flex items-center gap-1 ${
                        h.rainChance > 50 ? 'text-blue-500' : 'text-slate-400'
                      }`}>
                        <span className="material-symbols-outlined text-sm">water_drop</span>
                        {h.rainChance}%
                      </span>
                    </td>
                    <td className="text-right py-2.5 pl-4 text-slate-500">
                      {h.windSpeed ?? '-'} km/h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hourly.length === 0 && (
              <p className="text-center text-slate-400 py-6 text-sm">No hourly data available</p>
            )}
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="mt-4 space-y-1">
                {(daily || []).map((d, i) => (
              <div
                key={d.date + i}
                className="flex items-center gap-3 py-2.5 px-2 rounded-xl transition-colors hover:bg-slate-50"
              >
                <p className="w-14 text-sm font-medium text-slate-700">{d.day}</p>
                <span className="text-lg">{d.icon}</span>
                <p className="text-xs text-slate-400 flex-1 truncate">{d.condition}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold text-slate-800 w-8 text-right">{d.tempHigh}°</span>
                  <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-yellow-400"
                      style={{ width: `${Math.min(100, ((d.tempHigh - 20) / 25) * 100)}%` }}
                    />
                  </div>
                  <span className="text-slate-400 w-8">{d.tempLow}°</span>
                </div>
                <span className={`text-xs w-10 text-right ${
                  d.rainChance > 50 ? 'text-blue-500 font-medium' : 'text-slate-400'
                }`}>
                  {d.rainChance}%
                </span>
              </div>
            ))}
            {daily.length === 0 && (
              <p className="text-center text-slate-400 py-6 text-sm">No daily forecast available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
