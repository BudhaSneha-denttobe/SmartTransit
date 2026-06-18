import { motion } from 'framer-motion';
import AnimatedBusRoute from '../components/AnimatedBusRoute';
import { useWeather } from '../weather/useWeather';
import SearchBar from '../weather/components/SearchBar';
import RouteOverview from '../weather/components/RouteOverview';
import RouteTimeline from '../weather/components/RouteTimeline';
import HourlyForecast from '../weather/components/HourlyForecast';
import RouteMap from '../weather/components/RouteMap';
import TravelRecommendations from '../weather/components/TravelRecommendations';
import DestinationWeather from '../weather/components/DestinationWeather';

export default function Weather() {
  const { routeInfo, destinationHourlyForecast, destinationWeather, destinationDailyForecast, loading, error, usedMock, routeKey, fetchWeather } = useWeather();

  return (
    <div className="min-h-screen bg-white">
      <AnimatedBusRoute />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Weather Intelligence</h1>
          <p className="text-gray-500">Real-time weather and travel recommendations for your bus routes</p>
        </motion.div>

        <div className="max-w-3xl mx-auto mb-8">
          <SearchBar onSearch={fetchWeather} loading={loading} />
        </div>

        {usedMock && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-100/50 border border-amber-200/50 text-amber-600 text-xs mb-6">
            <span className="material-symbols-outlined text-sm">info</span>
            Using demo data &mdash; set
            <code className="px-1.5 py-0.5 rounded bg-amber-200/50 font-mono text-[10px]">VITE_OPENWEATHER_API_KEY</code>
            in <code className="px-1.5 py-0.5 rounded bg-amber-200/50 font-mono text-[10px]">.env</code> for live data.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-100/50 border border-red-200/50 text-red-600 text-sm mb-6">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
            <p className="mt-4 text-gray-500 text-sm">Fetching weather data...</p>
          </div>
        )}

        {routeInfo && !loading && (
          <div key={routeKey} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RouteOverview data={routeInfo} />
              <TravelRecommendations routeData={routeInfo} destinationHourlyForecast={destinationHourlyForecast} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <RouteTimeline locations={routeInfo.locations} />
                <HourlyForecast data={destinationHourlyForecast} />
              </div>
              <DestinationWeather
                weather={destinationWeather}
                hourly={destinationHourlyForecast}
                daily={destinationDailyForecast}
              />
            </div>

            <RouteMap
              locations={routeInfo.locations}
              source={routeInfo.source}
              destination={routeInfo.destination}
            />
          </div>
        )}

        {!routeInfo && !loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn text-center">
            <span className="material-symbols-outlined text-7xl text-gray-300 animate-float">
              travel_explore
            </span>
            <p className="mt-4 text-gray-400 text-lg font-medium">
              Search for a route to see weather intelligence
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Enter source and destination to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
