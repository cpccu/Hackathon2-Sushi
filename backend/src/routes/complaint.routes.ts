import { Router } from 'express';
import {
  listComplaints,
  getComplaint,
  createComplaint,
  uploadAttachment,
  addResponse,
} from '../controllers/complaint.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';
import { requireHelpdeskAdmin } from '../middlewares/role.middleware.js';
import { uploadResourceDocument } from '../middlewares/upload.middleware.js';

const router = Router();

// Public / optional-auth read routes
router.get('/', optionalAuth, listComplaints);
router.get('/:complaintId', optionalAuth, getComplaint);

// Student — upload attachment for a complaint
router.post(
  '/upload-attachment',
  requireAuth,
  uploadResourceDocument.single('file'),
  uploadAttachment
);

// Student — submit a complaint (identity NOT recorded)
router.post('/', requireAuth, createComplaint);

// Helpdesk Admin — add a response (immutable after submit)
router.post('/:complaintId/responses', requireAuth, requireHelpdeskAdmin, addResponse);

export default router;
