import { motion } from 'framer-motion';

export default function AnimatedBusRoute({ className = '' }) {
  return (
    <div className={`relative w-full h-32 bg-gradient-to-r from-[#E8F4FD] via-[#F0F8FF] to-[#E8F4FD] overflow-hidden ${className}`}>
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#0099FF]/40" />
      <div className="absolute left-0 right-0 top-[calc(50%+6px)] flex justify-between px-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-2 h-0.5 bg-[#0099FF]/30 rounded-full" />
        ))}
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 animate-driveBus">
        <svg width="100" height="50" viewBox="0 0 140 70" fill="none">
          <rect x="5" y="8" width="130" height="38" rx="10" fill="#FFCC00" />
          <rect x="5" y="30" width="130" height="16" rx="6" fill="#0099FF" />
          <rect x="8" y="11" width="18" height="16" rx="4" fill="#B3E0FF" />
          <rect x="30" y="11" width="14" height="16" rx="3" fill="#B3E0FF" />
          <rect x="48" y="11" width="14" height="16" rx="3" fill="#B3E0FF" />
          <rect x="66" y="11" width="14" height="16" rx="3" fill="#B3E0FF" />
          <rect x="84" y="11" width="14" height="16" rx="3" fill="#B3E0FF" />
          <rect x="102" y="11" width="14" height="16" rx="4" fill="#B3E0FF" />
          <line x1="10" y1="18" x2="22" y2="18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="30" cy="50" r="7" fill="#2d2d2d" />
          <circle cx="90" cy="50" r="7" fill="#2d2d2d" />
          <circle cx="30" cy="50" r="4" fill="#555" />
          <circle cx="90" cy="50" r="4" fill="#555" />
          <circle cx="132" cy="22" r="3" fill="#FFE066" />
        </svg>
      </div>
      <style>{`
        @keyframes driveBus {
          0% { left: -160px; }
          85% { left: calc(100% - 200px); }
          90%, 100% { left: calc(100% - 200px); }
        }
        .animate-driveBus {
          animation: driveBus 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export function BusStopSign() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 bg-[#0099FF] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <rect x="4" y="2" width="16" height="16" rx="2" />
          <rect x="6" y="4" width="12" height="8" rx="1" fill="#0099FF" />
          <rect x="6" y="4" width="12" height="8" rx="1" fill="white" opacity="0.3" />
          <line x1="8" y1="6" x2="16" y2="6" stroke="#0099FF" strokeWidth="1.5" />
          <line x1="8" y1="9" x2="14" y2="9" stroke="#0099FF" strokeWidth="1.5" />
          <rect x="8" y="14" width="8" height="2" rx="1" fill="white" />
          <circle cx="9" cy="18" r="1.5" fill="#333" />
          <circle cx="15" cy="18" r="1.5" fill="#333" />
        </svg>
      </div>
      <div className="w-1 h-12 bg-[#0099FF]/60 rounded-full -mt-1" />
    </div>
  );
}

export function RouteMapSVG({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 200 100" fill="none">
      <path d="M10,50 C40,20 70,80 100,50 C130,20 160,80 190,50" stroke="#0099FF" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="4 3" />
      <circle cx="30" cy="35" r="4" fill="#0099FF" />
      <circle cx="70" cy="65" r="4" fill="#0099FF" />
      <circle cx="110" cy="35" r="4" fill="#0099FF" />
      <circle cx="150" cy="65" r="4" fill="#0099FF" />
      <circle cx="180" cy="40" r="4" fill="#FFCC00" />
      <circle cx="10" cy="50" r="3" fill="#22C55E" />
      <circle cx="190" cy="50" r="3" fill="#22C55E" />
    </svg>
  );
}
