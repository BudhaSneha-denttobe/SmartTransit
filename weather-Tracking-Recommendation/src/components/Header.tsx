export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-blue-400">
              directions_bus
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                BusTrack <span className="text-blue-400">Weather</span>
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Smart Weather Intelligence for Bus Travel
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
