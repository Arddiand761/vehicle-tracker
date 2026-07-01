import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv"
import driverRoutes from './modules/drivers/drivers.routes';
import vehicleRoutes from './modules/vehicles/vehicles.routes';
import authRoutes from './modules/auth/auth.routes';
import tripRoutes from './modules/trips/trips.routes';
import trackingRoutes from './modules/tracking/tracking.routes';
import { startSimulator } from './modules/tracking/tracking.simulator';
import alertRoutes from './modules/alerts/alerts.routes';
import geofenceRoutes from './modules/geofences/geofences.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import dashboardRoutes from './modules/dashboard/dashboard.routes';


dotenv.config();

const app = express();

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/tracking', trackingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/geofences', geofenceRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));




// health check
app.get('/health', async (req, res) => {
  try {
    const pool = (await import('./config/db')).default;
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// routes (akan diisi bertahap)
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/geofences', geofenceRoutes);
app.use('/api/dashboard', dashboardRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startSimulator();
});

export default app;