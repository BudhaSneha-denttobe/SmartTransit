import { useState, useEffect } from "react";
import { getDashboardStats } from "../services/dashboardService";
import { HiOutlineTruck, HiOutlineCheckCircle, HiOutlineMapPin, HiOutlineUser } from "react-icons/hi2";
import { Link } from "react-router-dom";
import WeatherBadge from "../components/WeatherBadge";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      label: "Total Buses",
      value: stats?.totalBuses ?? 0,
      icon: HiOutlineTruck,
      gradient: "from-blue-500 to-blue-700",
    },
    {
      label: "Active Buses",
      value: stats?.activeBuses ?? 0,
      icon: HiOutlineCheckCircle,
      gradient: "from-emerald-500 to-emerald-700",
    },
    {
      label: "Total Routes",
      value: stats?.totalRoutes ?? 0,
      icon: HiOutlineMapPin,
      gradient: "from-purple-500 to-purple-700",
    },
    {
      label: "Total Drivers",
      value: stats?.totalDrivers ?? 0,
      icon: HiOutlineUser,
      gradient: "from-amber-500 to-amber-700",
    },
  ];

  const getStatusBadge = (status) => {
    const colors = {
      Active: "bg-emerald-100 text-emerald-800",
      Delayed: "bg-amber-100 text-amber-800",
      Cancelled: "bg-red-100 text-red-800",
      Maintenance: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your transit system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <card.icon className="text-4xl opacity-30" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Buses
          </h2>
          <Link
            to="/buses"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            View All
          </Link>
        </div>
        {stats?.recentBuses?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-3 font-medium">Bus Number</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Route</th>
                  <th className="pb-3 font-medium">Weather</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBuses.map((bus) => (
                  <tr key={bus._id} className="border-b border-gray-100">
                    <td className="py-3 font-medium text-gray-900">
                      {bus.busNumber}
                    </td>
                    <td className="py-3 text-gray-700">{bus.busName}</td>
                    <td className="py-3 text-gray-700">
                      {bus.source} → {bus.destination}
                    </td>
                    <td className="py-3">
                      <WeatherBadge source={bus.source} destination={bus.destination} />
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                          bus.status
                        )}`}
                      >
                        {bus.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No buses added yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
