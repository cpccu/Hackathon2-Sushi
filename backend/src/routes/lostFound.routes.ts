import { Router } from 'express';
import {
  listPosts,
  getMyPosts,
  getPost,
  uploadImage,
  uploadImages,
  createPost,
  updatePost,
  resolvePost,
} from '../controllers/lostFound.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';
import { uploadCoverImage } from '../middlewares/upload.middleware.js';

const router = Router();

// Public / optional-auth listings
router.get('/', optionalAuth, listPosts);

// Authenticated user's own posts (must be before /:postId)
router.get('/my', requireAuth, getMyPosts);

// Upload a single image to Cloudinary (returns image_url)
router.post(
  '/upload-image',
  requireAuth,
  uploadCoverImage.single('image'),
  uploadImage
);

// Upload multiple images (up to 3) to Cloudinary (returns image_urls)
router.post(
  '/upload-images',
  requireAuth,
  uploadCoverImage.array('images', 3),
  uploadImages
);

// Create a new Lost / Found post
router.post('/', requireAuth, createPost);

// Get a single post by ID
router.get('/:postId', optionalAuth, getPost);

// Edit post details (creator only)
router.patch('/:postId', requireAuth, updatePost);

// Mark post as resolved (creator only)
router.patch('/:postId/status', requireAuth, resolvePost);

// NOTE: No DELETE route — posts cannot be deleted by design.

export default router;
