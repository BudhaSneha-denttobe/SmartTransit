const express = require("express");
const {
  loginAdmin,
  getAdminProfile,
} = require("../controllers/adminAuthController");
const { protectAdmin } = require("../middleware/adminAuth");
const { adminOnly } = require("../middleware/adminRole");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/profile", protectAdmin, adminOnly, getAdminProfile);

module.exports = router;
