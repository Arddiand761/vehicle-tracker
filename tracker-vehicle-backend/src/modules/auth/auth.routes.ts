import { Router } from 'express';
import { register, login, getUsers } from './auth.controller';
import { authenticate } from '../../middleware/auth';



const router = Router();

router.get('/users', authenticate, getUsers);

router.post('/register', register);
router.post('/login', login);

export default router;