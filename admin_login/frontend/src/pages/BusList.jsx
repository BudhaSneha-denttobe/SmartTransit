import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getBusesService, deleteBusService } from "../services/busService";
import toast from "react-hot-toast";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import WeatherBadge from "../components/WeatherBadge";

const ITEMS_PER_PAGE = 8;

const BusList = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await getBusesService(params);
      setBuses(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

  const handleDelete = async (id) => {
    try {
      await deleteBusService(id);
      toast.success("Bus deleted successfully");
      fetchBuses();
      setDeleteModal(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
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

  const totalPages = Math.ceil(buses.length / ITEMS_PER_PAGE);
  const paginatedBuses = buses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bus List</h1>
          <p className="text-gray-500">
            {buses.length} bus{buses.length !== 1 ? "es" : ""} found
          </p>
        </div>
        <Link
          to="/add-bus"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Add Bus
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by bus number, source or destination..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="Express">Express</option>
            <option value="AC">AC</option>
            <option value="Sleeper">Sleeper</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Delayed">Delayed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
        </div>
      ) : paginatedBuses.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Bus Number
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Destination
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Driver
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Weather
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedBuses.map((bus) => (
                  <tr key={bus._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {bus.busNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{bus.busName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {bus.busType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{bus.source}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {bus.destination}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {bus.driverName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                          bus.status
                        )}`}
                      >
                        {bus.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <WeatherBadge source={bus.source} destination={bus.destination} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/buses`}
                          onClick={() =>
                            toast("View feature coming soon", { icon: "ℹ️" })
                          }
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <HiOutlineEye className="text-lg" />
                        </Link>
                        <Link
                          to={`/update-bus/${bus._id}`}
                          className="p-1.5 text-gray-400 hover:text-amber-600 transition-colors"
                        >
                          <HiOutlinePencilSquare className="text-lg" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal(bus)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <HiOutlineTrash className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <HiOutlineChevronLeft className="text-lg" />
                </button>
                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <HiOutlineChevronRight className="text-lg" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No buses found</p>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-1">
              Are you sure you want to delete this bus?
            </p>
            <p className="font-medium text-gray-800 mb-6">
              {deleteModal.busNumber} - {deleteModal.busName}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal._id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusList;
