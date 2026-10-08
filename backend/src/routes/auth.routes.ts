import { Router } from 'express';
import { signup, login, logout, getMe } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { signupSchema, loginSchema } from '../schemas/auth.schema.js';
import { optionalAuth, requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/signup', validateBody(signupSchema), signup);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', requireAuth, logout);
router.get('/me', optionalAuth, getMe);

export default router;
