import { useState } from 'react';

export default function SearchBar({ onSearch, loading }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!source.trim() || !destination.trim()) return;
    onSearch({ source, destination });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full animate-slideInRight delay-300">
      <div className="backdrop-blur-xl bg-white/90 rounded-3xl border border-slate-200/70 p-6 shadow-2xl shadow-sky-200/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Source</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                trip_origin
              </span>
              <input
                type="text"
                value={source}
                onChange={e => setSource(e.target.value)}
                placeholder="Enter your starting point"
                className="w-full pl-11 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0099FF]/50 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Destination</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                location_on
              </span>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Enter your destination"
                className="w-full pl-11 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0099FF]/50 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 via-[#0099FF] to-[#FFCC00] text-white font-semibold text-sm shadow-xl shadow-[#0099FF]/30 transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined">search</span>
            )}
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
    </form>
  );
}
