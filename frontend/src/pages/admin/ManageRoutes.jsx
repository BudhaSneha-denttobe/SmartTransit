import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedBusRoute from '../../components/AnimatedBusRoute';

const API = '/api';

export default function ManageRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    routeId: '',
    routeNumber: '',
    routeName: '',
    routeType: '3',
    routeColor: '',
  });

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetch(`${API}/admin/routes`, { headers })
      .then((r) => r.json())
      .then((data) => {
        setRoutes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/admin/routes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newRoute = await res.json();
        setRoutes((prev) => [...prev, newRoute]);
        setShowForm(false);
        setForm({ routeId: '', routeNumber: '', routeName: '', routeType: '3', routeColor: '' });
      }
    } catch {}
  };

  const handleDelete = async (routeId) => {
    if (!confirm('Delete this route?')) return;
    try {
      const res = await fetch(`${API}/admin/routes/${routeId}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setRoutes((prev) => prev.filter((r) => r.routeId !== routeId));
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0099FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatedBusRoute />
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/admin" className="text-[#0099FF] text-sm hover:underline mb-2 block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 font-bold">Manage Routes</h1>
          <p className="text-gray-500">Total: {routes.length} routes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-[#0099FF] text-white font-semibold rounded-full hover:bg-[#0077CC] transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Route'}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Route ID</label>
              <input
                type="text"
                value={form.routeId}
                onChange={(e) => setForm({ ...form, routeId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                placeholder="e.g. 01004"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Route Number</label>
              <input
                type="text"
                value={form.routeNumber}
                onChange={(e) => setForm({ ...form, routeNumber: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                placeholder="e.g. 01004"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Route Name</label>
              <input
                type="text"
                value={form.routeName}
                onChange={(e) => setForm({ ...form, routeName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                placeholder="Route name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Route Color</label>
              <input
                type="text"
                value={form.routeColor}
                onChange={(e) => setForm({ ...form, routeColor: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                placeholder="e.g. #00bfff"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="px-5 py-2.5 bg-[#0099FF] text-white font-semibold rounded-full hover:bg-[#0077CC] transition-colors w-full">
                Create Route
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-gray-500 font-medium">Route ID</th>
                <th className="text-left p-4 text-gray-500 font-medium">Number</th>
                <th className="text-left p-4 text-gray-500 font-medium">Name</th>
                <th className="text-left p-4 text-gray-500 font-medium">Color</th>
                <th className="text-right p-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.routeId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-gray-800">{route.routeId}</td>
                  <td className="p-4 text-[#0099FF]">{route.routeNumber}</td>
                  <td className="p-4 text-gray-700">{route.routeName}</td>
                  <td className="p-4">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: route.routeColor || '#00bfff' }}
                    />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(route.routeId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
