const express = require("express");
const {
  addBus,
  getBuses,
  getBusById,
  getBusByNumber,
  updateBus,
  deleteBus,
} = require("../controllers/adminBusController");
const { protectAdmin } = require("../middleware/adminAuth");
const { adminOnly } = require("../middleware/adminRole");

const router = express.Router();

router.route("/").get(protectAdmin, adminOnly, getBuses);
router.route("/add").post(protectAdmin, adminOnly, addBus);
router.route("/number/:busNumber").get(protectAdmin, adminOnly, getBusByNumber);
router
  .route("/:id")
  .get(protectAdmin, adminOnly, getBusById)
  .put(protectAdmin, adminOnly, updateBus)
  .delete(protectAdmin, adminOnly, deleteBus);

module.exports = router;
