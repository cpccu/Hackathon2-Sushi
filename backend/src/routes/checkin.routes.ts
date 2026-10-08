import { Router } from 'express';
import {
  getRegistrationInfo,
  processCheckIn,
} from '../controllers/checkin.controller.js';
import { optionalAuth, requireAuth } from '../middlewares/auth.middleware.js';
import { requireClubAdmin } from '../middlewares/role.middleware.js';

const router = Router();

// Retrieve registration details for check-in view
router.get('/:registrationId', optionalAuth, getRegistrationInfo);

// Perform check-in (authorized club admin only)
router.post('/:registrationId', requireAuth, requireClubAdmin, processCheckIn);

export default router;
