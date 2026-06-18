import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const API = '/api';

const typeLabels = { '0': 'Tram', '1': 'Metro', '2': 'Rail', '3': 'Bus', '4': 'Ferry' };

export default function AllBuses() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${API}/main-admin-buses${params}`, { headers });
      const data = await res.json();
      setRoutes(data);
    } catch {
      toast.error('Failed to load GTFS routes');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  const handleDelete = async (routeId, routeNumber) => {
    if (!window.confirm(`Delete GTFS route "${routeId}" (${routeNumber})? This removes it from Route Planner and Track Bus.`)) return;
    try {
      const res = await fetch(`${API}/main-admin-buses/gtfs/${encodeURIComponent(routeId)}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Delete failed');
      toast.success(`Route ${routeNumber} deleted`);
      fetchRoutes();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by route number or route name..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
        </div>
      ) : routes.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Route ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Route Number</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Route Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Agency</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {routes.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.routeId}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.routeNumber}</td>
                    <td className="px-4 py-3 text-gray-700">{r.routeName || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{r.agencyId || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {typeLabels[r.routeType] || r.routeType || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(r.routeId, r.routeNumber)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No GTFS routes found.</p>
        </div>
      )}
    </div>
  );
}
