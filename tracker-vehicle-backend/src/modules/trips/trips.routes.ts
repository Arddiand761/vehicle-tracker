import { Router } from 'express';
import { getAll, getOne, getReport, start, end } from './trips.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getAll);
router.get('/report', authenticate, getReport);
router.get('/:id', authenticate, getOne);
router.post('/start', authenticate, authorize('admin', 'operator'), start);
router.post('/:id/end', authenticate, authorize('admin', 'operator'), end);

export default router;