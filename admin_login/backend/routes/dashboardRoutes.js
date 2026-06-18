const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/stats", protect, adminOnly, getDashboardStats);

module.exports = router;
