import { useMemo } from 'react';
import type { RouteInfo, HourlyForecast } from '../types';

interface TravelRecommendationsProps {
 routeData: RouteInfo;
 destinationHourlyForecast: HourlyForecast[];
}

type AlertType = 'heat' | 'rain' | 'both' | 'none';

interface AreaRecommendation {
 area: string;
 temp: number;
 rain: number;
 type: AlertType;
 tip: string;
}

export default function TravelRecommendations({ routeData, destinationHourlyForecast }: TravelRecommendationsProps) {
 const topAlert = useMemo<AreaRecommendation | null>(() => {
 if (!destinationHourlyForecast.length) return null;

 const highestTemp = Math.max(...destinationHourlyForecast.map(h => h.temperature));
 const maxRain = Math.max(...destinationHourlyForecast.map(h => h.rainChance));
 const isHot = highestTemp > 35;
 const isRainy = maxRain > 50;
 const type: AlertType = isHot && isRainy ? 'both' : isHot ? 'heat' : isRainy ? 'rain' : 'none';

 const tip =
 type === 'both'
 ? 'Take both a water bottle and an umbrella for destination weather.'
 : type === 'heat'
 ? 'Carry a water bottle for hot destination weather.'
 : type === 'rain'
 ? 'Take an umbrella for rain at your destination.'
 : 'Destination weather is mild; stay hydrated and travel comfortably.';

 return {
 area: routeData.destination,
 temp: highestTemp,
 rain: maxRain,
 type,
 tip,
 };
 }, [routeData.destination, destinationHourlyForecast]);

 if (!topAlert) return null;

 const recommendationLabel =
 topAlert.type === 'both'
 ? 'Water + umbrella recommended'
 : topAlert.type === 'heat'
 ? 'Water bottle recommended'
 : topAlert.type === 'rain'
 ? 'Umbrella recommended'
 : 'Travel readiness tip';

  return (
  <div className="animate-slideUp delay-100 group">
  <h2 className="text-lg font-semibold text-yellow-500 mb-4 flex items-center gap-2">
  <span className="material-symbols-outlined text-yellow-500 group-hover:scale-110 transition-transform duration-300">lightbulb</span>
  Destination Travel Recommendation
  </h2>
  <div className="rounded-3xl border border-blue-200/70 bg-white/90 shadow-xl shadow-sky-200/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
  <div className="px-4 py-3 bg-gradient-to-r from-sky-500 via-blue-500 to-yellow-400 text-white">
 <p className="text-sm font-semibold">{topAlert.area} • {topAlert.temp}°C • 🌧 {topAlert.rain}%</p>
 <p className="text-xs opacity-90 mt-1">{recommendationLabel}</p>
 </div>
 <div className="p-4">
 <p className="text-sm text-slate-700 mb-3">
 {topAlert.type === 'both'
 ? 'Destination is both hot and rainy. Pack accordingly.'
 : topAlert.type === 'heat'
 ? 'Destination looks hot. Stay hydrated.'
 : topAlert.type === 'rain'
 ? 'Destination looks rainy. Take an umbrella.'
 : 'Destination weather looks mild and comfortable.'}
 </p>
 <p className="text-sm font-medium text-slate-900 ">{topAlert.tip}</p>
 </div>
 </div>
 </div>
 );
}
