import { Router } from 'express';
import { getAll, getOne, getTripHistory, create, update, remove } from './drivers.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getOne);
router.get('/:id/history', authenticate, getTripHistory);
router.post('/', authenticate, authorize('admin', 'operator'), create);
router.put('/:id', authenticate, authorize('admin', 'operator'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

export default router;