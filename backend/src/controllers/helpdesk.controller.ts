import { Request, Response, NextFunction } from 'express';
import * as helpdeskService from '../services/helpdesk.service.js';
import { uploadDocumentToCloudinary } from '../services/upload.service.js';
import {
  createHelpdeskPostSchema,
  updateHelpdeskPostSchema,
  listHelpdeskQuerySchema,
} from '../schemas/helpdesk.schema.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';

// GET /api/v1/helpdesk
export async function listPosts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = await listHelpdeskQuerySchema.parseAsync(req.query);
    const data = await helpdeskService.getHelpdeskPosts(validated);

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/helpdesk/:postId
export async function getPost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { postId } = req.params;
    const data = await helpdeskService.getHelpdeskPostById(postId);

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/helpdesk (Helpdesk Admin)
export async function createPost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const validated = await createHelpdeskPostSchema.parseAsync(req.body);
    const data = await helpdeskService.createHelpdeskPost(req.user.id, validated);

    res.status(201).json({
      success: true,
      message: 'Helpdesk post created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/helpdesk/:postId (Helpdesk Admin)
export async function updatePost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { postId } = req.params;
    const validated = await updateHelpdeskPostSchema.parseAsync(req.body);
    const data = await helpdeskService.updateHelpdeskPost(postId, req.user.id, validated);

    res.status(200).json({
      success: true,
      message: 'Helpdesk post updated successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/helpdesk/:postId (Helpdesk Admin)
export async function deletePost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { postId } = req.params;
    const data = await helpdeskService.deleteHelpdeskPost(postId);

    res.status(200).json({
      success: true,
      message: 'Helpdesk post deleted successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/helpdesk/upload-attachment (Helpdesk Admin)
export async function uploadAttachment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const originalName = req.file.originalname;
    const ext = originalName.split('.').pop()?.toLowerCase() || '';
    const size = req.file.size;

    const { file_url, file_type } = await uploadDocumentToCloudinary(
      req.file.buffer,
      originalName,
      'campus_helpdesk'
    );

    res.status(200).json({
      success: true,
      message: 'Attachment uploaded successfully',
      data: {
        file_url,
        file_type: file_type || ext,
        title: originalName,
        file_size: size,
      },
    });
  } catch (err) {
    next(err);
  }
}
