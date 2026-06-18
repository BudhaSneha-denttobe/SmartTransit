import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBusByIdService, updateBusService } from "../services/busService";
import toast from "react-hot-toast";

const UpdateBus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    busName: "",
    busType: "Express",
    source: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    driverName: "",
    status: "Active",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBus();
  }, [id]);

  const fetchBus = async () => {
    try {
      const res = await getBusByIdService(id);
      const bus = res.data;
      setFormData({
        busName: bus.busName,
        busType: bus.busType,
        source: bus.source,
        destination: bus.destination,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        driverName: bus.driverName,
        status: bus.status,
      });
    } catch (error) {
      toast.error("Failed to fetch bus details");
      navigate("/buses");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      busName,
      busType,
      source,
      destination,
      departureTime,
      arrivalTime,
      driverName,
    } = formData;

    if (
      !busName ||
      !busType ||
      !source ||
      !destination ||
      !departureTime ||
      !arrivalTime ||
      !driverName
    ) {
      toast.error("All fields are required");
      return;
    }

    if (departureTime >= arrivalTime) {
      toast.error("Arrival time must be greater than departure time");
      return;
    }

    setSubmitting(true);
    try {
      await updateBusService(id, formData);
      toast.success("Bus updated successfully");
      navigate("/buses");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Update Bus</h1>
        <p className="text-gray-500">Modify bus information</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Name
            </label>
            <input
              type="text"
              name="busName"
              value={formData.busName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Type
            </label>
            <select
              name="busType"
              value={formData.busType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="Express">Express</option>
              <option value="AC">AC</option>
              <option value="Sleeper">Sleeper</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Time
            </label>
            <input
              type="time"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arrival Time
            </label>
            <input
              type="time"
              name="arrivalTime"
              value={formData.arrivalTime}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driver Name
            </label>
            <input
              type="text"
              name="driverName"
              value={formData.driverName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="Active">Active</option>
              <option value="Delayed">Delayed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Update Bus"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateBus;
