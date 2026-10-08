import { Request, Response, NextFunction } from 'express';
import * as checkinService from '../services/checkin.service.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function getRegistrationInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { registrationId } = req.params;
    const details = await checkinService.getCheckInDetails(registrationId, req.user);
    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (err) {
    next(err);
  }
}

export async function processCheckIn(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Please log in to perform check-in');
    }
    const { registrationId } = req.params;
    const result = await checkinService.performCheckIn(registrationId, req.user);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
