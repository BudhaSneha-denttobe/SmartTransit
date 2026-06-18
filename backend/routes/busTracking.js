const express = require('express');
const router = express.Router();
const trackBusService = require('../services/trackBusService');

router.get('/track/:busNumber', async (req, res) => {
  try {
    const { busNumber } = req.params;
    const data = await trackBusService.getBusTrackingData(busNumber);
    if (!data) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/track/:busNumber/reset', (req, res) => {
  const { busNumber } = req.params;
  trackBusService.resetSimulation(busNumber);
  res.json({ message: 'Simulation reset' });
});

module.exports = router;
