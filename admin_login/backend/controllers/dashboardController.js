const Bus = require("../models/Bus");

const getDashboardStats = async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: "Active" });

    const routeData = await Bus.aggregate([
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

    const driverCount = await Bus.distinct("driverName");
    const totalDrivers = driverCount.length;

    const recentBuses = await Bus.find().sort({ createdAt: -1 }).limit(5);

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
