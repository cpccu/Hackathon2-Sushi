import { Router } from 'express';
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  uploadAttachment,
} from '../controllers/helpdesk.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';
import { requireHelpdeskAdmin } from '../middlewares/role.middleware.js';
import { uploadResourceDocument } from '../middlewares/upload.middleware.js';

const router = Router();

// Public / optional-auth read routes
router.get('/', optionalAuth, listPosts);
router.get('/:postId', optionalAuth, getPost);

// Helpdesk Admin attachment upload
router.post(
  '/upload-attachment',
  requireAuth,
  requireHelpdeskAdmin,
  uploadResourceDocument.single('file'),
  uploadAttachment
);

// Helpdesk Admin management routes
router.post('/', requireAuth, requireHelpdeskAdmin, createPost);
router.patch('/:postId', requireAuth, requireHelpdeskAdmin, updatePost);
router.delete('/:postId', requireAuth, requireHelpdeskAdmin, deletePost);

export default router;
