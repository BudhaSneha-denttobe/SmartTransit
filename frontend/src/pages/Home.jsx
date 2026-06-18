import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const features = [
  { title: 'Track Bus', description: 'Track your bus in real-time with live location, speed and arrival estimates.', path: '/track-bus', image: '/assets/tracker-bus.jpg' },
  { title: 'Route Planner', description: 'Optimize your commute with AI-generated, fastest alternative paths.', path: '/route-planner', image: '/assets/route-planner.png' },
  { title: 'Bus Stops', description: 'Locate nearest stations, real-time arrival estimates, and crowdedness levels.', path: '/stops', image: '/assets/bus stop.png' },
  { title: 'Weather Alerts', description: 'Stay updated with localized climate conditions impacting transit schedules.', path: '/weather', image: '/assets/weather2.png' },
  { title: 'BusTrack Chatbot', description: 'Ask our AI chatbot about bus routes, stops, schedules, and real-time transit info.', path: '/assistant', image: '/assets/assistent.jpg' },
  { title: 'Emergency Hub', description: 'Instant SOS reporting, medical support triggers, and rapid detour routing.', path: '/emergency', image: '/assets/emergency.jpg' },
];

const typedLines = [
  'Real-time bus tracking across the entire city network.',
  'AI-powered route planning with optimized travel suggestions.',
  'Live weather intelligence to plan your commute better.',
  'Instant emergency alerts and safety features.',
  'Smart transit — built for the way you move.',
];

function TypingText() {
  const [displayed, setDisplayed] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const currentLine = typedLines[lineIndex];
    if (!isDeleting) {
      if (charIndex < currentLine.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(currentLine.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, 40);
      } else {
        timeoutRef.current = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (charIndex > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(currentLine.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        }, 20);
      } else {
        setIsDeleting(false);
        setLineIndex((l) => (l + 1) % typedLines.length);
      }
    }
    return () => clearTimeout(timeoutRef.current);
  }, [charIndex, isDeleting, lineIndex]);

  return (
    <div className="h-20 sm:h-16 flex items-center justify-center">
      <p className="text-gray-600 text-lg sm:text-xl font-mono">
        {displayed}
        <span className="animate-pulse text-[#0099FF]">|</span>
      </p>
    </div>
  );
}

function PortalCard({ type }) {
  const navigate = useNavigate();
  const isUser = type === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: isUser ? 0.2 : 0.4 }}
      className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300"
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 overflow-hidden">
        <img
          src={isUser ? '/assets/user2.jpg' : '/assets/admin.jpg'}
          alt={isUser ? 'User Portal' : 'Admin Portal'}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {isUser ? 'User Portal' : 'Admin Portal'}
      </h3>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        {isUser
          ? 'Access personalized routes, track your favorite buses, and manage your travel preferences.'
          : 'Monitor fleet operations, manage routes, view analytics, and oversee system performance.'}
      </p>
      <div className="flex gap-3 w-full">
        <button
          onClick={() => navigate('/login')}
          className="flex-1 px-5 py-2.5 bg-[#0099FF] text-white font-semibold text-sm rounded-full hover:bg-[#0077CC] transition-colors"
        >
          Sign In
        </button>
        {isUser && (
          <button
            onClick={() => navigate('/register')}
            className="flex-1 px-5 py-2.5 border-2 border-[#0099FF] text-[#0099FF] font-semibold text-sm rounded-full hover:bg-[#0099FF]/5 transition-colors"
          >
            Sign Up
          </button>
        )}
      </div>
    </motion.div>
  );
}

function BusStopSign() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 bg-[#0099FF] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
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
      <div className="w-1 h-16 bg-[#0099FF]/60 rounded-full -mt-1" />
    </div>
  );
}

