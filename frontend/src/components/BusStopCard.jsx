import { motion } from 'framer-motion';

export default function BusStopCard({ stop, index, onViewMap, onArrivingBuses }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-800 font-semibold text-sm truncate">{stop.name}</h3>
          {stop.vicinity && (
            <p className="text-gray-500 text-xs mt-1 truncate">{stop.vicinity}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
            <span className="whitespace-nowrap">📍 {stop.distance} km</span>
            <span className="whitespace-nowrap">Lat: {stop.lat?.toFixed(4)}</span>
            <span className="whitespace-nowrap">Lng: {stop.lng?.toFixed(4)}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onViewMap(stop)}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0099FF] rounded-full hover:bg-[#0077CC] transition-colors"
        >
          View on Map
        </button>
        <button
          onClick={() => onArrivingBuses(stop)}
          className="px-3 py-1.5 text-xs text-[#0099FF] border border-[#0099FF]/30 rounded-full hover:bg-[#0099FF]/5 transition-all"
        >
          Show Arriving Buses
        </button>
      </div>
    </motion.div>
  );
}
