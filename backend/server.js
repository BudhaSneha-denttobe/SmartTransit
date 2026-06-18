const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { getSimulator } = require('./services/busSimulation');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/stops', require('./routes/stops'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/assistant', require('./routes/assistant'));
app.use('/api/chat', require('./routes/chatbot'));

const frontendDist = path.join(__dirname, '../frontend/dist');
if (require('fs').existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    } else {
      next();
    }
  });
  console.log('Serving frontend from dist/');
}
app.use('/api/admin', require('./routes/admin'));
app.use('/api/bus', require('./routes/busTracking'));
app.use('/api/route-planner', require('./routes/routePlanner'));
app.use('/api/search-history', require('./routes/searchHistory'));

app.use('/api/admin-auth', require('./routes/adminAuth'));
app.use('/api/admin-buses', require('./routes/adminBuses'));
app.use('/api/admin-dashboard', require('./routes/adminDashboard'));
app.use('/api/main-admin-buses', require('./routes/mainAdminBuses'));


app.get('/api/buses/live', async (req, res) => {
  try {
    const simulator = getSimulator();
    const positions = simulator.getPositions();
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
let server = null;

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
});

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);
      try {
        const simulator = getSimulator();
        await simulator.initialize();
        simulator.start(3000);
        console.log('Bus simulation started');
      } catch (err) {
        console.error('Bus simulation initialization failed:', err.message);
      }
    });
  } catch (error) {
    console.error(`Server startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', () => {
  const simulator = getSimulator();
  simulator.stop();
  if (server) {
    server.close();
  }
  process.exit(0);
});
