import { useState } from 'react';
import toast from 'react-hot-toast';

const API = '/api';

export default function DeleteBusForm() {
  const [busNumber, setBusNumber] = useState('');
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSearch = async () => {
    if (!busNumber.trim()) return toast.error('Please enter a bus number');
    setLoading(true);
    setBus(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/main-admin-buses/number/${encodeURIComponent(busNumber.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Bus not found');
      const data = await res.json();
      setBus(data);
    } catch {
      toast.error('Bus not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!bus) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/main-admin-buses/${bus._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Bus deleted — removed from Route Planner and Track Bus');
      setBus(null);
      setBusNumber('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Route Number</label>
          <div className="flex gap-2">
            <input type="text" value={busNumber} onChange={(e) => setBusNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="e.g. 101"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <button onClick={handleSearch} disabled={loading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" /> : 'Search'}
            </button>
          </div>
        </div>

        {bus && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{bus.busName}</h3>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                { Active: 'bg-emerald-100 text-emerald-800', Delayed: 'bg-amber-100 text-amber-800', Cancelled: 'bg-red-100 text-red-800', Maintenance: 'bg-gray-100 text-gray-800' }[bus.status] || 'bg-gray-100 text-gray-800'
              }`}>{bus.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Route Number:</span><p className="font-medium text-gray-900">{bus.busNumber}</p></div>
              <div><span className="text-gray-500">Type:</span><p className="font-medium text-gray-900">{bus.busType}</p></div>
              <div><span className="text-gray-500">Route:</span><p className="font-medium text-gray-900">{bus.source} &rarr; {bus.destination}</p></div>
              <div><span className="text-gray-500">Driver:</span><p className="font-medium text-gray-900">{bus.driverName}</p></div>
              <div><span className="text-gray-500">Departure:</span><p className="font-medium text-gray-900">{bus.departureTime}</p></div>
              <div><span className="text-gray-500">Arrival:</span><p className="font-medium text-gray-900">{bus.arrivalTime}</p></div>
            </div>
            <button onClick={handleDelete} disabled={deleting}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
              {deleting ? 'Deleting...' : 'Delete Bus'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
