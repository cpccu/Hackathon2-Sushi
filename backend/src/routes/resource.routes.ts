import { Router } from 'express';
import {
  listResources,
  getResource,
  createResource,
  deleteResource,
  getMyResources,
  voteResource,
  uploadDocument,
} from '../controllers/resource.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';
import { uploadResourceDocument } from '../middlewares/upload.middleware.js';

const router = Router();

// Public / optional-auth listings
router.get('/', optionalAuth, listResources);

// Authenticated user's uploaded resources (must be placed before /:resourceId)
router.get('/my', requireAuth, getMyResources);

// Upload a single document to Cloudinary (returns file_url and metadata)
router.post(
  '/upload-doc',
  requireAuth,
  uploadResourceDocument.single('document'),
  uploadDocument
);

// Release a new resource
router.post('/', requireAuth, createResource);

// Resource detail by ID
router.get('/:resourceId', optionalAuth, getResource);

// Cast or toggle vote
router.post('/:resourceId/vote', requireAuth, voteResource);

// Delete resource (uploader only)
router.delete('/:resourceId', requireAuth, deleteResource);

export default router;
