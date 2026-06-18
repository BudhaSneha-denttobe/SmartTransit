import { useState } from "react";
import { getBusByNumberService, deleteBusService } from "../services/busService";
import toast from "react-hot-toast";
import { HiOutlineMagnifyingGlass, HiOutlineTruck } from "react-icons/hi2";

const DeleteBus = () => {
  const [busNumber, setBusNumber] = useState("");
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!busNumber.trim()) {
      toast.error("Please enter a bus number");
      return;
    }
    setSearching(true);
    setBus(null);
    try {
      const res = await getBusByNumberService(busNumber.trim());
      setBus(res.data);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Bus not found");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteBusService(bus._id);
      toast.success("Bus deleted successfully");
      setBus(null);
      setBusNumber("");
      setShowConfirm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delete Bus</h1>
        <p className="text-gray-500">
          Search a bus by number and remove it from the system
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search by Bus Number
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              placeholder="e.g. AP39AB1234"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {bus && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <HiOutlineTruck className="text-2xl text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {bus.busNumber}
              </h2>
              <p className="text-sm text-gray-500">{bus.busName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 font-medium text-gray-900">
                {bus.busType}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="ml-2 font-medium text-gray-900">
                {bus.status}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Source:</span>
              <span className="ml-2 font-medium text-gray-900">
                {bus.source}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Destination:</span>
              <span className="ml-2 font-medium text-gray-900">
                {bus.destination}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Departure:</span>
              <span className="ml-2 font-medium text-gray-900">
                {bus.departureTime}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Arrival:</span>
              <span className="ml-2 font-medium text-gray-900">
                {bus.arrivalTime}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Driver:</span>
              <span className="ml-2 font-medium text-gray-900">
                {bus.driverName}
              </span>
            </div>
          </div>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Delete Bus
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-3">
                Are you sure you want to delete this bus?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeleteBus;
