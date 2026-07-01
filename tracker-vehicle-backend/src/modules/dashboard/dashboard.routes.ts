import { Router } from 'express';
import { summary, fleetStats, recentAlerts } from './dashboard.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/summary', authenticate, summary);
router.get('/fleet-stats', authenticate, fleetStats);
router.get('/recent-alerts', authenticate, recentAlerts);

export default router;