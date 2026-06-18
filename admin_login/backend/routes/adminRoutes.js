const express = require("express");
const {
  loginAdmin,
  getAdminProfile,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/profile", protect, adminOnly, getAdminProfile);

module.exports = router;
