import { Router } from 'express';
import {
  listEvents,
  getEventDetail,
  registerForEvent,
  getMyEvents,
} from '../controllers/event.controller.js';
import { optionalAuth, requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';
import { listEventsQuerySchema } from '../schemas/event.schema.js';
import { registerEventSchema } from '../schemas/registration.schema.js';

const router = Router();

// Public listing & details
router.get('/', validateQuery(listEventsQuerySchema), listEvents);
router.get('/my-events', requireAuth, requireRole('student'), getMyEvents);
router.get('/:eventId', optionalAuth, getEventDetail);

// Student registration
router.post(
  '/:eventId/register',
  requireAuth,
  requireRole('student'),
  validateBody(registerEventSchema),
  registerForEvent
);

export default router;