function BusGraphic() {
  return (
    <svg width="140" height="70" viewBox="0 0 140 70" fill="none">
      <rect x="5" y="8" width="130" height="38" rx="10" fill="#FFCC00" />
      <rect x="5" y="8" width="130" height="38" rx="10" fill="url(#busGradient)" opacity="0.3" />
      <rect x="5" y="30" width="130" height="16" rx="6" fill="#0099FF" />
      <rect x="8" y="11" width="22" height="16" rx="4" fill="#B3E0FF" />
      <rect x="34" y="11" width="16" height="16" rx="3" fill="#B3E0FF" />
      <rect x="54" y="11" width="16" height="16" rx="3" fill="#B3E0FF" />
      <rect x="74" y="11" width="16" height="16" rx="3" fill="#B3E0FF" />
      <rect x="94" y="11" width="16" height="16" rx="3" fill="#B3E0FF" />
      <rect x="114" y="11" width="16" height="16" rx="4" fill="#B3E0FF" />
      <line x1="12" y1="18" x2="26" y2="18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="34" cy="50" r="9" fill="#2d2d2d" />
      <circle cx="100" cy="50" r="9" fill="#2d2d2d" />
      <circle cx="34" cy="50" r="5" fill="#555" />
      <circle cx="100" cy="50" r="5" fill="#555" />
      <circle cx="132" cy="22" r="3.5" fill="#FFE066" />
      <circle cx="132" cy="22" r="3.5" fill="#fff" opacity="0.5" />
      <rect x="7" y="38" width="126" height="4" fill="#0099FF" opacity="0.3" rx="2" />
      <defs>
        <linearGradient id="busGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFDD33" />
          <stop offset="100%" stopColor="#FFB800" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function AnimatedBusSection() {
  return (
    <div className="relative w-full h-48 bg-gradient-to-r from-[#E8F4FD] via-[#F0F8FF] to-[#E8F4FD] overflow-hidden">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#0099FF]/40" />
      <div className="absolute left-0 right-0 top-[calc(50%+8px)] flex justify-between px-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-3 h-0.5 bg-[#0099FF]/30 rounded-full" />
        ))}
      </div>
      <div className="absolute right-12 top-1/2 -translate-y-1/2 z-10">
        <BusStopSign />
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 animate-driveBus" style={{ zIndex: 5 }}>
        <BusGraphic />
      </div>
    </div>
  );
}

