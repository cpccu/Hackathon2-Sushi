import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { updateProfileSchema } from '../schemas/user.schema.js';

const router = Router();

router.use(requireAuth);
router.get('/profile', getProfile);
router.put('/profile', validateBody(updateProfileSchema), updateProfile);

export default router;
