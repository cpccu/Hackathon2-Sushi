import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import eventRoutes from './event.routes.js';
import clubAdminRoutes from './clubAdmin.routes.js';
import checkinRoutes from './checkin.routes.js';
import resourceRoutes from './resource.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/club-admin', clubAdminRoutes);
router.use('/check-in', checkinRoutes);
router.use('/resources', resourceRoutes);

export default router;
