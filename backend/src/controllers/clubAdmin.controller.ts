import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/event.service.js';
import { uploadImageToCloudinary } from '../services/upload.service.js';
import { ForbiddenError } from '../utils/errors.js';
import { createEventSchema, updateEventSchema } from '../schemas/event.schema.js';

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.club_id) {
      throw new ForbiddenError('No club associated with your admin account');
    }
    const data = await eventService.getClubDashboard(req.user.club_id);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.club_id) {
      throw new ForbiddenError('No club associated with your admin account');
    }

    let coverImageUrl: string | null = null;
    if (req.file) {
      coverImageUrl = await uploadImageToCloudinary(req.file.buffer, 'events');
    }

    const validatedInput = await createEventSchema.parseAsync(req.body);

    const event = await eventService.createClubEvent(
      req.user.club_id,
      validatedInput,
      coverImageUrl
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.club_id) {
      throw new ForbiddenError('No club associated with your admin account');
    }

    const { eventId } = req.params;
    const validatedInput = await updateEventSchema.parseAsync(req.body);

    const event = await eventService.updateClubEvent(
      req.user.club_id,
      eventId,
      validatedInput
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

export async function getParticipants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.club_id) {
      throw new ForbiddenError('No club associated with your admin account');
    }

    const { eventId } = req.params;
    const search = req.query.search as string | undefined;

    const data = await eventService.getClubEventParticipants(
      req.user.club_id,
      eventId,
      search
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}
