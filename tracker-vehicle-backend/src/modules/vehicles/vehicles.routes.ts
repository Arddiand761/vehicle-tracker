import { Router } from 'express';
import { getAll, getOne, create, update, remove, assign, unassign } from './vehicles.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getOne);
router.post('/', authenticate, authorize('admin', 'operator'), create);
router.put('/:id', authenticate, authorize('admin', 'operator'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);
router.post('/:id/assign-driver', authenticate, authorize('admin', 'operator'), assign);
router.post('/:id/unassign-driver', authenticate, authorize('admin', 'operator'), unassign);

export default router;