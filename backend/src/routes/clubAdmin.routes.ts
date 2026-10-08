import { Router } from 'express';
import {
  getDashboard,
  createEvent,
  updateEvent,
  getParticipants,
} from '../controllers/clubAdmin.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireClubAdmin } from '../middlewares/role.middleware.js';
import { uploadCoverImage } from '../middlewares/upload.middleware.js';

const router = Router();

// All routes require authenticated club admin
router.use(requireAuth, requireClubAdmin);

router.get('/dashboard', getDashboard);
router.post('/events', uploadCoverImage.single('cover_image'), createEvent);
router.patch('/events/:eventId', updateEvent);
router.get('/events/:eventId/participants', getParticipants);

export default router;
