import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedBusRoute from '../../components/AnimatedBusRoute';

const API = '/api';

export default function ManageStops() {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    stopId: '',
    stopName: '',
    latitude: '',
    longitude: '',
  });

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetch(`${API}/admin/stops`, { headers })
      .then((r) => r.json())
      .then((data) => {
        setStops(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/admin/stops`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...form,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
        }),
      });
      if (res.ok) {
        const newStop = await res.json();
        setStops((prev) => [...prev, newStop]);
        setShowForm(false);
        setForm({ stopId: '', stopName: '', latitude: '', longitude: '' });
      }
    } catch {}
  };

  const handleDelete = async (stopId) => {
    if (!confirm('Delete this stop?')) return;
    try {
      const res = await fetch(`${API}/admin/stops/${stopId}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setStops((prev) => prev.filter((s) => s.stopId !== stopId));
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
          <h1 className="text-3xl font-bold text-gray-800 font-bold">Manage Stops</h1>
          <p className="text-gray-500">Total: {stops.length} stops</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-[#0099FF] text-white font-semibold rounded-full hover:bg-[#0077CC] transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Stop'}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Stop ID</label>
              <input
                type="text"
                value={form.stopId}
                onChange={(e) => setForm({ ...form, stopId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                placeholder="e.g. 10011"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Stop Name</label>
              <input
                type="text"
                value={form.stopName}
                onChange={(e) => setForm({ ...form, stopName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                placeholder="e.g. NAKREKAL"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                placeholder="e.g. 17.16226"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/20 transition-all"
                placeholder="e.g. 79.43592"
                required
              />
            </div>
            <div className="lg:col-span-4">
              <button type="submit" className="px-5 py-2.5 bg-[#0099FF] text-white font-semibold rounded-full hover:bg-[#0077CC] transition-colors">
                Create Stop
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
                <th className="text-left p-4 text-gray-500 font-medium">Stop ID</th>
                <th className="text-left p-4 text-gray-500 font-medium">Name</th>
                <th className="text-left p-4 text-gray-500 font-medium">Latitude</th>
                <th className="text-left p-4 text-gray-500 font-medium">Longitude</th>
                <th className="text-right p-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stops.map((stop) => (
                <tr key={stop.stopId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-gray-800">{stop.stopId}</td>
                  <td className="p-4 text-[#0099FF]">{stop.stopName}</td>
                  <td className="p-4 text-gray-700">{stop.latitude}</td>
                  <td className="p-4 text-gray-700">{stop.longitude}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(stop.stopId)}
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
