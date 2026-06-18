import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import AnimatedBusRoute from '../components/AnimatedBusRoute';

export default function Profile() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/search-history', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const clearHistory = async () => {
    const token = localStorage.getItem('token');
    await fetch('/api/search-history', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-white">
      <AnimatedBusRoute />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-500">Manage your account and search history</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="w-20 h-20 mx-auto bg-[#0099FF] rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-[#0099FF]/10 text-[#0099FF] text-xs font-semibold rounded-full capitalize">
                {user?.role || 'user'}
              </span>
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                <p>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Search History</h2>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {loading && (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#0099FF] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading && history.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No searches yet</p>
                  <p className="text-gray-400 text-sm mt-1">Search for routes in the Route Planner to see them here</p>
                </div>
              )}

              {!loading && history.length > 0 && (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div
                      key={entry._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-[#0099FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0099FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {entry.source} <span className="text-gray-400">→</span> {entry.destination}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(entry.searchedAt).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{entry.filters?.sortBy || 'fastest'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
