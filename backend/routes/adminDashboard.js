const express = require("express");
const { getDashboardStats } = require("../controllers/adminDashboardController");
const { protectAdmin } = require("../middleware/adminAuth");
const { adminOnly } = require("../middleware/adminRole");

const router = express.Router();

router.get("/stats", protectAdmin, adminOnly, getDashboardStats);

module.exports = router;
