import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addBus } from "../../services/adminBusService";
import toast from "react-hot-toast";

const AddBus = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    busNumber: "",
    busName: "",
    busType: "Express",
    source: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    driverName: "",
    status: "Active",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const {
      busNumber, busName, busType, source, destination,
      departureTime, arrivalTime, driverName,
    } = formData;
    if (!busNumber || !busName || !busType || !source || !destination || !departureTime || !arrivalTime || !driverName) {
      toast.error("All fields are required");
      return false;
    }
    if (departureTime >= arrivalTime) {
      toast.error("Arrival time must be greater than departure time");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await addBus(formData);
      toast.success("Bus added successfully");
      setFormData({ busNumber: "", busName: "", busType: "Express", source: "", destination: "", departureTime: "", arrivalTime: "", driverName: "", status: "Active" });
      navigate("/admin-portal/buses");
    } catch (error) {
      toast.error(error.message || "Failed to add bus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Bus</h1>
        <p className="text-gray-500">Register a new bus in the system</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number</label>
            <input type="text" name="busNumber" value={formData.busNumber} onChange={handleChange} placeholder="e.g. AP39AB1234" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus Name</label>
            <input type="text" name="busName" value={formData.busName} onChange={handleChange} placeholder="e.g. City Express" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bus Type</label>
            <select name="busType" value={formData.busType} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option value="Express">Express</option>
              <option value="AC">AC</option>
              <option value="Sleeper">Sleeper</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <input type="text" name="source" value={formData.source} onChange={handleChange} placeholder="Departure city" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <input type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="Arrival city" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
            <input type="time" name="departureTime" value={formData.departureTime} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
            <input type="time" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
            <input type="text" name="driverName" value={formData.driverName} onChange={handleChange} placeholder="Driver full name" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
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
        <div className="pt-2">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Adding..." : "Add Bus"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBus;
