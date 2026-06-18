const express = require("express");
const {
  addBus,
  getBuses,
  getBusById,
  getBusByNumber,
  updateBus,
  deleteBus,
} = require("../controllers/busController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.route("/").get(protect, adminOnly, getBuses);
router.route("/add").post(protect, adminOnly, addBus);
router.route("/number/:busNumber").get(protect, adminOnly, getBusByNumber);
router
  .route("/:id")
  .get(protect, adminOnly, getBusById)
  .put(protect, adminOnly, updateBus)
  .delete(protect, adminOnly, deleteBus);

module.exports = router;
