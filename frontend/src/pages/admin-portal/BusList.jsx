import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getBuses, deleteBus } from "../../services/adminBusService";
import toast from "react-hot-toast";
import AdminWeatherBadge from "../../components/admin/WeatherBadge";

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
      const data = await getBuses(params);
      setBuses(data);
    } catch {
      /* handled by interceptor */
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
      await deleteBus(id);
      toast.success("Bus deleted successfully");
      fetchBuses();
      setDeleteModal(null);
    } catch (error) {
      toast.error(error.message || "Delete failed");
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
          <p className="text-gray-500">{buses.length} bus{buses.length !== 1 ? "es" : ""} found</p>
        </div>
        <Link to="/admin-portal/add-bus" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          Add Bus
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by bus number, source or destination..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option value="">All Types</option>
            <option value="Express">Express</option>
            <option value="AC">AC</option>
            <option value="Sleeper">Sleeper</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
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
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Bus Number</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Source</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Destination</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Driver</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Weather</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedBuses.map((bus) => (
                  <tr key={bus._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{bus.busNumber}</td>
                    <td className="px-4 py-3 text-gray-700">{bus.busName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{bus.busType}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{bus.source}</td>
                    <td className="px-4 py-3 text-gray-700">{bus.destination}</td>
                    <td className="px-4 py-3 text-gray-700">{bus.driverName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(bus.status)}`}>{bus.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <AdminWeatherBadge source={bus.source} destination={bus.destination} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin-portal/update-bus/${bus._id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <button onClick={() => setDeleteModal(bus._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-lg">delete</span>
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
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50">
                <span className="material-symbols-outlined text-lg">chevron_left</span> Previous
              </button>
              <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50">
                Next <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">directions_bus_off</span>
          <p className="text-gray-500">No buses found. Try adjusting your search.</p>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Bus</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this bus? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteModal)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusList;
