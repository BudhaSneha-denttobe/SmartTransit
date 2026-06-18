import { useState, useCallback } from "react";
import { getBusByNumber, deleteBus } from "../../services/adminBusService";
import toast from "react-hot-toast";

const DeleteBus = () => {
  const [busNumber, setBusNumber] = useState("");
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!busNumber.trim()) {
      toast.error("Please enter a bus number");
      return;
    }
    setLoading(true);
    setBus(null);
    try {
      const data = await getBusByNumber(busNumber.trim());
      setBus(data);
    } catch {
      toast.error("Bus not found");
    } finally {
      setLoading(false);
    }
  }, [busNumber]);

  const handleDelete = async () => {
    if (!bus) return;
    setDeleting(true);
    try {
      await deleteBus(bus._id);
      toast.success("Bus deleted successfully");
      setBus(null);
      setBusNumber("");
    } catch (error) {
      toast.error(error.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Active: "bg-emerald-100 text-emerald-800",
      Delayed: "bg-amber-100 text-amber-800",
      Cancelled: "bg-red-100 text-red-800",
      Maintenance: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delete Bus</h1>
        <p className="text-gray-500">Search and remove a bus from the system</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. AP39AB1234"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
              ) : "Search"}
            </button>
          </div>
        </div>

        {bus && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{bus.busName}</h3>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(bus.status)}`}>
                {bus.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Bus Number:</span>
                <p className="font-medium text-gray-900">{bus.busNumber}</p>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <p className="font-medium text-gray-900">{bus.busType}</p>
              </div>
              <div>
                <span className="text-gray-500">Route:</span>
                <p className="font-medium text-gray-900">{bus.source} &rarr; {bus.destination}</p>
              </div>
              <div>
                <span className="text-gray-500">Driver:</span>
                <p className="font-medium text-gray-900">{bus.driverName}</p>
              </div>
              <div>
                <span className="text-gray-500">Departure:</span>
                <p className="font-medium text-gray-900">{bus.departureTime}</p>
              </div>
              <div>
                <span className="text-gray-500">Arrival:</span>
                <p className="font-medium text-gray-900">{bus.arrivalTime}</p>
              </div>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Bus"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteBus;
