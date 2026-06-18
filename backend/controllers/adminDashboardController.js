const BusManagement = require("../models/BusManagement");

const getDashboardStats = async (req, res) => {
  try {
    const totalBuses = await BusManagement.countDocuments();
    const activeBuses = await BusManagement.countDocuments({ status: "Active" });

    const routeData = await BusManagement.aggregate([
      {
        $group: {
          _id: { source: "$source", destination: "$destination" },
        },
      },
      {
        $count: "totalRoutes",
      },
    ]);

    const totalRoutes =
      routeData.length > 0 ? routeData[0].totalRoutes : 0;

    const driverCount = await BusManagement.distinct("driverName");
    const totalDrivers = driverCount.length;

    const recentBuses = await BusManagement.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalBuses,
      activeBuses,
      totalRoutes,
      totalDrivers,
      recentBuses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
