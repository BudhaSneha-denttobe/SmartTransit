import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import toast, { Toaster } from 'react-hot-toast';
import AnimatedBusRoute from '../../components/AnimatedBusRoute';

const API = '/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0099FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-blue-700' },
    { label: 'Total Routes', value: stats?.totalRoutes || 0, icon: '🚌', color: 'from-green-500 to-green-700' },
    { label: 'Total Stops', value: stats?.totalStops || 0, icon: '📍', color: 'from-purple-500 to-purple-700' },
    { label: 'Total Trips', value: stats?.totalTrips || 0, icon: '🔄', color: 'from-orange-500 to-orange-700' },
    { label: 'Total Buses', value: stats?.totalBuses || 0, icon: '🚍', color: 'from-cyan-500 to-cyan-700' },
    { label: 'Shape Points', value: stats?.totalShapes || 0, icon: '🗺️', color: 'from-pink-500 to-pink-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', background: '#333', color: '#fff' } }} />
      <AnimatedBusRoute />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-xl`}
              >
                {card.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{card.value}</div>
                <div className="text-sm text-gray-500">{card.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <TabBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
        <TabBtn active={activeTab === 'add-bus'} onClick={() => setActiveTab('add-bus')} label="Add Bus" />
        <TabBtn active={activeTab === 'delete-bus'} onClick={() => setActiveTab('delete-bus')} label="Delete Bus" />
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminNavCard to="/admin/buses" icon="🚍" title="Manage Buses" desc="Add, view, and remove buses — syncs to Route Planner & Track Bus" delay={0.15} />
          <AdminNavCard to="/admin/routes" icon="🚌" title="Manage Routes" desc="Create, update, and delete bus routes" delay={0.2} />
          <AdminNavCard to="/admin/stops" icon="📍" title="Manage Stops" desc="Create, update, and delete bus stops" delay={0.25} />
          <AdminNavCard to="/admin/users" icon="👥" title="Manage Users" desc="View and manage registered users" delay={0.3} />
        </div>
      )}

      {activeTab === 'add-bus' && <AddBusSection />}
      {activeTab === 'delete-bus' && <DeleteBusSection />}
    </div>
  );
}

function TabBtn({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-[#0099FF] text-[#0099FF]'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

function AdminNavCard({ to, icon, title, desc, delay }) {
  return (
    <motion.a
      href={to}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow block group"
    >
      <div className="flex items-center gap-4 mb-3">
        <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
      </div>
      <div className="text-[#0099FF] text-sm group-hover:translate-x-2 transition-transform">
        Manage &rarr;
      </div>
    </motion.a>
  );
}

function AddBusSection() {
  const [formData, setFormData] = useState({
    busNumber: '', busName: '', busType: 'Express', source: '',
    destination: '', departureTime: '', arrivalTime: '', driverName: '', status: 'Active',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { busNumber, busName, busType, source, destination, departureTime, arrivalTime, driverName } = formData;
    if (!busNumber || !busName || !busType || !source || !destination || !departureTime || !arrivalTime || !driverName) {
      return toast.error('All fields are required');
    }
    if (departureTime >= arrivalTime) {
      return toast.error('Arrival time must be greater than departure time');
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/main-admin-buses/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Bus added successfully');
      setFormData({ busNumber: '', busName: '', busType: 'Express', source: '', destination: '', departureTime: '', arrivalTime: '', driverName: '', status: 'Active' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Bus</h2>
      <p className="text-gray-500 mb-4">Adding a bus creates GTFS records so it appears in Route Planner and Track Bus.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Route Number" name="busNumber" value={formData.busNumber} onChange={handleChange} placeholder="e.g. 101" />
          <Input label="Bus Name" name="busName" value={formData.busName} onChange={handleChange} placeholder="e.g. City Express" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus Type</label>
            <select name="busType" value={formData.busType} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option value="Express">Express</option>
              <option value="AC">AC</option>
              <option value="Sleeper">Sleeper</option>
            </select>
          </div>
          <Input label="Source" name="source" value={formData.source} onChange={handleChange} placeholder="e.g. MILK PROJECT" />
          <Input label="Destination" name="destination" value={formData.destination} onChange={handleChange} placeholder="e.g. AUTONAGAR" />
          <Input label="Departure Time" name="departureTime" type="time" value={formData.departureTime} onChange={handleChange} />
          <Input label="Arrival Time" name="arrivalTime" type="time" value={formData.arrivalTime} onChange={handleChange} />
          <Input label="Driver Name" name="driverName" value={formData.driverName} onChange={handleChange} placeholder="Driver name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option value="Active">Active</option>
            <option value="Delayed">Delayed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Adding...' : 'Add Bus'}
        </button>
      </form>
    </div>
  );
}

function DeleteBusSection() {
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
      toast.success('Bus deleted successfully');
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
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Bus</h2>
      <p className="text-gray-500 mb-4">Deleting a bus removes it from the database and its GTFS records — it will disappear from Route Planner and Track Bus.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Route Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 101"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
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
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Bus'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ label, name, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
    </div>
  );
}
