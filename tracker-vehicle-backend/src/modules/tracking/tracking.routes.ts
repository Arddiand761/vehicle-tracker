import { Router } from 'express';
import { getLiveAll, getLiveByVehicle } from './tracking.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/live', authenticate, getLiveAll);
router.get('/live/:vehicleId', authenticate, getLiveByVehicle);

export default router;