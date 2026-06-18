import { useMemo, useState } from 'react';
import {
 ResponsiveContainer,
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ReferenceLine,
} from 'recharts';
import type { HourlyForecast as HourlyForecastType } from '../types';

interface HourlyForecastProps {
 data: HourlyForecastType[];
}

function CustomTooltip({ active, payload, label }: any) {
 if (!active || !payload?.length) return null;
 const d = payload[0].payload;
 return (
 <div className="backdrop-blur-xl bg-white/80 rounded-xl border border-gray-200/50 p-3 shadow-xl text-sm">
 <p className="font-semibold text-gray-800 ">{label}</p>
 {d.area && <p className="text-[10px] text-gray-400 mt-0.5">📍 {d.area}</p>}
 <p className="text-blue-500 font-bold mt-1">{d.temperature}°C</p>
 <p className="text-gray-500 ">{d.condition}</p>
 <p className="text-blue-400 flex items-center gap-1 mt-0.5">
 <span className="material-symbols-outlined text-sm">water_drop</span> {d.rainChance}%
 </p>
 </div>
 );
}

export default function HourlyForecast({ data }: HourlyForecastProps) {
 const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

 const chartData = useMemo(() => data.map(d => ({
 label: d.hour,
 temperature: d.temperature,
 condition: d.condition,
 rainChance: d.rainChance,
 area: d.area,
 })), [data]);

 const currentTemp = data[0]?.temperature || 0;

 const windowTag = useMemo(() => {
 const firstHour = data[0]?.hour;
 const lastHour = data[data.length - 1]?.hour;
 if (!firstHour || !lastHour) return 'Hourly weather';
 return `${firstHour} → ${lastHour} • 12-hour forecast`;
 }, [data]);

  return (
  <div className="animate-slideUp delay-300 group">
  <h2 className="text-lg font-semibold text-blue-500 mb-4 flex items-center gap-2">
  <span className="material-symbols-outlined text-blue-500 group-hover:scale-110 transition-transform duration-300">insights</span>
  Hourly Weather Forecast
  </h2>
  <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-slate-200/70 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
 <p className="text-xs uppercase tracking-[0.24em] text-sky-600 mb-3">Destination forecast • {windowTag}</p>
 <div className="h-64 sm:h-72">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart
 data={chartData}
 onMouseMove={(e) => {
 const idx = e.activeTooltipIndex;
 if (idx !== undefined && typeof idx === 'number') {
 setHoveredIndex(idx);
 }
 }}
 onMouseLeave={() => setHoveredIndex(null)}
 >
 <defs>
 <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
 <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
 </linearGradient>
 <linearGradient id="tempGradientLight" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4} />
 <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.02} />
 </linearGradient>
 </defs>
 <CartesianGrid
 strokeDasharray="3 3"
 stroke="currentColor"
 className="text-gray-200 "
 vertical={false}
 />
 <XAxis
 dataKey="label"
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'currentColor', fontSize: 11 }}
 className="text-gray-500 "
 />
 <YAxis
 axisLine={false}
 tickLine={false}
 tick={{ fill: 'currentColor', fontSize: 11 }}
 className="text-gray-500 "
 domain={['dataMin - 3', 'dataMax + 3']}
 />
 <ReferenceLine
 y={currentTemp}
 stroke="#3b82f6"
 strokeDasharray="4 4"
 strokeOpacity={0.4}
 label={{
 value: `${currentTemp}°C`,
 position: 'right',
 fill: '#3b82f6',
 fontSize: 11,
 }}
 />
 <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
 <Area
 type="monotone"
 dataKey="temperature"
 stroke="#3b82f6"
 strokeWidth={2.5}
 fill="url(#tempGradient)"
 activeDot={{
 r: 6,
 fill: '#3b82f6',
 stroke: '#fff',
 strokeWidth: 2,
 }}
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>

 <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mt-4">
 {data.map((h, i) => (
 <div
 key={h.hour + i}
 className={`text-center p-1.5 rounded-xl transition-all duration-300 cursor-default ${
 hoveredIndex === i
 ? 'bg-blue-400/20 scale-105'
 : 'bg-transparent'
 }`}
 >
 <p className={`text-xs font-medium ${
 hoveredIndex === i ? 'text-blue-500' : 'text-gray-500 '
 }`}>
 {h.hour}
 </p>
 {h.area && (
 <p className="text-[9px] text-gray-400 truncate mt-0.5">
 {h.area.split(',')[0]}
 </p>
 )}
 <p className="text-sm font-bold text-gray-800 mt-1">
 {h.temperature}°
 </p>
 <div className="flex justify-center mt-1">
 <span className="material-symbols-outlined text-lg text-blue-400">
 {h.rainChance > 50 ? 'rainy' : h.rainChance > 20 ? 'partly_cloudy_day' : 'clear_day'}
 </span>
 </div>
 <p className={`text-[10px] mt-0.5 ${
 h.rainChance > 50 ? 'text-blue-400 font-medium' : 'text-gray-400 '
 }`}>
 {h.rainChance}%
 </p>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