function LiveMap() {
  const routes = [
    { path: 'M100,160 C180,100 250,180 350,140 C450,100 500,200 600,160', delay: '0s' },
    { path: 'M120,280 C220,320 300,240 420,280 C500,320 580,260 680,280', delay: '1s' },
    { path: 'M80,400 C180,360 280,440 380,380 C480,320 580,400 700,360', delay: '2s' },
  ];

  const dots = [
    { cx: 200, cy: 130, delay: '0s' },
    { cx: 450, cy: 150, delay: '1.5s' },
    { cx: 300, cy: 260, delay: '0.8s' },
    { cx: 550, cy: 290, delay: '2s' },
    { cx: 250, cy: 390, delay: '1.2s' },
    { cx: 600, cy: 370, delay: '2.5s' },
  ];

  const stops = [
    { cx: 100, cy: 160, label: 'Central' },
    { cx: 350, cy: 140, label: 'Market' },
    { cx: 600, cy: 160, label: 'Station' },
    { cx: 680, cy: 280, label: 'Mall' },
    { cx: 120, cy: 280, label: 'Park' },
    { cx: 420, cy: 280, label: 'Square' },
    { cx: 700, cy: 360, label: 'Airport' },
    { cx: 380, cy: 380, label: 'Hub' },
  ];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Live Transit Map</h2>
            <p className="text-gray-500 text-sm mt-1">Real-time bus positions across the city network</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            {dots.length} buses active
          </div>
        </div>
        <div className="relative w-full h-[300px] sm:h-[450px] bg-[#0D1117] rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
              `,
              backgroundSize: '35px 35px',
            }}
          />
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 500"
            preserveAspectRatio="xMidYMid meet"
          >
            {routes.map((r, i) => (
              <path key={i} d={r.path} fill="none" stroke="#0099FF" strokeWidth="3" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={i === 1 ? '8 6' : 'none'} />
            ))}
            {routes.map((r, i) => (
              <path key={`glow-${i}`} d={r.path} fill="none" stroke="#0099FF" strokeWidth="8" strokeOpacity="0.15" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {stops.map((s, i) => (
              <g key={i}>
                <circle cx={s.cx} cy={s.cy} r="6" fill="white" stroke="#0099FF" strokeWidth="2.5" />
                <text x={s.cx} y={s.cy - 14} textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="Inter, sans-serif" fontWeight="600">{s.label}</text>
              </g>
            ))}
            {dots.map((d, i) => (
              <g key={i}>
                <circle cx={d.cx} cy={d.cy} r="10" fill="#0099FF" fillOpacity="0.15">
                  <animate attributeName="r" values="10;16;10" dur="2s" begin={d.delay} repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.15;0.05;0.15" dur="2s" begin={d.delay} repeatCount="indefinite" />
                </circle>
                <circle cx={d.cx} cy={d.cy} r="5" fill="#22C55E">
                  <animate attributeName="r" values="5;7;5" dur="2s" begin={d.delay} repeatCount="indefinite" />
                </circle>
                <circle cx={d.cx} cy={d.cy} r="5" fill="#22C55E" fillOpacity="0.4">
                  <animate attributeName="r" values="5;12;5" dur="2s" begin={d.delay} repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.4;0;0.4" dur="2s" begin={d.delay} repeatCount="indefinite" />
                </circle>
              </g>
            ))}
          </svg>
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-300 flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400" /> Live Bus</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-[#0099FF] bg-white" /> Stop</span>
            <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-[#0099FF]" /> Route</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, description, index, path, image }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,153,255,0.12)' }}
      onClick={() => navigate(path)}
      className="bg-white rounded-2xl border border-gray-100 cursor-pointer transition-colors duration-300 hover:border-[#0099FF]/30"
    >
      <div className="p-7">
        {image && (
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-gray-100">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [hoveredSection, setHoveredSection] = useState(null);

  const handleSectionHover = useCallback((section) => {
    setHoveredSection(section);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes driveBus {
          0% { left: -160px; }
          85% { left: calc(100% - 220px); }
          90%, 100% { left: calc(100% - 220px); }
        }
        .animate-driveBus {
          animation: driveBus 10s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-b from-[#F0F8FF] to-white pt-12 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8"
        onMouseEnter={() => handleSectionHover('hero')}
        onMouseLeave={() => handleSectionHover(null)}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0099FF]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FFCC00]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-base sm:text-lg font-semibold text-[#0099FF] tracking-wide uppercase mb-2">
              Welcome to
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-4 flex-wrap">
              <motion.span
                className="text-[#0099FF] inline-block"
                initial={{ opacity: 0, x: -80 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                Smart
              </motion.span>
              <motion.span
                className="text-[#FFCC00] inline-block"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              >
                Transit
              </motion.span>
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-10 sm:mb-14 leading-relaxed">
              AI powered public transportation platform. Track buses, plan routes and travel smarter.
            </p>
          </motion.div>
          {user ? (
            <div className="max-w-2xl mx-auto">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-semibold text-gray-700 mb-3"
              >
                Welcome back, {user.name} 👋
              </motion.p>
              <TypingText />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-center">
              <PortalCard type="user" />
              <PortalCard type="admin" />
            </div>
          )}
        </div>
      </section>

      {/* Animated Bus Separator */}
      <AnimatedBusSection />

      {/* Live Map */}
      <LiveMap />

      {/* Features Grid */}
      <section
        className="bg-[#F0F8FF] py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
        onMouseEnter={() => handleSectionHover('features')}
        onMouseLeave={() => handleSectionHover(null)}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Everything You Need</h2>
            <p className="text-gray-500 text-sm sm:text-base mt-2">Powerful tools for a seamless transit experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
