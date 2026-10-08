import { Request, Response, NextFunction } from 'express';
import * as lostFoundService from '../services/lostFound.service.js';
import { uploadImageToCloudinary } from '../services/upload.service.js';
import {
  createLostFoundSchema,
  updateLostFoundSchema,
  updateStatusSchema,
  listLostFoundQuerySchema,
} from '../schemas/lostFound.schema.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';

// GET /api/lost-found
export async function listPosts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = await listLostFoundQuerySchema.parseAsync(req.query);
    const data = await lostFoundService.getLostFoundPosts(validated);

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// GET /api/lost-found/my
export async function getMyPosts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const data = await lostFoundService.getMyLostFoundPosts(req.user.id);

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// GET /api/lost-found/:postId
export async function getPost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { postId } = req.params;
    const data = await lostFoundService.getLostFoundPostById(postId);

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// POST /api/lost-found/upload-image
// Multer has already placed the file in req.file via route middleware
export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new BadRequestError('No image file uploaded');
    }

    const imageUrl = await uploadImageToCloudinary(
      req.file.buffer,
      'campus_lost_found'
    );

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { image_url: imageUrl },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/lost-found/upload-images
// Multer puts files in req.files (array)
export async function uploadImages(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
    if (!files || files.length === 0) {
      throw new BadRequestError('At least one image file must be uploaded');
    }
    if (files.length > 3) {
      throw new BadRequestError('Maximum 3 images allowed');
    }

    const uploadPromises = files.map((file) =>
      uploadImageToCloudinary(file.buffer, 'campus_lost_found')
    );
    const imageUrls = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: { image_urls: imageUrls },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/lost-found
export async function createPost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const validated = await createLostFoundSchema.parseAsync(req.body);
    const data = await lostFoundService.createLostFoundPost(req.user.id, validated);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/lost-found/:postId
export async function updatePost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { postId } = req.params;
    const validated = await updateLostFoundSchema.parseAsync(req.body);
    const data = await lostFoundService.updateLostFoundPost(postId, req.user.id, validated);

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/lost-found/:postId/status
export async function resolvePost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { postId } = req.params;
    await updateStatusSchema.parseAsync(req.body);
    const data = await lostFoundService.resolveLostFoundPost(postId, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Post marked as resolved',
      data,
    });
  } catch (err) {
    next(err);
  }
}
