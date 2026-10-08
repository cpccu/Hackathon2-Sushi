import { Request, Response, NextFunction } from 'express';
import * as resourceService from '../services/resource.service.js';
import { uploadDocumentToCloudinary } from '../services/upload.service.js';
import {
  createResourceSchema,
  voteResourceSchema,
  listResourcesQuerySchema,
} from '../schemas/resource.schema.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';

export async function listResources(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedQuery = await listResourcesQuerySchema.parseAsync(req.query);
    const data = await resourceService.getResources(validatedQuery, req.user?.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function getResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { resourceId } = req.params;
    const data = await resourceService.getResourceById(resourceId, req.user?.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function createResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const validatedInput = await createResourceSchema.parseAsync(req.body);
    const data = await resourceService.createResource(req.user.id, validatedInput);

    res.status(201).json({
      success: true,
      message: 'Resource released successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const { resourceId } = req.params;
    await resourceService.deleteResource(resourceId, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyResources(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const data = await resourceService.getMyResources(req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function voteResource(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required to vote');
    }

    const { resourceId } = req.params;
    const validated = await voteResourceSchema.parseAsync(req.body);

    const data = await resourceService.voteResource(
      resourceId,
      req.user.id,
      validated.vote_type
    );

    res.status(200).json({
      success: true,
      message: 'Vote recorded',
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new BadRequestError('No document file uploaded');
    }

    const originalName = req.file.originalname;
    const ext = originalName.split('.').pop()?.toLowerCase() || '';
    const size = req.file.size;

    const { file_url, file_type } = await uploadDocumentToCloudinary(
      req.file.buffer,
      originalName,
      'campus_resources'
    );

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        file_url,
        file_type: file_type || ext,
        file_name: originalName,
        file_size: size,
      },
    });
  } catch (err) {
    next(err);
  }
}
