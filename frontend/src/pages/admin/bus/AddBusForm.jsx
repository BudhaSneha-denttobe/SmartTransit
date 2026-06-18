import { useState } from 'react';
import toast from 'react-hot-toast';

const API = '/api';

export default function AddBusForm() {
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
      toast.success('Bus added successfully — it now appears in Route Planner and Track Bus');
      setFormData({ busNumber: '', busName: '', busType: 'Express', source: '', destination: '', departureTime: '', arrivalTime: '', driverName: '', status: 'Active' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

function Input({ label, name, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
    </div>
  );
}
