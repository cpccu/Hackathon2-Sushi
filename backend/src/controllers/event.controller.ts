import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/event.service.js';
import * as registrationService from '../services/registration.service.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await eventService.getPublicEvents(req.query as any);
    res.status(200).json({
      success: true,
      data: result.events,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function getEventDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { eventId } = req.params;
    const event = await eventService.getEventById(eventId, req.user);
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

export async function registerForEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Please log in to register');
    }
    const { eventId } = req.params;
    const result = await registrationService.registerForEvent(eventId, req.user, req.body);
    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Please log in to view your events');
    }
    const events = await registrationService.getStudentMyEvents(req.user.id);
    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (err) {
    next(err);
  }
}
