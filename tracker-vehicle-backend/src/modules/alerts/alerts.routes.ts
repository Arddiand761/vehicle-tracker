import { Router } from 'express';
import { getAll, readOne, readAll, unreadCount } from './alerts.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getAll);
router.get('/unread-count', authenticate, unreadCount);
router.put('/:id/read', authenticate, readOne);
router.put('/read-all', authenticate, readAll);

export default router;